const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.get("/sales", authMiddleware, reportController.getSalesReports);

module.exports = router;
