// import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";
// import User from "../model/User.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ error: "Email or Username already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create normal user (no role, no extra fields)
//     const user = new User({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     await user.save();

//     res.status(201).json({ message: "User registered successfully", user });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Registration failed", details: err.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid)
//       return res.status(400).json({ error: "Incorrect Password" });

//     // console.log("user from DB:", user);
//     // console.log("password from request:", password);

//     //  Role no check karvo nathi
//     // const token = jwt.sign(
//     //   { id: user._id, email: user.email }, // only id & email
//     //   process.env.JWT_SECRET,
//     //   { expiresIn: "1d" }
//     // );

//     res.json({
//       status: 200,
//       message: "Login successful",
//       //   token,
//       data: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Login failed", details: err.message });
//   }
// };

import bcrypt from "bcryptjs";
import User from "../model/User.js";
// import { sendPasswordMail } from "../services/mailService.js";
import sendPasswordMail from "../middleware/sendPasswordMail.js";

// Plan Options
const novaOptions = ["Glow Up", "Level Up", "Rise Up"];
const superNovaOptions = ["Step Up", "Speed Up", "Scale Up"];
const subscriptionTypes = ["Monthly", "Yearly"];

// FIXED PRICES IN USD (કદી બદલવાના નહીં)
// const BASE_PRICES_USD = {
//   Nova: {
//     "Glow Up": { Monthly: 0.99, Yearly: 10.99 },
//     "Level Up": { Monthly: 1.99, Yearly: 21.99 },
//     "Rise Up": { Monthly: 3.99, Yearly: 39.99 },
//   },
//   Supernova: {
//     "Step Up": { Monthly: 2.99, Yearly: 32.99 },
//     "Speed Up": { Monthly: 4.99, Yearly: 54.99 },
//     "Scale Up": { Monthly: 9.99, Yearly: 99.99 },
//   },
// };

const BASE_PRICES_INR = {
  Nova: {
    "Glow Up": { Monthly: 99, Yearly: 999 },
    "Level Up": { Monthly: 199, Yearly: 1999 },
    "Rise Up": { Monthly: 399, Yearly: 3999 },
  },
  Supernova: {
    "Step Up": { Monthly: 299, Yearly: 2999 },
    "Speed Up": { Monthly: 499, Yearly: 4999 },
    "Scale Up": { Monthly: 899, Yearly: 8999 },
  },
};

// BEST FREE + UNLIMITED + SUPER FAST USD → INR API
const getLiveUSDRate = async () => {
  try {
    const response = await fetch(
      "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/inr.json"
    );
    if (!response.ok) throw new Error("API failed");
    const data = await response.json();
    const rate = Math.round(data.inr * 100) / 100; // 2 decimal places
    console.log("Live USD → INR Rate:", rate);
    return rate;
  } catch (err) {
    console.error("Currency API failed:", err.message);
    console.log("Using fallback rate: 85 INR");
    return 85; // emergency fallback
  }
};

