import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";

// const transporter = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "0885458121f6ea",
//     pass: "726c1be7850752",
//   },
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "39703f65d41de4",
    pass: "4a129ece9c1d41",
  },
});

const sendPasswordMail = async (email, firstName, password) => {
  try {
    const templatePath = path.join(
      __dirname,
      "email-templates",
      "send_password.ejs"
    );

    const htmlData = await ejs.renderFile(templatePath, {
      firstName,
      email,
      password,
      loginUrl: "http://localhost:5173/login",
      logoUrl: "http://localhost:5173/assets/Msg_logo.png"
    });

    const mailOptions = {
      from: '"Kush Software" <no-reply@kushsoftware.com>',
      to: email,
      subject: "Your Login Credentials",
      html: htmlData,
    };

    console.log("📩 Email sent successfully!");
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Email sending error:", error);
  }
};

// module.exports = sendPasswordMail;
export default sendPasswordMail;
