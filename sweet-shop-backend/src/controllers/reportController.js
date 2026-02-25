const reportService = require("../services/reportService");

const getSalesReports = async (req, res, next) => {
    try {
        const userRole = (req.user.role || "").toUpperCase();
        if (userRole !== "ADMIN") {
            return res.status(403).json({ message: "Admins only" });
        }

        const { type = "day" } = req.query;
        const reports = await reportService.getSalesReports(type);

        res.json(reports);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSalesReports
};
