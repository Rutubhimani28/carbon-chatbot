// import mongoose from "mongoose";

// const chatSessionSchema = new mongoose.Schema({
//    email: { type: String, required: true },
//   sessionId: { type: String, required: true },
//   prompt: { type: String, required: true },
//   response: { type: String, required: true },
//   create_time: { type: Date, default: Date.now },
// });

// export default mongoose.model("ChatSession", chatSessionSchema);

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    prompt: String,
    response: String,
    wordCount: Number,
    tokensUsed: Number,
    create_time: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    email: { type: String, required: true }, // link with user
    history: [messageSchema],
    create_time: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("ChatSession", chatSessionSchema);

