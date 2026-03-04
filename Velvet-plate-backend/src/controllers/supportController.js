const prisma = require("../prismaClient");
const { sendUrgentUplinkEmail } = require("../utils/email");

const triggerUplink = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;

        // Fetch user and branch details for context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { managedBranch: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all Admins to notify
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        const managerName = user.name || "Partner";
        const managerEmail = user.email;
        const storeName = user.managedBranch?.name || "Unassigned Store";
        const referenceId = userId.slice(-8).toUpperCase();

        // Send the email to all registered Admins
        if (admins.length > 0) {
            await Promise.all(admins.map(admin =>
                sendUrgentUplinkEmail(admin.email, managerEmail, managerName, storeName, referenceId)
            ));
        } else {
            // Fallback to default support if no admins found in DB
            await sendUrgentUplinkEmail('partners@velvetplate.com', managerEmail, managerName, storeName, referenceId);
        }

        res.status(200).json({
            message: "Urgent uplink protocol initiated successfully. Admin team notified."
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    triggerUplink
};
