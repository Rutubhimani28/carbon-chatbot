// // server/paymentRoutes.js
// import express from "express";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import bodyParser from "body-parser";
// import Transaction from "../model/Transaction.js";
// import User from "../model/User.js";
// import bcrypt from "bcryptjs";
// import sendPasswordMail from "../middleware/sendPasswordMail.js";

// const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Parse JSON bodies for normal routes
// router.use(bodyParser.json());

// // 1) Create Order (frontend calls this to get order.id)
// router.post("/create-order", async (req, res) => {
//   try {
//     const { amount, currency = "INR", receiptId } = req.body;

//     if (!amount) return res.status(400).json({ error: "amount is required" });

//     const options = {
//       amount: Math.round(amount * 100), // amount in paise
//       currency,
//       receipt: receiptId || `rcpt_${Date.now()}`,
//       payment_capture: 1, // auto-capture
//     };

//     const order = await razorpay.orders.create(options);
//     // return order object to frontend
//     res.json({ success: true, order });
//   } catch (err) {
//     console.error("create-order err:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // 2) Verify Payment (frontend posts payload returned by Razorpay handler)
// router.post("/verify-payment", async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } =
//       req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, error: "invalid payload" });
//     }

//     const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//     shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generated_signature = shasum.digest("hex");

//     if (generated_signature === razorpay_signature) {
//       // payment verified
//       // TODO: update order status in your DB here

//       // Save transaction to DB
//       try {
//         // We need to fetch the order details or pass amount from frontend if not stored in session/DB
//         // For now, we will just store the IDs. Ideally, amount should be verified or passed.
//         // Since the verify endpoint only receives IDs, we might need to fetch order from Razorpay or trust frontend (less secure)
//         // or better, fetch the order from Razorpay to get the amount.
//         // However, to keep it simple as per request:

//         // Fetch order to get amount (optional but recommended for data integrity)
//         // const order = await razorpay.orders.fetch(razorpay_order_id);

//         // For now, let's assume we just want to log the IDs.
//         // If amount is needed, we should probably fetch it.
//         // Let's fetch the payment details to get the amount.
//         const payment = await razorpay.payments.fetch(razorpay_payment_id);

//         const newTransaction = new Transaction({
//           razorpay_order_id,
//           razorpay_payment_id,
//           amount: payment.amount / 100, // amount is in paise
//           currency: payment.currency,
//           status: "success"
//         });

//         await newTransaction.save();
//         console.log("Transaction saved:", newTransaction);

//       } catch (dbError) {
//         console.error("Error saving transaction:", dbError);
//         // We still return success to frontend as payment was verified at Razorpay end
//       }

//       // Update user password and send email
//       if (email) {
//         try {
//           const user = await User.findOne({ email });
//           if (user) {
//             // -------- Generate Password --------
//             const cleanName = user.firstName.replace(/\s+/g, "").toLowerCase();
//             const passwordPart =
//               cleanName.length >= 4
//                 ? cleanName.slice(0, 4)
//                 : cleanName.padEnd(4, cleanName[0]);
//             const year = new Date(user.dateOfBirth).getFullYear();
//             const generatedPassword = `${passwordPart}@${year}`;

//             const hashedPassword = await bcrypt.hash(generatedPassword, 10);

//             user.password = hashedPassword;
//             await user.save();

//             // ---- Send Email ----
//             const recipientEmail = ["<13", "13-14", "15-17"].includes(user.ageGroup) ? user.parentEmail : email;
//             const recipientName = ["<13", "13-14", "15-17"].includes(user.ageGroup) ? user.parentName : user.firstName;
//             await sendPasswordMail(recipientEmail, recipientName, generatedPassword);
//             console.log(`Password generated and email sent to ${recipientEmail}`);
//           }
//         } catch (userError) {
//           console.error("Error updating user password:", userError);
//         }
//       }

