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

const getUserOrders = async (userId) => {
    return await prisma.order.findMany({
        where: { userId },
        include: {
            branch: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 7
    });
};

const collectOrder = async (orderId, userId) => {
    // 1. Fetch order to verify ownership and status
    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
    }

    if (order.userId !== userId) {
        const error = new Error("Unauthorized to collect this order");
        error.statusCode = 403;
        throw error;
    }

    if (order.status !== "READY") {
        const error = new Error("Order is not ready for collection yet");
        error.statusCode = 400;
        throw error;
    }

    // 2. Reuse updateOrderStatus to move it to COMPLETED and send email
    return await updateOrderStatus(orderId, "COMPLETED");
};

module.exports = {
    getMyBranchOrders,
    getOrderById,
    updateOrderStatus,
    getUserOrders,
    collectOrder
};
