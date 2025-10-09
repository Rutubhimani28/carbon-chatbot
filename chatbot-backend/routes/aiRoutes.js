import express from "express";
import { getAIResponse } from "../controller/aiController.js";
import { getChatHistory } from "../controller/aiController.js";
import { getAllSessions } from "../controller/aiController.js";
import { registerUser, loginUser } from "../controller/authController.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/ask", getAIResponse);
router.post("/history", getChatHistory);
router.post("/get_user_sessions", getAllSessions);


export default router;