//       return res.json({
//         success: true,
//         message: "Payment verified",
//         transactionId: razorpay_payment_id
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error("verify-payment err:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // 3) Webhook (Razorpay will call this on events)
// router.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }), // raw needed for signature verification
//   (req, res) => {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const signature = req.headers["x-razorpay-signature"];

//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(req.body)
//       .digest("hex");

//     if (expectedSignature === signature) {
//       const payload = JSON.parse(req.body.toString());
//       console.log("Webhook verified. Event:", payload.event);
//       // Handle events: payment.captured, payment.failed, order.paid etc.
//       // e.g. if (payload.event === "payment.captured") { update DB }
//       res.status(200).send("ok");
//     } else {
//       console.error("Webhook signature mismatch");
//       res.status(400).send("invalid signature");
//     }
//   }
// );

// export default router;

// server/paymentRoutes.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import bodyParser from "body-parser";
import Transaction from "../model/Transaction.js";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import sendPasswordMail from "../middleware/sendPasswordMail.js";
import sendReceiptMail from "../middleware/mailWithAttachment.js";
import generateReceipt from "../utils/generateReceipt.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Parse JSON bodies for normal routes
router.use(bodyParser.json());

// 1) Create Order (frontend calls this to get order.id)
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receiptId } = req.body;

    if (!amount) return res.status(400).json({ error: "amount is required" });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receiptId || `rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture
    };

    const order = await razorpay.orders.create(options);
    // return order object to frontend
    res.json({ success: true, order });
  } catch (err) {
    console.error("create-order err:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2) Verify Payment (frontend posts payload returned by Razorpay handler)
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "invalid payload" });
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = shasum.digest("hex");

    if (generated_signature === razorpay_signature) {
      // payment verified
      // TODO: update order status in your DB here

      // Save transaction to DB
      try {
        // Fetch payment details to get amount
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        const newTransaction = new Transaction({
          razorpay_order_id,
          razorpay_payment_id,
          amount: payment.amount / 100, // amount in paise
          currency: payment.currency,
          status: "success"
        });

        await newTransaction.save();
        console.log("Transaction saved:", newTransaction);

      } catch (dbError) {
        console.error("Error saving transaction:", dbError);
        // Continue as payment is verified
      }

      // Update user password and send email
      if (email) {
        try {
          const user = await User.findOne({ email });
          if (user) {
            // -------- Generate Password --------
            const cleanName = user.firstName.replace(/\s+/g, "").toLowerCase();
            const passwordPart =
              cleanName.length >= 4
                ? cleanName.slice(0, 4)
                : cleanName.padEnd(4, cleanName[0]);
            const year = new Date(user.dateOfBirth).getFullYear();
            const generatedPassword = `${passwordPart}@${year}`;

            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            user.password = hashedPassword;
            await user.save();

            // ---- Send Email ----
            const recipientEmail = ["<13", "13-14", "15-17"].includes(user.ageGroup) ? user.parentEmail : email;
            const recipientName = ["<13", "13-14", "15-17"].includes(user.ageGroup) ? user.parentName : user.firstName;
            await sendPasswordMail(recipientEmail, recipientName, generatedPassword);
            console.log(`Password generated and email sent to ${recipientEmail}`);
            // ---- Send Receipt Email ----
            // const pdfPath = "C:/Users/AAC/OneDrive/Desktop/Meeral/chatbot_carbon/RECEIPT-1 (1).pdf";

            const receiptData = {
              transactionId: razorpay_payment_id,
              date: new Date().toLocaleDateString(),
              customerName: `${user.firstName} ${user.lastName}`,
              email: recipientEmail,
              planName: `${user.subscriptionPlan} - ${user.childPlan}`,
              amount: user.totalPriceINR || "N/A", // Ensure this field exists or fetch from payment details
              currency: "INR"
            };

            const dynamicPdfPath = await generateReceipt(receiptData);
            await sendReceiptMail(recipientEmail, recipientName, dynamicPdfPath);
            console.log(`Receipt email sent to ${recipientEmail}`);
          }
        } catch (userError) {
          console.error("Error updating user password:", userError);
        }
      }

      return res.json({
        success: true,
        message: "Payment verified",
        transactionId: razorpay_payment_id
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error("verify-payment err:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// paymentController.js (only the verify-payment handler - replace existing handler with this)
// router.post("/verify-payment", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       email,
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, error: "invalid payload" });
//     }

//     // verify signature
//     const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//     shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generated_signature = shasum.digest("hex");

//     if (generated_signature !== razorpay_signature) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid signature" });
//     }

//     // Payment verified by signature -- fetch payment details from Razorpay for accuracy
//     const payment = await razorpay.payments.fetch(razorpay_payment_id);

//     // Save transaction (best-effort)
//     try {
//       const newTransaction = new Transaction({
//         razorpay_order_id,
//         razorpay_payment_id,
//         amount: payment.amount / 100, // convert paise -> rupees
//         currency: payment.currency,
//         method: payment.method,
//         status: payment.status || "captured",
//         createdAt: new Date(payment.created_at * 1000), // if provided in seconds
//       });
//       await newTransaction.save();
//       console.log("Transaction saved:", newTransaction._id);
//     } catch (dbErr) {
//       console.error("Could not save transaction:", dbErr);
//       // continue — don't block sending receipt if DB saving fails
//     }

//     // Find related user (use provided email OR search by metadata if you store order->user mapping)
//     let recipientEmail = email;
//     let recipientName = "";
//     let user = null;
//     if (email) {
//       user = await User.findOne({ email });
//       // If the user is a minor and you stored parentEmail, consider that in send
//       if (user) {
//         const isMinor = ["<13", "13-14", "15-17"].includes(user.ageGroup);
//         recipientEmail = isMinor ? user.parentEmail || user.email : user.email;
//         recipientName = isMinor
//           ? user.parentName || user.firstName
//           : user.firstName;
//       }
//     }

//     // If user not found but email passed, use that email
//     if (!recipientEmail && email) recipientEmail = email;

//     // Build receipt data for PDF
//     const receiptData = {
//       transactionId: razorpay_payment_id,
//       date: new Date(
//         payment.created_at ? payment.created_at * 1000 : Date.now()
//       ).toLocaleDateString("en-IN"),
//       customerName: user
//         ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
//           recipientName ||
//           "Customer"
//         : recipientName || "Customer",
//       email: recipientEmail || "not-provided",
//       planName: user
//         ? `${user.subscriptionPlan || ""} - ${user.childPlan || ""}`.trim()
//         : "Subscription",
//       amount: (payment.amount / 100).toFixed(2),
//       currency: payment.currency || "INR",
//       paymentMethod: payment.method || "UPI",
//     };

//     // Generate receipt PDF (returns absolute path)
//     const pdfPath = await generateReceipt(receiptData);

//     // send email with PDF attachment
//     if (recipientEmail) {
//       await sendReceiptMail(
//         recipientEmail,
//         recipientName || receiptData.customerName,
//         pdfPath
//       );
//       console.log(`Receipt sent to ${recipientEmail}`);
//     } else {
//       console.warn("No recipient email available — receipt not emailed.");
//     }

//     // Optionally: set user's password and send password mail (if that flow needed)
//     if (user) {
//       try {
//         const cleanName = (user.firstName || "")
//           .replace(/\s+/g, "")
//           .toLowerCase();
//         const passwordPart =
//           cleanName.length >= 4
//             ? cleanName.slice(0, 4)
//             : cleanName.padEnd(4, cleanName[0] || "x");
//         const year = user.dateOfBirth
//           ? new Date(user.dateOfBirth).getFullYear()
//           : new Date().getFullYear();
//         const generatedPassword = `${passwordPart}@${year}`;
//         const hashedPassword = await bcrypt.hash(generatedPassword, 10);
//         user.password = hashedPassword;
//         user.subscriptionStatus = "active";
//         user.isActive = true;
//         await user.save();

//         // send password mail to same recipient (or parent email if minor)
//         await sendPasswordMail(
//           recipientEmail,
//           recipientName || user.firstName,
//           generatedPassword
//         );
//         console.log(`Password email sent to ${recipientEmail}`);
//       } catch (pwErr) {
//         console.error("Error generating/saving password:", pwErr);
//       }
//     }

//     return res.json({
//       success: true,
//       message: "Payment verified and receipt/email processed",
//       transactionId: razorpay_payment_id,
//     });
//   } catch (err) {
//     console.error("verify-payment err:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// });

// 3) Webhook (Razorpay will call this on events)
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }), // raw needed for signature verification
  (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature === signature) {
      const payload = JSON.parse(req.body.toString());
      console.log("Webhook verified. Event:", payload.event);
      // Handle events: payment.captured, payment.failed, order.paid etc.
      // e.g. if (payload.event === "payment.captured") { update DB }
      res.status(200).send("ok");
    } else {
      console.error("Webhook signature mismatch");
      res.status(400).send("invalid signature");
    }
  }
);

export default router;

// // server/paymentRoutes.js
// import express from "express";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import bodyParser from "body-parser";
// import Transaction from "../model/Transaction.js";
// import User from "../model/User.js";
// import bcrypt from "bcryptjs";
// import sendPasswordMail from "../middleware/sendPasswordMail.js";
// import sendReceiptMail from "../middleware/mailWithAttachment.js";
// import generateReceipt from "../utils/generateReceipt.js";

// const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Parse JSON bodies for normal routes
// router.use(bodyParser.json());

// // 1) Create Order (frontend calls this to get order.id)
// router.post("/create-order", async (req, res) => {
//   try {
//     const { amount, currency = "INR", receiptId } = req.body;

//     if (!amount) return res.status(400).json({ error: "amount is required" });

//     const options = {
//       amount: Math.round(amount * 100), // amount in paise
//       currency,
//       receipt: receiptId || `rcpt_${Date.now()}`,
//       payment_capture: 1, // auto-capture
//     };

//     const order = await razorpay.orders.create(options);
//     // return order object to frontend
//     res.json({ success: true, order });
//   } catch (err) {
//     console.error("create-order err:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // 2) Verify Payment (frontend posts payload returned by Razorpay handler)
// router.post("/verify-payment", async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } =
//       req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, error: "invalid payload" });
//     }

//     const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//     shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generated_signature = shasum.digest("hex");

//     if (generated_signature === razorpay_signature) {
//       // payment verified
//       // TODO: update order status in your DB here

//       // Save transaction to DB
//       try {
//         // Fetch payment details to get amount
//         const payment = await razorpay.payments.fetch(razorpay_payment_id);

//         const newTransaction = new Transaction({
//           razorpay_order_id,
//           razorpay_payment_id,
//           amount: payment.amount / 100, // amount in paise
//           currency: payment.currency,
//           status: "success"
//         });

//         await newTransaction.save();
//         console.log("Transaction saved:", newTransaction);

//       } catch (dbError) {
//         console.error("Error saving transaction:", dbError);
//         // Continue as payment is verified
//       }

//       // Update user password and send email
//       if (email) {
//         try {
//           const user = await User.findOne({ email });
//           if (user) {
//             // -------- Generate Password --------
//             const cleanName = user.firstName.replace(/\s+/g, "").toLowerCase();
//             const passwordPart =
//               cleanName.length >= 4
//                 ? cleanName.slice(0, 4)
//                 : cleanName.padEnd(4, cleanName[0]);
//             const year = new Date(user.dateOfBirth).getFullYear();
//             const generatedPassword = `${passwordPart}@${year}`;

//             const hashedPassword = await bcrypt.hash(generatedPassword, 10);

//             user.password = hashedPassword;
//             await user.save();

//             // ---- Send Email ----
//             const recipientEmail = ["<13", "13-14", "15-17"].includes(user.ageGroup) ? user.parentEmail : email;
//             const recipientName = ["<13", "13-14", "15-17"].includes(user.ageGroup) ? user.parentName : user.firstName;
//             await sendPasswordMail(recipientEmail, recipientName, generatedPassword);
//             console.log(`Password generated and email sent to ${recipientEmail}`);
//             // ---- Send Receipt Email ----
//             // ---- Send Receipt Email ----
//             // const pdfPath = "C:/Users/AAC/OneDrive/Desktop/Meeral/chatbot_carbon/RECEIPT-1 (1).pdf";

//             const receiptData = {
//               transactionId: razorpay_payment_id,
//               date: new Date().toLocaleDateString(),
//               customerName: `${user.firstName} ${user.lastName}`,
//               email: recipientEmail,
//               planName: `${user.subscriptionPlan} - ${user.childPlan}`,
//               amount: user.totalPriceINR || "N/A", // Ensure this field exists or fetch from payment details
//               currency: "INR"
//             };

//             const dynamicPdfPath = await generateReceipt(receiptData);
//             await sendReceiptMail(recipientEmail, recipientName, dynamicPdfPath);
//             console.log(`Receipt email sent to ${recipientEmail}`);
//           }
//         } catch (userError) {
//           console.error("Error updating user password:", userError);
//         }
//       }

//       return res.json({
//         success: true,
//         message: "Payment verified",
//         transactionId: razorpay_payment_id
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error("verify-payment err:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // 3) Webhook (Razorpay will call this on events)
// router.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }), // raw needed for signature verification
//   (req, res) => {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const signature = req.headers["x-razorpay-signature"];

//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(req.body)
//       .digest("hex");

//     if (expectedSignature === signature) {
//       const payload = JSON.parse(req.body.toString());
//       console.log("Webhook verified. Event:", payload.event);
//       // Handle events: payment.captured, payment.failed, order.paid etc.
//       // e.g. if (payload.event === "payment.captured") { update DB }
//       res.status(200).send("ok");
//     } else {
//       console.error("Webhook signature mismatch");
//       res.status(400).send("invalid signature");
//     }
//   }
// );

// export default router;
