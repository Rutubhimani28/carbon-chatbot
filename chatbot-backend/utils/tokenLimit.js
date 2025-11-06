import ChatSession from "../model/ChatSession.js";
import SearchHistory from "../model/SearchHistory.js"; 

// ✅ Single source of truth: Calculate global token stats (same logic as getUserTokenStats)
export const getGlobalTokenStats = async (email, limit = 10000) => {
  // Chat tokens: sum of tokensUsed across all session messages
  const chatSessions = await ChatSession.find({ email });
  const chatTokensUsed = chatSessions.reduce((sum, session) => {
    return (
      sum + session.history.reduce((inner, msg) => inner + (msg.tokensUsed || 0), 0)
    );
  }, 0);

  // Search tokens: sum of summaryTokenCount across user search history
  const searches = await SearchHistory.find({ email });
  const searchTokensUsed = searches.reduce(
    (sum, s) => sum + (s.summaryTokenCount || 0),
    0
  );

  const totalTokensUsed = chatTokensUsed + searchTokensUsed;
  const remainingTokens = Math.max(0, limit - totalTokensUsed);

  return {
    chatTokensUsed,
    searchTokensUsed,
    totalTokensUsed,
    remainingTokens,
    totalSearches: searches.length,
    chatSessions: chatSessions.length,
  };
};

export const checkGlobalTokenLimit = async (email, newTokens = 0, limit = 10000) => {
  const stats = await getGlobalTokenStats(email, limit);
  const remaining = Math.max(0, stats.remainingTokens - newTokens);
  
  if (remaining <= 0) {
    const error = new Error("Not enough tokens");
    error.remainingTokens = 0;
    throw error;
  }

  return remaining;
};