// AGE GROUP AUTO CALCULATOR
const getAgeGroup = (dob) => {
  const today = new Date();
  const birth = new Date(dob);

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 13) return "<13";
  if (age >= 13 && age <= 14) return "13-14";
  if (age >= 15 && age <= 17) return "15-17";
  return "18+";
};

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      dateOfBirth,
      // ageGroup,
      parentName,
      parentEmail,
      parentMobile,
      subscriptionPlan, // "Nova" or "Supernova"
      childPlan, // "Glow Up", "Scale Up" etc.
      subscriptionType, // "Monthly" or "Yearly"
    } = req.body;

    const finalAgeGroup = getAgeGroup(dateOfBirth);

    // Required fields validation
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      // !ageGroup ||
      !subscriptionPlan ||
      !childPlan ||
      !subscriptionType
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Parent validation for minors
    if (["<13", "13-14", "15-17"].includes(finalAgeGroup)) {
      if (!parentName || !parentEmail || !parentMobile) {
        return res
          .status(400)
          .json({ error: "Parent details required for users under 18" });
      }
    }

    const isMinor = ["<13", "13-14", "15-17"].includes(finalAgeGroup);

    // Final login email (for <13, parent email is used)
    const finalEmail = finalAgeGroup === "<13" ? parentEmail : email;
    const finalMobile = finalAgeGroup === "<13" ? parentMobile : mobile;

    // Check duplicate email
    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Account already exists with this email" });
    }

    // Get USD price
    // let priceUSD = 0;
    // if (subscriptionPlan === "Nova") {
    //   priceUSD = BASE_PRICES_USD.Nova[childPlan]?.[subscriptionType];
    // } else if (subscriptionPlan === "Supernova") {
    //   priceUSD = BASE_PRICES_USD.Supernova[childPlan]?.[subscriptionType];
    // }

    // if (!priceUSD) {
    //   return res.status(400).json({ error: "Invalid plan selection" });
    // }

    // // Fetch live exchange rate
    // const usdToInrRate = await getLiveUSDRate();

    // // Calculate final amount in INR with GST
    // const baseAmountINR = Math.round(priceUSD * usdToInrRate * 100) / 100;
    // const gstAmount = Math.round(baseAmountINR * 0.18 * 100) / 100;
    // const totalAmountINR = Math.round((baseAmountINR + gstAmount) * 100); // in paise for Razorpay

    // INR price
    const priceINR =
      BASE_PRICES_INR[subscriptionPlan]?.[childPlan]?.[subscriptionType];

    if (!priceINR) {
      return res.status(400).json({ error: "Invalid plan selection" });
    }

    // GST (18%)
    const gstAmount = Math.round(priceINR * 0.18 * 100) / 100;

    // Total payable amount
    const totalAmountINR = Math.round((priceINR + gstAmount) * 100); // paise

    // const totalAmountINR = 100; // 1 INR in paise

    // Create user (password will be set after payment)
    const user = new User({
      firstName,
      lastName,
      email: finalEmail,
      mobile: finalMobile || null,
      dateOfBirth: new Date(dateOfBirth),
      ageGroup: finalAgeGroup,
      parentName: ["<13", "13-14", "15-17"].includes(finalAgeGroup)
        ? parentName
        : null,
      parentEmail: ["<13", "13-14", "15-17"].includes(finalAgeGroup)
        ? parentEmail
        : null,
      parentMobile: ["<13", "13-14", "15-17"].includes(finalAgeGroup)
        ? parentMobile
        : null,
      country: "India", // Hardcoded for Indian GST

      // Subscription details
      subscriptionPlan,
      childPlan,
      subscriptionType,
      // priceUSD,
      // exchangeRateUsed: usdToInrRate,
      basePriceINR: priceINR,
      gstAmount,
      totalPriceINR: totalAmountINR / 100, // stored as rupees (with decimals)
      currency: "INR",
      subscriptionStatus: "pending",
      isActive: false,
    });

    await user.save();

    // Send response with exact amount for Razorpay
    res.status(201).json({
      success: true,
      message: "Registration successful! Starting payment...",
      loginEmail: finalEmail,
      paymentAmount: totalAmountINR / 100, // actual rupees (e.g., 99.79)
      priceBreakdown: {
        plan: `${subscriptionPlan} - ${childPlan} (${subscriptionType})`,
        // usd: `$${priceUSD}`,
        // rate: `1 USD = ₹${usdToInrRate}`,
        base: `₹${priceINR}`,
        gst: `₹${gstAmount} (18%)`,
        total: `₹${totalAmountINR / 100}`,
      },
      user: {
        id: user._id,
        subscription: {
          priceINR: totalAmountINR / 100,
        },
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      error: "Registration failed",
      details: err.message,
    });
  }
};

// Prices (USD)
// const novaPrices = {
//   "Glow Up": { Monthly: 0.99, Yearly: 10.99 },
//   "Level Up": { Monthly: 1.99, Yearly: 21.99 },
//   "Rise Up": { Monthly: 3.99, Yearly: 39.99 },
// };

// const superNovaPrices = {
//   "Step Up": { Monthly: 2.99, Yearly: 32.99 },
//   "Speed Up": { Monthly: 4.99, Yearly: 54.99 },
//   "Scale Up": { Monthly: 9.99, Yearly: 99.99 },
// };

