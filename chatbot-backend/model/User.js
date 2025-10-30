// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true, unique: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     remainingTokens: { type: Number, default: 10000 },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    country: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    remainingTokens: { type: Number, default: 10000 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);