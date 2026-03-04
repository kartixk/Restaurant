const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Manager: Get orders for their branch
router.get("/my-branch-orders", authMiddleware, orderController.getMyBranchOrders);

// Manager: Update order status
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);

// Customer/Manager: Get order details by ID
router.get("/:id", authMiddleware, orderController.getOrderById);

module.exports = router;
