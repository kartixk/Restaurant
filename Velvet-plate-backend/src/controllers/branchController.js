const branchService = require("../services/branchService");
const cloudinary = require("../config/cloudinary");

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

        if (!branch) {

            return res.json(null); // Return 200 with null — frontend checks for this
        }


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

const onboardBranch = async (req, res, next) => {
    try {
        const branchData = { ...req.body, managerId: req.user.id || req.user._id };
        const branch = await branchService.onboardBranch(branchData);
        res.status(201).json(branch);
    } catch (err) {
        // Handle 5-day cooldown after rejection
        if (err.statusCode === 429) {
            return res.status(429).json({
                error: err.message,
                daysRemaining: err.daysRemaining
            });
        }
        // Handle Prisma unique constraint violation (e.g. restaurant name already taken)
        if (err.code === 'P2002') {
            const field = err.meta?.target?.[0];
            const message = field === 'name'
                ? 'A restaurant with this name already exists. Please choose a different name.'
                : 'This account is already linked to a branch. Please contact support.';
            return res.status(409).json({ error: message });
        }
        next(err);
    }
};


const toggleVisibility = async (req, res, next) => {
    try {
        const updatedBranch = await branchService.toggleVisibility(req.params.id, req.body.isVisible);
        res.status(200).json(updatedBranch);
    } catch (err) {
        next(err);
    }
};

const uploadDocuments = async (req, res, next) => {
    try {
        const files = req.files;
        const urls = {};

        if (files) {
            for (const key of Object.keys(files)) {
                const file = files[key][0];
                const subdir = file.fieldname === 'managerPhoto' ? 'profiles' : 'docs';
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: `sweet-shop/${subdir}`,
                    resource_type: 'auto'
                });

                urls[key] = result.secure_url;
            }
        }

        res.status(200).json({ urls });
    } catch (err) {
        next(err);
    }
};


const verifyBranch = async (req, res, next) => {
    try {
        const verifiedBranch = await branchService.verifyBranch(req.params.id, req.body.status);
        res.status(200).json(verifiedBranch);
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
    deleteBranch,
    onboardBranch,
    uploadDocuments,
    toggleVisibility,
    verifyBranch
};
