const prisma = require("../prismaClient");

const getCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId }
    });
    return cart || { items: [], total: 0, orderType: "DINE_IN" };
};

const addOrUpdateItem = async (userId, productId, quantity) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    if (!product.isAvailable) {
        throw new Error("Product is currently unavailable");
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
                items: [],
                total: 0,
                orderType: "DINE_IN"
            }
        });
    }

    const items = [...cart.items];
    const index = items.findIndex(i => i.productId === productId);

    if (index > -1) {
        items[index].quantity = quantity;
        items[index].price = product.price;
    } else {
        items.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: quantity,
        });
    }

    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

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
    if (product && !product.isAvailable) {
        throw new Error("Product is currently unavailable");
    }

    items[itemIndex].quantity = quantity;
    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

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
    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items, total }
    });

    return updatedCart;
};

const updateOrderType = async (userId, orderType) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error("Cart not found");

    return await prisma.cart.update({
        where: { id: cart.id },
        data: { orderType }
    });
};

const confirmOrder = async (userId) => {
    return await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({ where: { userId } });

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        let orderTotal = 0;
        const orderItems = [];
        let branchId = null;

        for (const item of cart.items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });

            if (!product) {
                throw new Error(`${item.productName} not found`);
            }

            if (!product.isAvailable) {
                throw new Error(`${item.productName} is currently unavailable`);
            }

            // In a QSR, assume the cart belongs to a single branch. We take the branch from the first item.
            if (!branchId) branchId = product.branchId;

            const totalPrice = item.price * item.quantity;
            orderTotal += totalPrice;

            orderItems.push({
                productId: product.id,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                totalPrice
            });
        }

        // Save order
        const order = await tx.order.create({
            data: {
                userId,
                branchId,
                items: orderItems,
                orderTotal,
                orderType: cart.orderType || "DINE_IN",
                status: "RECEIVED"
            }
        });

        // Clear cart
        await tx.cart.update({
            where: { id: cart.id },
            data: { items: [], total: 0 }
        });

        return { message: "Order placed successfully 🎉", orderId: order.id };
    });
};

const buyNow = async (userId, productId, quantity, orderType = "TAKEAWAY") => {
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error("Product not found");

        if (!product.isAvailable) {
            throw new Error("Product is currently unavailable");
        }

        const totalPrice = product.price * quantity;

        const order = await tx.order.create({
            data: {
                userId,
                branchId: product.branchId,
                items: [{
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    quantity,
                    totalPrice
                }],
                orderTotal: totalPrice,
                orderType: orderType,
                status: "RECEIVED"
            }
        });

        return { message: "Order placed successfully 🎉", orderId: order.id };
    });
};

module.exports = {
    getCart,
    addOrUpdateItem,
    updateItemQuantity,
    removeItem,
    confirmOrder,
    buyNow,
    updateOrderType
};
