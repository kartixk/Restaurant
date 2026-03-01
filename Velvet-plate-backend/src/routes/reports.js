const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.get("/sales", authMiddleware, reportController.getSalesReports);
router.get("/branch-sales", authMiddleware, reportController.getBranchSalesReports);

module.exports = router;
