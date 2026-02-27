const nodemailer = require('nodemailer');

// Set up ethereal email for local testing/development
const createTransporter = async () => {
    // If production, use real credentials from env
    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Create a test account for local development
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

const sendConfirmationEmail = async (userEmail, userName) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: '"Sweet Shop Admin" <admin@sweetshop.com>',
            to: userEmail,
            subject: "Your Manager Account has been Verified ✔",
            text: `Hello ${userName},\n\nYour manager account has been verified by the admin. You can now log in to the Sweet Shop Management System.\n\nBest regards,\nSweet Shop Team`,
            html: `<b>Hello ${userName},</b><br><br>Your manager account has been verified by the admin. You can now log in to the Sweet Shop Management System.<br><br>Best regards,<br>Sweet Shop Team`,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available for Ethereal
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};

module.exports = {
    sendConfirmationEmail,
    sendStoreVerifiedEmail,
    sendStoreStatusChangeEmail
};

async function sendStoreVerifiedEmail(managerEmail, managerName, storeName) {
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: '"FoodFlow Partner Team" <partner@foodflow.com>',
            to: managerEmail,
            subject: `🎉 Your Store "${storeName}" Has Been Verified!`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background: #f0fdf4; line-height: 64px; font-size: 32px;">✅</div>
                    </div>
                    <h1 style="text-align: center; color: #0f172a; font-size: 24px; margin-bottom: 16px;">Congratulations, ${managerName}!</h1>
                    <p style="text-align: center; color: #475569; font-size: 16px; line-height: 1.6;">
                        Your store <strong>"${storeName}"</strong> has been verified by our team. 
                        You can now start taking orders and managing your restaurant through the FoodFlow Partner Dashboard.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/manager/dashboard" 
                           style="display: inline-block; padding: 14px 32px; background: #FF5A00; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;">
                            Go to Dashboard →
                        </a>
                    </div>
                    <p style="text-align: center; color: #94a3b8; font-size: 13px;">
                        If you have any questions, contact us at partner@foodflow.com
                    </p>
                </div>
            `
        });
        console.log("Store verification email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending store verification email:", error);
    }
}

async function sendStoreStatusChangeEmail(managerEmail, managerName, storeName, newStatus) {
    try {
        const transporter = await createTransporter();
        const statusMessages = {
            pending: { emoji: '⏳', title: 'Store Status Changed', body: `Your store "${storeName}" status has been changed to pending. Please contact support if you have questions.` },
            under_review: { emoji: '🔍', title: 'Store Under Review', body: `Your store "${storeName}" is now under review. We'll notify you once the review is complete.` },
            verified: { emoji: '✅', title: 'Store Verified', body: `Your store "${storeName}" has been verified! You can now start operations.` },
            rejected: { emoji: '❌', title: 'Application Rejected', body: `Unfortunately, your store application for "${storeName}" has not been approved at this time. Please contact our support team at partner@foodflow.com for more information or to address the concerns raised.` },
        };
        const msg = statusMessages[newStatus] || { emoji: '📋', title: 'Status Update', body: `Your store "${storeName}" status has been updated to: ${newStatus}` };

        await transporter.sendMail({
            from: '"FoodFlow Partner Team" <partner@foodflow.com>',
            to: managerEmail,
            subject: `${msg.emoji} ${msg.title} - ${storeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h2 style="color: #0f172a;">${msg.emoji} ${msg.title}</h2>
                    <p style="color: #475569; line-height: 1.6;">Hello ${managerName},</p>
                    <p style="color: #475569; line-height: 1.6;">${msg.body}</p>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">— FoodFlow Partner Team</p>
                </div>
            `
        });
        console.log(`Store status change email sent to ${managerEmail} (status: ${newStatus})`);
    } catch (error) {
        console.error("Error sending status change email:", error);
    }
}
