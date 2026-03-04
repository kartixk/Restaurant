const prisma = require("../prismaClient");
const { sendOrderStatusUpdateEmail } = require("../utils/email");

const getMyBranchOrders = async (managerId) => {
    // 1. Get the branch managed by this user
    const branch = await prisma.branch.findUnique({
        where: { managerId }
    });

    if (!branch) throw new Error("No branch found for this manager");

    // 2. Get all orders for this branch
    return await prisma.order.findMany({
        where: { branchId: branch.id },
        include: {
            user: { select: { name: true, phone: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getOrderById = async (orderId) => {
    return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: { select: { name: true, phone: true, email: true } },
            branch: { select: { name: true, address: true, phone: true } }
        }
    });
};

const updateOrderStatus = async (orderId, status) => {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
            user: { select: { email: true, name: true } }
        }
    });

    // Send email notification to customer
    if (order.user?.email) {
        sendOrderStatusUpdateEmail(order.user.email, order.user.name || 'Customer', order.id, status);
    }

    return order;
};

module.exports = {
    getMyBranchOrders,
    getOrderById,
    updateOrderStatus
};
