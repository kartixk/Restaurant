const prisma = require("../prismaClient");

const getCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId }
    });
    return cart || { items: [], total: 0 };
};

const addOrUpdateItem = async (userId, productId, quantity) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    if (quantity > product.quantity) {
        throw new Error("Insufficient stock");
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
                items: [],
                total: 0
            }
        });
    }

    const items = [...cart.items];
    const index = items.findIndex(i => i.productId === productId);

    if (index > -1) {
        items[index].selectedQuantity = quantity;
        items[index].availableQuantity = product.quantity;
        items[index].price = product.price;
    } else {
        items.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            selectedQuantity: quantity,
            availableQuantity: product.quantity
        });
    }

    const total = items.reduce((sum, i) => sum + i.selectedQuantity * i.price, 0);

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items, total }
    });

    return updatedCart;
};

const updateItemQuantity = async (userId, productId, quantity) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found");

    const items = [...cart.items];
    const itemIndex = items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
        throw new Error("Item not found in cart");
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product && product.quantity < quantity) {
        throw new Error(`Insufficient stock. Max available: ${product.quantity}`);
    }

    items[itemIndex].selectedQuantity = quantity;
    const total = items.reduce((sum, i) => sum + i.selectedQuantity * i.price, 0);

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items, total }
    });

    return updatedCart;
};

const removeItem = async (userId, productId) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found");

    const items = cart.items.filter(i => i.productId !== productId);
    const total = items.reduce((sum, i) => sum + i.selectedQuantity * i.price, 0);

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items, total }
    });

    return updatedCart;
};

const confirmOrder = async (userId) => {
    return await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({ where: { userId } });

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        let orderTotal = 0;
        const saleItems = [];

        for (const item of cart.items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });

            if (!product) {
                throw new Error(`${item.productName} not found`);
            }

            if (product.quantity < item.selectedQuantity) {
                throw new Error(`Insufficient stock for ${item.productName}`);
            }

            // Reduce stock
            await tx.product.update({
                where: { id: product.id },
                data: { quantity: { decrement: item.selectedQuantity } }
            });

            const totalPrice = item.price * item.selectedQuantity;
            orderTotal += totalPrice;

            saleItems.push({
                productId: product.id,
                productName: item.productName,
                price: item.price,
                quantity: item.selectedQuantity,
                totalPrice
            });
        }

        // Save sale
        await tx.sales.create({
            data: {
                userId,
                items: saleItems,
                orderTotal,
                status: "PLACED"
            }
        });

        // Clear cart
        await tx.cart.update({
            where: { id: cart.id },
            data: { items: [], total: 0 }
        });

        return { message: "Order confirmed successfully 🎉" };
    });
};

const buyNow = async (userId, productId, quantity) => {
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error("Product not found");

        if (product.quantity < quantity) {
            throw new Error("Insufficient stock");
        }

        await tx.product.update({
            where: { id: productId },
            data: { quantity: { decrement: quantity } }
        });

        const totalPrice = product.price * quantity;

        await tx.sales.create({
            data: {
                userId,
                items: [{
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    quantity,
                    totalPrice
                }],
                orderTotal: totalPrice,
                status: "PLACED"
            }
        });

        return { message: "Order placed successfully 🎉" };
    });
};

module.exports = {
    getCart,
    addOrUpdateItem,
    updateItemQuantity,
    removeItem,
    confirmOrder,
    buyNow
};
