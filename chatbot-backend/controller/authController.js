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

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      // country,
      dateOfBirth,
      ageGroup,
      parentName,
      parentEmail,
      parentMobile,
      subscriptionPlan,
      childPlan,
      subscriptionType,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !mobile ||
      !dateOfBirth ||
      !ageGroup ||
      !subscriptionPlan ||
      !childPlan ||
      !subscriptionType
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Parent validation if age < 18
    if (["<13", "13-14", "15-17"].includes(ageGroup)) {
      if (!parentName || !parentEmail || !parentMobile) {
        return res.status(400).json({
          error: "Parent information required for users under 18",
        });
      }
    }

    // If <13 → Parent email becomes login email
    const finalEmail = ageGroup === "<13" ? parentEmail : email;

    // Check if user already exists
    // const existingUser = await User.findOne({
    //   $or: [{ email }, { username }, { mobile }]
    // });

    // if (existingUser) {
    //   return res.status(400).json({
    //     error: "Email, Username or Mobile number already exists"
    //   });
    // }

    // Check duplicates
    const existingUser = await User.findOne({
      $or: [{ email: finalEmail }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "Account already exists" });
    }

    // -------- Generate Password --------
    const cleanName = firstName.replace(/\s+/g, "").toLowerCase();
    const passwordPart =
      cleanName.length >= 4
        ? cleanName.slice(0, 4)
        : cleanName.padEnd(4, cleanName[0]);
    const year = new Date(dateOfBirth).getFullYear();
    const generatedPassword = `${passwordPart}@${year}`;

    // Generate Password (first 4 letters + "@" + year)
    // const cleanName = firstName.replace(/\s+/g, "").toLowerCase();

    // let namePart = cleanName.length >= 4
    //   ? cleanName.slice(0,4)
    //   : cleanName.padEnd(4, cleanName[0]); // If name < 4 chars

    // const year = new Date(dateOfBirth).getFullYear();

    // const generatedPassword = `${namePart}@${year}`;

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all fields
    const user = new User({
      firstName,
      lastName,
      email: finalEmail,
      mobile,
      dateOfBirth: new Date(dateOfBirth), // Convert to Date object
      ageGroup,
      parentName,
      parentEmail,
      parentMobile,
      subscriptionPlan,
      childPlan,
      subscriptionType,
      password: hashedPassword,
    });

    await user.save();

    // ---- Send Email ----
    await sendPasswordMail(finalEmail, firstName, generatedPassword);

    res.status(201).json({
      // message: "User registered successfully",
      message: "Registration successful. Login details sent to email.",
      loginEmail: finalEmail,
      // autoGeneratedPassword: generatedPassword,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        // email: user.email,
        email: finalEmail,
        mobile: user.mobile,
        dateOfBirth: user.dateOfBirth,
        subscription: {
          plan: subscriptionPlan,
          childPlan,
          type: subscriptionType,
        },
        remainingTokens: user.remainingTokens,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: "Registration failed",
      details: err.message,
    });
  }
};

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
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};
