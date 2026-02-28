const prisma = require("../prismaClient");
const { sendStoreVerifiedEmail, sendStoreStatusChangeEmail } = require("../utils/email");

const createBranch = async (data) => {
    // data: { name, location, address, phone, managerId }
    return await prisma.branch.create({
        data: {
            name: data.name,
            location: data.location,
            address: data.address,
            phone: data.phone,
            manager: {
                connect: { id: data.managerId }
            }
        },
        include: {
            manager: {
                select: { id: true, name: true, email: true, phone: true }
            }
        }
    });
};

const getBranches = async () => {
    return await prisma.branch.findMany({
        include: {
            manager: {
                select: { id: true, name: true, email: true, phone: true }
            },
            _count: {
                select: { products: true }
            }
        }
    });
};

const getBranchById = async (id) => {
    return await prisma.branch.findUnique({
        where: { id },
        include: {
            manager: {
                select: { id: true, name: true, email: true, phone: true }
            },
            products: true
        }
    });
};

const getBranchByManagerId = async (managerId) => {
    return await prisma.branch.findUnique({
        where: { managerId },
        include: {
            products: true
        }
    });
};

const updateBranch = async (id, data) => {
    // Get the current branch to detect status changes
    const currentBranch = await prisma.branch.findUnique({
        where: { id },
        include: { manager: { select: { email: true, name: true } } }
    });

    const updateData = { ...data };
    if (updateData.managerId) {
        const managerId = updateData.managerId;
        delete updateData.managerId;
        updateData.manager = { connect: { id: managerId } };
    }

    const updatedBranch = await prisma.branch.update({
        where: { id },
        data: updateData,
        include: {
            manager: {
                select: { id: true, name: true, email: true, phone: true }
            }
        }
    });

    // Send email notification if store status changed
    if (currentBranch && data.storeStatus && data.storeStatus !== currentBranch.storeStatus) {
        const managerEmail = updatedBranch.manager?.email || currentBranch.manager?.email;
        const managerName = updatedBranch.manager?.name || currentBranch.manager?.name || 'Partner';
        if (managerEmail) {
            if (data.storeStatus === 'verified') {
                sendStoreVerifiedEmail(managerEmail, managerName, updatedBranch.name);
            } else {
                sendStoreStatusChangeEmail(managerEmail, managerName, updatedBranch.name, data.storeStatus);
            }
        }
    }

    return updatedBranch;
};

const deleteBranch = async (id) => {
    // Note: This might need to handle product deletion or re-assignment
    return await prisma.branch.delete({ where: { id } });
};

const onboardBranch = async (data) => {
    const COOLDOWN_DAYS = 5;

    // Check if this manager was recently rejected — enforce 5-day cooldown
    // [DISABLED FOR DEVELOPMENT]
    /*
    const existingBranch = await prisma.branch.findUnique({
        where: { managerId: data.managerId },
        select: { storeStatus: true, updatedAt: true }
    });

    if (existingBranch?.storeStatus === 'rejected' && existingBranch?.updatedAt) {
        const daysSinceRejection = (Date.now() - new Date(existingBranch.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        const daysRemaining = Math.ceil(COOLDOWN_DAYS - daysSinceRejection);
        if (daysRemaining > 0) {
            const err = new Error(`Application is in a cooldown period. You can resubmit in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`);
            err.statusCode = 429;
            err.daysRemaining = daysRemaining;
            throw err;
        }
    }
    */

    const branchData = {
        name: data.name,
        branchName: data.branchName,
        location: data.location || data.city,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,

        // New Manager specific fields
        managerName: data.managerName,
        managerPhone: data.managerPhone,
        managerAddress: data.managerAddress,
        managerCity: data.managerCity,
        managerState: data.managerState,
        managerPincode: data.managerPincode,
        panNumber: data.panNumber,
        aadharNumber: data.aadharNumber,

        gstNumber: data.gstNumber,
        fssaiLicense: data.fssaiLicense,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        bankIfscCode: data.bankIfscCode,
        openTime: data.openTime,
        closeTime: data.closeTime,
        storeImageUrl: data.storeImageUrl,
        licenseImageUrl: data.licenseImageUrl,
        fssaiPdfUrl: data.fssaiPdfUrl,
        gstPdfUrl: data.gstPdfUrl,
        bankPassbookPdfUrl: data.bankPassbookPdfUrl,
        managerPhotoUrl: data.managerPhotoUrl,
        storeStatus: "under_review",
        isVisible: false,
    };

    // Use atomic upsert: create if no branch exists, update if one already does
    return await prisma.branch.upsert({
        where: { managerId: data.managerId },
        update: branchData,
        create: {
            ...branchData,
            manager: { connect: { id: data.managerId } }
        },
        include: {
            manager: { select: { id: true, name: true, email: true, phone: true } }
        }
    });
};




const toggleVisibility = async (id, isVisible) => {
    return await prisma.branch.update({
        where: { id },
        data: { isVisible }
    });
};

const verifyBranch = async (id, status) => {
    // First fetch the branch so we have email/name before any changes
    const branch = await prisma.branch.findUnique({
        where: { id },
        include: { manager: { select: { name: true, email: true } } }
    });

    if (!branch) throw new Error('Branch not found');

    const managerEmail = branch.manager?.email;
    const managerName = branch.manager?.name || 'Partner';
    const storeName = branch.name;

    // Build update data — updatedAt is auto-stamped by Prisma on each update,
    // so it doubles as the rejectedAt timestamp when storeStatus becomes 'rejected'
    const updateData = {
        storeStatus: status || 'verified',
        isVisible: status === 'verified',
    };

    const updatedBranch = await prisma.branch.update({
        where: { id },
        data: updateData,
        include: { manager: { select: { name: true, email: true } } }
    });

    // Send email notification
    if (managerEmail) {
        if (status === 'verified') {
            sendStoreVerifiedEmail(managerEmail, managerName, storeName);
        } else {
            sendStoreStatusChangeEmail(managerEmail, managerName, storeName, status);
        }
    }

    return updatedBranch;
};


module.exports = {
    createBranch,
    getBranches,
    getBranchById,
    getBranchByManagerId,
    updateBranch,
    deleteBranch,
    onboardBranch,
    toggleVisibility,
    verifyBranch
};
