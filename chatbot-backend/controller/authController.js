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

export const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      mobile, 
      country, 
      dateOfBirth, 
      username, 
      password 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }, { mobile }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: "Email, Username or Mobile number already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all fields
    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      country,
      dateOfBirth: new Date(dateOfBirth), // Convert to Date object
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ 
      message: "User registered successfully", 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        country: user.country,
        dateOfBirth: user.dateOfBirth,
        username: user.username,
        remainingTokens: user.remainingTokens
      }
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Registration failed", 
      details: err.message 
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

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
        country: user.country,
        dateOfBirth: user.dateOfBirth,
        username: user.username,
        remainingTokens: user.remainingTokens
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};