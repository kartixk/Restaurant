const prisma = require("../prismaClient");

const toTitleCase = (str = "") =>
    str
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const getAllProducts = async (branchId = null) => {
    const where = branchId ? { branchId } : {};
    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { branch: { select: { name: true } } }
    });

    return products.map((p) => ({
        ...p,
        _id: p.id,
        branchName: p.branch?.name
    }));
};

const upsertProduct = async (data) => {
    const formattedName = toTitleCase(data.name);

    if (!data.branchId) {
        throw new Error("Branch ID is required to add or update a product");
    }

    const isAvailable = data.isAvailable !== undefined ? data.isAvailable === "true" || data.isAvailable === true : true;

    const product = await prisma.product.upsert({
        where: {
            id: data.id || "000000000000000000000000"
        },
        update: {
            name: formattedName,
            description: data.description || null,
            price: data.price,
            category: data.category,
            isAvailable: isAvailable,
            imageUrl: data.imageUrl,
            branchId: data.branchId
        },
        create: {
            name: formattedName,
            description: data.description || null,
            price: data.price,
            category: data.category,
            isAvailable: isAvailable,
            imageUrl: data.imageUrl,
            branchId: data.branchId
        },
    });
    return product;
};

const updateProductById = async (id, data) => {
    const updateData = { ...data };
    if (updateData.name) {
        updateData.name = toTitleCase(updateData.name);
    }

    if (updateData.isAvailable !== undefined) {
        updateData.isAvailable = updateData.isAvailable === "true" || updateData.isAvailable === true;
    }

    // Remove old 'quantity' references if passed by frontend
    if ('quantity' in updateData) delete updateData.quantity;

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
    });

    return updatedProduct;
};

const deleteProductById = async (id) => {
    await prisma.product.delete({ where: { id } });
};

const purchaseProduct = async (productId, userId, quantityToBuy) => {
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });

        if (!product || !product.isAvailable) {
            throw new Error("Purchase failed: product is currently unavailable or not found");
        }

        const totalPrice = product.price * quantityToBuy;

        const updatedProduct = product;

        await tx.order.create({
            data: {
                userId: userId,
                branchId: product.branchId,
                orderTotal: totalPrice,
                orderType: "TAKEAWAY", // Default for direct purchase
                status: "RECEIVED",
                items: [
                    {
                        productId: product.id,
                        productName: product.name,
                        price: product.price,
                        quantity: quantityToBuy,
                        totalPrice: totalPrice,
                    }
                ]
            },
        });

        return updatedProduct;
    });
};

const setProductAvailability = async (productId, isAvailable) => {
    const product = await prisma.product.update({
        where: { id: productId },
        data: { isAvailable: isAvailable },
    });
    return product;
};

// Kept for backwards compatibility but changed to availability
const restockProduct = async (productId, quantity) => {
    return setProductAvailability(productId, true);
};

module.exports = {
    getAllProducts,
    upsertProduct,
    updateProductById,
    deleteProductById,
    purchaseProduct,
    restockProduct,
    setProductAvailability
};
