const branchService = require("../services/branchService");

const createBranch = async (req, res, next) => {
    try {
        const branch = await branchService.createBranch(req.body);
        res.status(201).json(branch);
    } catch (err) {
        next(err);
    }
};

const getAllBranches = async (req, res, next) => {
    try {
        const branches = await branchService.getBranches();
        res.status(200).json(branches);
    } catch (err) {
        next(err);
    }
};

const getBranchById = async (req, res, next) => {
    try {
        const branch = await branchService.getBranchById(req.params.id);
        if (!branch) return res.status(404).json({ message: "Branch not found" });
        res.status(200).json(branch);
    } catch (err) {
        next(err);
    }
};

const getMyBranch = async (req, res, next) => {
    try {
        const managerId = req.user.id || req.user._id;
        const branch = await branchService.getBranchByManagerId(managerId);
        if (!branch) return res.status(404).json({ message: "No branch assigned to this manager" });
        res.status(200).json(branch);
    } catch (err) {
        next(err);
    }
};

const updateBranch = async (req, res, next) => {
    try {
        const updatedBranch = await branchService.updateBranch(req.params.id, req.body);
        res.status(200).json(updatedBranch);
    } catch (err) {
        next(err);
    }
};

const deleteBranch = async (req, res, next) => {
    try {
        await branchService.deleteBranch(req.params.id);
        res.status(200).json({ message: "Branch deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    getMyBranch,
    updateBranch,
    deleteBranch
};
