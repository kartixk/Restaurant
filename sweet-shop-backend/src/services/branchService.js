const prisma = require("../prismaClient");

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
                select: { id: true, name: true, email: true }
            }
        }
    });
};

const getBranches = async () => {
    return await prisma.branch.findMany({
        include: {
            manager: {
                select: { id: true, name: true, email: true }
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
                select: { id: true, name: true, email: true }
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
    const updateData = { ...data };
    if (updateData.managerId) {
        // Handle manager change if needed
        const managerId = updateData.managerId;
        delete updateData.managerId;
        updateData.manager = { connect: { id: managerId } };
    }

    return await prisma.branch.update({
        where: { id },
        data: updateData,
        include: {
            manager: {
                select: { id: true, name: true, email: true }
            }
        }
    });
};

const deleteBranch = async (id) => {
    // Note: This might need to handle product deletion or re-assignment
    return await prisma.branch.delete({ where: { id } });
};

module.exports = {
    createBranch,
    getBranches,
    getBranchById,
    getBranchByManagerId,
    updateBranch,
    deleteBranch
};
