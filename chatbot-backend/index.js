// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import aiRoutes from "./routes/aiRoutes.js";
// import connectDB from "./db/connectDB.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/api/ai", aiRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// connectDB();

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";
import connectDB from "./db/connectDB.js";

// Load environment variables first
dotenv.config();

console.log("API Key exists:", !!process.env.OPENAI_API_KEY); // Debug check

// Debug log to verify env loading
console.log(
  "OpenRouter Key:",
  process.env.OPENAI_API_KEY ? "Loaded" : "Missing"
);

const app = express();

//  CORS middleware add karo
app.use(
  cors({
    origin: "http://localhost:5173", // tamaru React frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
connectDB();

// Error handling for uncaught exceptions
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
