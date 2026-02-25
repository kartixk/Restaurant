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
    sendConfirmationEmail
};
