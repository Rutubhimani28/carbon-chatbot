import express from "express";
import { getAIResponse } from "../controller/aiController.js";
import { getChatHistory } from "../controller/aiController.js";
import { getAllSessions } from "../controller/aiController.js";
// import { validatePrompt } from "../middlewares/validatePrompt.js";

const router = express.Router();

router.post("/ask", getAIResponse);
router.post("/history", getChatHistory);
router.post("/get_user_sessions", getAllSessions);

export default router;
