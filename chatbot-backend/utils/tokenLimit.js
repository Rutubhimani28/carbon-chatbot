import ChatSession from "../model/ChatSession.js";
import SearchHistory from "../model/SearchHistory.js";
import User from "../model/User.js";
import { getTokenLimit } from "./planTokens.js";

// ✅ Single source of truth: Calculate global token stats (same logic as getUserTokenStats)
export const getGlobalTokenStats = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // ✅ Get dynamic token limit based on user's subscription plan
  const limit = getTokenLimit({
    subscriptionPlan: user.subscriptionPlan,
    childPlan: user.childPlan,
  });


  // Chat tokens: sum of tokensUsed across all session messages
  const chatSessions = await ChatSession.find({ email });
  const chatTokensUsed = chatSessions.reduce((sum, session) => {
    return (
      sum + session.history.reduce((inner, msg) => inner + (msg.tokensUsed || 0), 0)
    );
    // return (
    //   sum +
    //   session.history.reduce(
    //     (inner, msg) => inner + (msg.isPartial ? 0 : msg.tokensUsed || 0),
    //     0
    //   )
    // );
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
    limit,
    chatTokensUsed,
    searchTokensUsed,
    totalTokensUsed,
    remainingTokens,
    totalSearches: searches.length,
    chatSessions: chatSessions.length,
  };
};

export const checkGlobalTokenLimit = async (
  email,
  newTokens = 0,
) => {
  const stats = await getGlobalTokenStats(email);
  const remaining = Math.max(0, stats.remainingTokens - newTokens);

  if (remaining <= 0) {
    const error = new Error("Not enough tokens");
    error.remainingTokens = 0;
    throw error;
  }

  return remaining;
};
