const express = require("express");
const { authMiddleware, requireAdmin } = require("../middleware/auth");
const branchController = require("../controllers/branchController");

const router = express.Router();

// Admin Only - Full Branch CRUD
router.get("/", authMiddleware, requireAdmin, branchController.getAllBranches);
router.post("/", authMiddleware, requireAdmin, branchController.createBranch);
router.put("/:id", authMiddleware, requireAdmin, branchController.updateBranch);
router.delete("/:id", authMiddleware, requireAdmin, branchController.deleteBranch);

// Manager/Public Access
router.get("/my-branch", authMiddleware, branchController.getMyBranch);
router.get("/:id", branchController.getBranchById); // Public view of a store

module.exports = router;
