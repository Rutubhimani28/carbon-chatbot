import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    query: { type: String, required: true },
    category: { type: String, default: "general" },
    resultsCount: { type: Number, default: 0 }, // optional, to store how many results returned
    raw: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("SearchHistory", searchHistorySchema);
