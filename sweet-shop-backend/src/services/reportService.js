const prisma = require("../prismaClient");

const getSalesReports = async (type) => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    end.setHours(23, 59, 59, 999);

    switch (type) {
        case "day":
            start.setHours(0, 0, 0, 0);
            break;
        case "week":
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            break;
        case "month":
            start.setMonth(start.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            break;
        case "year":
            start.setFullYear(start.getFullYear() - 1);
            start.setHours(0, 0, 0, 0);
            break;
        case "all":
            start = new Date("2000-01-01T00:00:00Z");
            break;
        default:
            start.setHours(0, 0, 0, 0);
    }

    const sales = await prisma.sales.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const totalAmount = sales.reduce((sum, s) => sum + (Number(s.orderTotal) || 0), 0);

    return {
        count: sales.length,
        totalAmount,
        sales
    };
};

module.exports = {
    getSalesReports
};
