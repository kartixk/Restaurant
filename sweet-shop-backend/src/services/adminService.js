const prisma = require("../prismaClient");
const { sendConfirmationEmail } = require("../utils/email");

const getPendingManagers = async () => {
    return await prisma.user.findMany({
        where: {
            role: "MANAGER",
            isVerified: false
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
    });
};

const approveManager = async (managerId) => {
    const manager = await prisma.user.findUnique({
        where: { id: managerId }
    });

    if (!manager) {
        throw new Error("Manager not found");
    }

    if (manager.role !== "MANAGER") {
        throw new Error("User is not a manager");
    }

    if (manager.isVerified) {
        throw new Error("Manager is already verified");
    }

    const updatedManager = await prisma.user.update({
        where: { id: managerId },
        data: { isVerified: true }
    });

    // Send confirmation email asynchronously
    sendConfirmationEmail(updatedManager.email, updatedManager.name || "Manager");

    return updatedManager;
};

module.exports = {
    getPendingManagers,
    approveManager
};