// // USD → INR conversion
// const USD_TO_INR = 85;

// export const registerUser = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       mobile,
//       // country,
//       dateOfBirth,
//       ageGroup,
//       parentName,
//       parentEmail,
//       parentMobile,
//       subscriptionPlan,
//       childPlan,
//       subscriptionType,
//     } = req.body;

//     if (
//       !firstName ||
//       !lastName ||
//       !dateOfBirth ||
//       !ageGroup ||
//       !subscriptionPlan ||
//       !childPlan ||
//       !subscriptionType
//     ) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Parent validation if age < 18
//     if (["<13", "13-14", "15-17"].includes(ageGroup)) {
//       if (!parentName || !parentEmail || !parentMobile) {
//         return res.status(400).json({
//           error: "Parent information required for users under 18",
//         });
//       }
//     }

//     // If <13 → Parent email becomes login email
//     const finalEmail = ageGroup === "<13" ? parentEmail : email;

//     // Check if user already exists
//     // const existingUser = await User.findOne({
//     //   $or: [{ email }, { username }, { mobile }]
//     // });

//     // if (existingUser) {
//     //   return res.status(400).json({
//     //     error: "Email, Username or Mobile number already exists"
//     //   });
//     // }

//     // Check duplicates
//     const existingUser = await User.findOne({
//       $or: [{ email: finalEmail }],
//     });

//     if (existingUser) {
//       return res.status(400).json({ error: "Account already exists" });
//     }

//     // ---------------- PRICE LOGIC ----------------

//     let selectedPriceUSD = 0;

//     // NOVA plans
//     if (novaOptions.includes(childPlan)) {
//       selectedPriceUSD = novaPrices[childPlan][subscriptionType];
//     }

//     // SUPERNOVA plans
//     else if (superNovaOptions.includes(childPlan)) {
//       selectedPriceUSD = superNovaPrices[childPlan][subscriptionType];
//     }

//     // Convert USD -> INR
//     // const finalAmountINR = Math.round(selectedPriceUSD * USD_TO_INR);
//     const finalAmountINR = 1;

//     // -------- Generate Password --------
//     // Password generation moved to payment success

//     // Create user with all fields
//     const user = new User({
//       firstName,
//       lastName,
//       email: finalEmail,
//       mobile,
//       dateOfBirth: new Date(dateOfBirth), // Convert to Date object
//       ageGroup,
//       parentName,
//       parentEmail,
//       parentMobile,
//       subscriptionPlan,
//       childPlan,
//       subscriptionType,
//       priceUSD: selectedPriceUSD,
//       priceINR: finalAmountINR,
//       // password: hashedPassword, // Password will be set after payment
//     });

//     await user.save();

//     // ---- Send Email ----
//     // Email will be sent after payment verification (handled in paymentController)

//     res.status(201).json({
//       // message: "User registered successfully",
//       message:
//         "Registration successful. Please complete payment to receive login details.",
//       loginEmail: finalEmail,
//       // autoGeneratedPassword: generatedPassword,
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         // email: user.email,
//         email: finalEmail,
//         mobile: user.mobile,
//         dateOfBirth: user.dateOfBirth,
//         subscription: {
//           plan: subscriptionPlan,
//           childPlan,
//           type: subscriptionType,
//           priceUSD: selectedPriceUSD,
//           priceINR: finalAmountINR,
//         },
//         remainingTokens: user.remainingTokens,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: "Registration failed",
//       details: err.message,
//     });
//   }
// };

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email & Password required" });
    }

    email = email.trim().toLowerCase(); // 💡 Prevents case mismatch

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.password) {
      return res.status(400).json({
        error:
          "Password not set for this account. Please reset or register again.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Incorrect Password" });

    res.json({
      status: 200,
      message: "Login successful",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        dateOfBirth: user.dateOfBirth,
        remainingTokens: user.remainingTokens,
        subscriptionPlan: user.subscriptionPlan,
        childPlan: user.childPlan,
        subscriptionType: user.subscriptionType,
        // subscriptionStatus: user.subscriptionStatus,
        // isActive: user.isActive,
        // totalPriceINR: user.totalPriceINR,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};
