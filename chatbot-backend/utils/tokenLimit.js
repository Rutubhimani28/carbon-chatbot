import ChatSession from "../model/ChatSession.js";

export const checkGlobalTokenLimit = async (email, newTokens = 0, limit = 10000) => {
  const allSessions = await ChatSession.find({ email });
  const grandTotalTokens = allSessions.reduce((sum, s) => {
    return sum + s.history.reduce((entrySum, e) => entrySum + (e.tokensUsed || 0), 0);
  }, 0);

  const remaining = Math.max(0, limit - grandTotalTokens - newTokens);
  if (remaining <= 0) {
    const error = new Error("Not enough tokens");
    error.remainingTokens = 0;
    throw error;
  }

  return remaining;
};
