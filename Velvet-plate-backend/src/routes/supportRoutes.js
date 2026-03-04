const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const supportController = require("../controllers/supportController");

const router = express.Router();

// Manager: Trigger urgent support uplink
router.post("/uplink", authMiddleware, supportController.triggerUplink);

module.exports = router;
