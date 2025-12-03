import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";
import connectDB from "./db/connectDB.js";
import searchRoutes from "./routes/searchRoutes.js"; // New search routes
import bodyParser from "body-parser";
import { getAISearchResults } from "./controller/searchController.js"; // Import the search controller
import {
  getUserSearchHistory,
  getUserTokenStats,
} from "./controller/searchController.js";
import { grokSearchResults } from "./controller/groksearchController.js";
import { grokUserSearchHistory } from "./controller/groksearchController.js";
// import { createUPIPayment } from "./controller/paymentController.js";
import paymentRoutes from "./controller/paymentController.js";

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
// app.use(
//   cors({
//     origin: "http://localhost:5173", // tamaru React frontend URL
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
app.use(cors());

app.use(cors());
app.use(express.json());
// Middleware to parse JSON requests
app.use(bodyParser.json());

app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);// ✅ New AI Search Routes
// app.use("/api", searchRoutes);

app.post("/search", getAISearchResults);
app.post("/Searchhistory", getUserSearchHistory); // changed to POST
app.post("/userTokenStats", getUserTokenStats); // combined chat+search token stats for profile

app.post("/grokSearch", grokSearchResults); // changed to POST
app.post("/grokSearchhistory", grokUserSearchHistory); // changed to POST

// app.post("/api/create-upi", createUPIPayment);

const PORT = process.env.PORT || 4040;
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
