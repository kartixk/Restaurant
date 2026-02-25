const cartService = require("../services/cartService");

const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const cart = await cartService.getCart(userId);
        res.json(cart);
    } catch (err) {
        next(err);
    }
};

const addOrUpdateItem = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sweetId, quantity } = req.body;

        const cart = await cartService.addOrUpdateItem(userId, sweetId, quantity);
        res.json(cart);
    } catch (err) {
        if (err.message === "Sweet not found" || err.message === "Insufficient stock") {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
};

const updateItemQuantity = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sweetId } = req.params;
        const { quantity } = req.body;

        const cart = await cartService.updateItemQuantity(userId, sweetId, quantity);
        res.json(cart);
    } catch (err) {
        if (err.message === "Cart not found" || err.message === "Item not found in cart") {
            return res.status(404).json({ message: err.message });
        }
        if (err.message.includes("Insufficient stock")) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
};

const removeItem = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sweetId } = req.params;

        const cart = await cartService.removeItem(userId, sweetId);
        res.json(cart);
    } catch (err) {
        if (err.message === "Cart not found") {
            return res.status(404).json({ message: err.message });
        }
        next(err);
    }
};

const confirmOrder = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await cartService.confirmOrder(userId);
        res.json(result);
    } catch (err) {
        if (err.message === "Cart is empty" || err.message.includes("not found") || err.message.includes("Insufficient stock")) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
};

const buyNow = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sweetId, quantity } = req.body;

        const result = await cartService.buyNow(userId, sweetId, quantity);
        res.json(result);
    } catch (err) {
        if (err.message === "Sweet not found") {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === "Insufficient stock") {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
};

module.exports = {
    getCart,
    addOrUpdateItem,
    updateItemQuantity,
    removeItem,
    confirmOrder,
    buyNow
};
