const orderService = require("../services/orderService");

const getMyBranchOrders = async (req, res, next) => {
    try {
        const managerId = req.user.id || req.user._id;
        const orders = await orderService.getMyBranchOrders(managerId);
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (err) {
        next(err);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status);
        res.status(200).json(order);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyBranchOrders,
    getOrderById,
    updateOrderStatus
};
