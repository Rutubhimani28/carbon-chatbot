import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceipt = async (data) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../middleware/email_templates/receipt-template.ejs"
      //   "email_templates",
      //   "receipt-template.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      receiptNo: data.receiptNo,
      date: data.date,
      fullName: data.fullName,
      planName: data.planName,
      subscriptionType: data.subscriptionType,
      amount: data.amount,
      gst: data.gst,
      total: data.total,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      amountInWords: data.amountInWords,
      //   ...data,
      //   amountInWords: data.amountInWords,
    });

    const receiptsDir = path.join(__dirname, "../receipts");
    if (!fs.existsSync(receiptsDir))
      fs.mkdirSync(receiptsDir, { recursive: true });

    const fileName = `RECEIPT_${data.transactionId}.pdf`;
    const filePath = path.join(receiptsDir, fileName);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    return filePath;
  } catch (err) {
    console.error("PDF ERROR:", err);
    throw err;
  }
};
