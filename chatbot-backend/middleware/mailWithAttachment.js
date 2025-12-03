import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reuse same transporter configuration as sendPasswordMail
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "39703f65d41de4",
        pass: "4a129ece9c1d41",
    },
});

/**
 * Sends an email with a receipt PDF attachment.
 * @param {string} email Recipient email address
 * @param {string} firstName Recipient first name (for template)
 * @param {string} pdfPath Absolute path to the PDF file to attach
 */
const sendReceiptMail = async (email, firstName, pdfPath) => {
    try {
        const templatePath = path.join(__dirname, "email-templates", "send_password.ejs"); // reuse same template for consistency
        const htmlData = await ejs.renderFile(templatePath, {
            firstName,
            email,
            password: "",
            loginUrl: "http://localhost:5173/login",
            logoUrl: "http://localhost:5173/assets/Msg_logo.png",
        });

        const mailOptions = {
            from: '"Kush Software" <no-reply@kushsoftware.com>',
            to: email,
            subject: "Your Payment Receipt",
            html: htmlData,
            attachments: [
                {
                    filename: path.basename(pdfPath),
                    path: pdfPath,
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log("📩 Receipt email sent successfully!");
    } catch (error) {
        console.error("Receipt email sending error:", error);
    }
};

export default sendReceiptMail;
