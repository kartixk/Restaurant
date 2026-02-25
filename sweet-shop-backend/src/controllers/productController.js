const productService = require("../services/productService");

const getAllProducts = async (req, res, next) => {
    try {
        const { branchId } = req.query;
        const products = await productService.getAllProducts(branchId);
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
};

const upsertProduct = async (req, res, next) => {
    try {
        // If manager, we should ideally force the branchId from their profile
        // For now, take it from body
        const productData = { ...req.body };
        const product = await productService.upsertProduct(productData);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

const updateProductById = async (req, res, next) => {
    try {
        const updatedProduct = await productService.updateProductById(req.params.id, req.body);
        res.status(200).json(updatedProduct);
    } catch (err) {
        next(err);
    }
};

const deleteProductById = async (req, res, next) => {
    try {
        await productService.deleteProductById(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        next(err);
    }
};

const purchaseProduct = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { quantity } = req.body;

        const updatedProduct = await productService.purchaseProduct(req.params.id, userId, quantity);

        res.status(200).json({
            message: `Successfully purchased ${quantity} ${updatedProduct.name}`
        });
    } catch (err) {
        if (err.message.includes("insufficient stock")) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
};

const restockProduct = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const product = await productService.restockProduct(req.params.id, quantity);

        res.status(200).json({ message: "Restocked successfully", product });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: "Product not found" });
        }
        next(err);
    }
};

module.exports = {
    getAllProducts,
    upsertProduct,
    updateProductById,
    deleteProductById,
    purchaseProduct,
    restockProduct
};
