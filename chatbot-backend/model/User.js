import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    remainingTokens: { type: Number, default: 5000 }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
