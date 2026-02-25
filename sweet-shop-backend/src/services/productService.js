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

    // Prisma Upsert scoped by name AND branchId to allow same item name in different branches
    const product = await prisma.product.upsert({
        where: {
            // MongoDB unique constraint was on Name only previously, 
            // but for multi-store we might want Name-Branch uniqueness
            id: data.id || "000000000000000000000000" // Use ID if provided, otherwise a dummy for new
        },
        update: {
            name: formattedName,
            price: data.price,
            category: data.category,
            quantity: data.quantity,
            imageUrl: data.imageUrl,
            branchId: data.branchId
        },
        create: {
            name: formattedName,
            price: data.price,
            category: data.category,
            quantity: data.quantity,
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

        if (!product || product.quantity < quantityToBuy) {
            throw new Error("Purchase failed: insufficient stock or product not found");
        }

        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: { quantity: { decrement: quantityToBuy } },
        });

        const totalPrice = updatedProduct.price * quantityToBuy;

        await tx.sales.create({
            data: {
                userId: userId,
                orderTotal: totalPrice,
                status: "PLACED",
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

const restockProduct = async (productId, quantity) => {
    const product = await prisma.product.update({
        where: { id: productId },
        data: { quantity: { increment: quantity } },
    });
    return product;
};

module.exports = {
    getAllProducts,
    upsertProduct,
    updateProductById,
    deleteProductById,
    purchaseProduct,
    restockProduct,
};
