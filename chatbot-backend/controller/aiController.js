import fetch from "node-fetch";
// import ChatSession from "../model/ChatSession.js";
import User from "../model/User.js";
import ChatSession from "../model/ChatSession.js";
import { v4 as uuidv4 } from "uuid";

// ------------------------------------------------------------------

// export const getAIResponse = async (req, res) => {
//   try {
//     const { prompt, sessionId, responseLength, email, botName } = req.body;

//     if (!prompt) {
//       return res.status(400).json({ message: "Prompt is required" });
//     }
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     const currentSessionId = sessionId || uuidv4();

//     // Word count & tokens used
//     const wordCount = prompt.trim().split(/\s+/).length;
//     const tokensUsed = wordCount * 1.3;

//     // Find or create user
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     } else {
//       // Reset tokens (example)
//       user.remainingTokens = 5000;
//     }

//     if (user.remainingTokens < tokensUsed) {
//       return res.status(400).json({
//         message: "Not enough tokens",
//         remainingTokens: user.remainingTokens,
//       });
//     }

//     user.remainingTokens -= tokensUsed;

//     // ✅ Always use chatgpt-5-mini (o4-mini)
//     const model = "o4-mini";
//     const apiUrl = "https://api.openai.com/v1/chat/completions";
//     const apiKey = process.env.OPENAI_API_KEY;

//     // ====== Response Length optimisation ======
//     let minWords = 0,
//       maxWords = Infinity;
//     if (responseLength === "Short") {
//       minWords = 50;
//       maxWords = 100;
//     } else if (responseLength === "Concise") {
//       minWords = 150;
//       maxWords = 250;
//     } else if (responseLength === "Long") {
//       minWords = 300;
//       maxWords = 500;
//     } else if (responseLength === "NoOptimisation") {
//       minWords = 500;
//       maxWords = Infinity;
//     }

//     // Build messages
//     let messages = [
//       {
//         role: "system",
//         content: `You are an AI assistant. Always write a response strictly between ${minWords} and ${maxWords} words.`,
//       },
//       { role: "user", content: prompt },
//     ];

//     // 🔥 API Call
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model,
//         messages,
//         // temperature: 0.7,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error?.message || "API Error");
//     }

//     const data = await response.json();
//     let finalReply = data.choices[0].message.content.trim();

//     // Word count check
//     let responseWordCount = finalReply.split(/\s+/).length;

//     const totalTokensUsed = tokensUsed;
//     if (user.remainingTokens < totalTokensUsed) {
//       return res.status(400).json({
//         message: "Not enough tokens for the response",
//         remainingTokens: user.remainingTokens,
//       });
//     }
//     user.remainingTokens -= totalTokensUsed;

//     // Save session
//     let session = await ChatSession.findOne({
//       sessionId: currentSessionId,
//       email,
//     });
//     if (!session) {
//       session = new ChatSession({
//         email,
//         sessionId: currentSessionId,
//         history: [],
//       });
//     }

//     session.history.push({
//       prompt,
//       response: finalReply,
//       wordCount,
//       tokensUsed,
//       totalTokensUsed,
//       botName: "chatgpt-5-mini",
//       responseLength: responseLength || "NoOptimisation",
//       create_time: new Date(),
//     });

//     await user.save();
//     await session.save();

//     res.json({
//       sessionId: currentSessionId,
//       response: finalReply,
//       responseWordCount,
//       remainingTokens: parseFloat(user.remainingTokens.toFixed(3)),
//       tokensUsed: parseFloat(tokensUsed.toFixed(3)),
//       totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
//       botName: "chatgpt-5-mini",
//       responseLength: responseLength || "NoOptimisation",
//     });
//   } catch (error) {
//     console.error("Error in getAIResponse:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };
const handleTokens = (
  promptWordCount,
  responseWordCount,
  sessions,
  session,
  payload
) => {
  // Step 1: Prompt + Response token calculation
  const totalWords = promptWordCount + responseWordCount;
  const tokensUsed = parseFloat((totalWords * 1.3).toFixed(3));

  // Step 2: Global calculation (all sessions)
  const grandtotaltokenUsed = sessions.reduce((sum, chat) => {
    return sum + chat.history.reduce((s, msg) => s + (msg.tokensUsed || 0), 0);
  }, 0);

  const remainingTokens = parseFloat((5000 - grandtotaltokenUsed).toFixed(3));

  // Step 3: Update session
  const sessionTotal = session.history.reduce(
    (sum, msg) => sum + (msg.tokensUsed || 0),
    0
  );
  const totalTokensUsed = parseFloat((sessionTotal + tokensUsed).toFixed(3));

  session.history.push({
    ...payload,
    totalWords,
    tokensUsed,
    totalTokensUsed,
    create_time: new Date(),
  });

  // Final return
  return {
    totalWords,
    tokensUsed,
    totalTokensUsed,
    grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
    remainingTokens,
  };
};

// export const getAIResponse = async (req, res) => {
//   try {
//     const { prompt, sessionId, responseLength, email, botName } = req.body;

//     if (!prompt) {
//       return res.status(400).json({ message: "Prompt is required" });
//     }
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }
//     if (!botName) {
//       return res.status(400).json({ message: "botName is required" });
//     }

//     const currentSessionId = sessionId || uuidv4();

//     // Prompt word count
//     const promptWordCount = prompt.trim().split(/\s+/).length;

//     // Word count & tokens used
//     // const wordCount = prompt.trim().split(/\s+/).length;
//     // const tokensUsed = wordCount * 1.3;

//     // Find user
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // if (user.remainingTokens < tokensUsed) {
//     //   return res.status(400).json({
//     //     message: "Not enough tokens",
//     //     remainingTokens: user.remainingTokens,
//     //   });
//     // }
//     // user.remainingTokens -= tokensUsed;

//     // ====== Response Length optimisation ======
//     let minWords = 0,
//       maxWords = Infinity;
//     if (responseLength === "Short") {
//       minWords = 50;
//       maxWords = 100;
//     } else if (responseLength === "Concise") {
//       minWords = 150;
//       maxWords = 250;
//     } else if (responseLength === "Long") {
//       minWords = 300;
//       maxWords = 500;
//     } else if (responseLength === "NoOptimisation") {
//       minWords = 500;
//       maxWords = Infinity;
//     }

//     // Build messages
//     // let messages = [
//     //   {
//     //     role: "system",
//     //     content: `You are an AI assistant. Always write a response strictly between ${minWords} and ${maxWords} words.`,
//     //   },
//     //   { role: "user", content: prompt },
//     // ];

//     let messages = [
//       {
//         role: "system",
//         content: `You are an AI assistant. IMPORTANT: Your response MUST be between ${minWords} and ${maxWords} words.
//     - If response is shorter than ${minWords}, expand it.
//     - If response is longer than ${maxWords}, cut it down.
//     Never exceed these word limits.`,
//       },
//       { role: "user", content: prompt },
//     ];

//     // ============= botName wise configuration =============
//     let apiUrl, apiKey, payload, modelName;

//     if (botName === "chatgpt-5-mini") {
//       apiUrl = "https://api.openai.com/v1/chat/completions";
//       apiKey = process.env.OPENAI_API_KEY;
//       modelName = "gpt-4o-mini"; // real model name
//       payload = {
//         model: modelName,
//         messages,
//         temperature: 0.7,
//       };
//     } else if (botName === "deepseek") {
//       apiUrl = "https://api.deepseek.com/v1/chat/completions";
//       apiKey = process.env.DEEPSEEK_API_KEY;
//       modelName = "deepseek-chat";
//       payload = {
//         model: modelName,
//         messages,
//         temperature: 0.7,
//       };
//     } else if (botName === "grok") {
//       apiUrl = "https://api.x.ai/v1/chat/completions";
//       apiKey = process.env.GROK_API_KEY;
//       modelName = "grok-beta";
//       payload = {
//         model: modelName,
//         messages,
//         temperature: 0.7,
//       };
//     } else {
//       return res.status(400).json({ message: "Invalid botName selected" });
//     }

//     // 🔥 API Call
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error?.message || "API Error");
//     }

//     const data = await response.json();
//     let finalReply = data.choices[0].message.content.trim();

//     // Word count for response
//     const responseWordCount = finalReply.split(/\s+/).length;

//     // 🔄 Tokens Calculation (Prompt + Response)
//     const totalWords = promptWordCount + responseWordCount;
//     const tokensUsed = totalWords * 1.3;

//     // Get all sessions of this user to calculate grand total
//     const sessions = await ChatSession.find({ email });
//     const grandtotaltokenUsed = sessions.reduce((sum, chat) => {
//       return (
//         sum + chat.history.reduce((s, msg) => s + (msg.tokensUsed || 0), 0)
//       );
//     }, 0);

//     const remainingTokens = 5000 - grandtotaltokenUsed;

//     //  Check balance
//     if (remainingTokens <= 0 || remainingTokens < tokensUsed) {
//       return res.status(400).json({
//         message: "Not enough tokens",
//         remainingTokens: parseFloat(remainingTokens.toFixed(3)),
//         grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
//       });
//     }

//     // Check balance
//     // if (user.remainingTokens < tokensUsed) {
//     //   return res.status(400).json({
//     //     message:"Not enough tokens for the response",
//     //     remainingTokens: user.remainingTokens,
//     //   });
//     // }
//     // user.remainingTokens -= tokensUsed;

//     // Save session
//     // Find existing session
//     let session = await ChatSession.findOne({
//       sessionId: currentSessionId,
//       email,
//     });
//     if (!session) {
//       session = new ChatSession({
//         email,
//         sessionId: currentSessionId,
//         history: [],
//       });
//     }

//     // Calculate total tokens used in this session
//     const sessionTotal = session.history.reduce(
//       (sum, msg) => sum + (msg.tokensUsed || 0),
//       0
//     );
//     const totalTokensUsed = sessionTotal + tokensUsed;

//     session.history.push({
//       prompt,
//       response: finalReply,
//       promptWordCount,
//       responseWordCount,
//       totalWords,
//       tokensUsed,
//       totalTokensUsed,
//       botName, //  direct botName save
//       responseLength: responseLength || "NoOptimisation",
//       create_time: new Date(),
//     });

//     await user.save();
//     await session.save();

//     res.json({
//       sessionId: currentSessionId,
//       response: finalReply,
//       responseWordCount,
//       remainingTokens: parseFloat(remainingTokens.toFixed(3)),
//       grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
//       tokensUsed: parseFloat(tokensUsed.toFixed(3)),
//       totalWords,
//       totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
//       botName,
//       responseLength: responseLength || "NoOptimisation",
//     });
//   } catch (error) {
//     console.error("Error in getAIResponse:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

export const getAIResponse = async (req, res) => {
  try {
    const { prompt, sessionId, responseLength, email, botName } = req.body;

    if (!prompt) return res.status(400).json({ message: "Prompt is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!botName)
      return res.status(400).json({ message: "botName is required" });

    const currentSessionId = sessionId || uuidv4();

    // Prompt word count
    const promptWordCount = prompt.trim().split(/\s+/).length;

    // ====== Response Length optimisation ======
    let minWords = 0,
      maxWords = Infinity;
    if (responseLength === "Short") {
      minWords = 50;
      maxWords = 100;
    } else if (responseLength === "Concise") {
      minWords = 150;
      maxWords = 250;
    } else if (responseLength === "Long") {
      minWords = 300;
      maxWords = 500;
    } else if (responseLength === "NoOptimisation") {
      minWords = 500;
      maxWords = Infinity;
    }

    let messages = [
      {
        role: "system",
        content: `You are an AI assistant. IMPORTANT: Your response MUST be between ${minWords} and ${maxWords} words. 
        - If response is shorter than ${minWords}, expand it.
        - If response is longer than ${maxWords}, cut it down.
        Never exceed these word limits.`,
      },
      { role: "user", content: prompt },
    ];

    // ============= botName wise configuration =============
    let apiUrl, apiKey, payload, modelName;
    if (botName === "chatgpt-5-mini") {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      apiKey = process.env.OPENAI_API_KEY;
      modelName = "gpt-4o-mini";
    } else if (botName === "deepseek") {
      apiUrl = "https://api.deepseek.com/v1/chat/completions";
      apiKey = process.env.DEEPSEEK_API_KEY;
      modelName = "deepseek-chat";
    } else if (botName === "grok") {
      apiUrl = "https://api.x.ai/v1/chat/completions";
      apiKey = process.env.GROK_API_KEY;
      modelName = "grok-beta";
    } else {
      return res.status(400).json({ message: "Invalid botName selected" });
    }

    payload = { model: modelName, messages, temperature: 0.7 };

    // 🔥 API Call
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API Error");
    }

    const data = await response.json();
    let finalReply = data.choices[0].message.content.trim();

    // Response word count
    const responseWordCount = finalReply.split(/\s+/).length;

    // Get all sessions of this user
    const sessions = await ChatSession.find({ email });

    // Find/create current session
    let session = await ChatSession.findOne({
      sessionId: currentSessionId,
      email,
    });
    if (!session) {
      session = new ChatSession({
        email,
        sessionId: currentSessionId,
        history: [],
      });
    }

    // ✅ Use handleTokens utility
    const tokenStats = handleTokens(
      promptWordCount,
      responseWordCount,
      sessions,
      session,
      {
        prompt,
        response: finalReply,
        promptWordCount,
        responseWordCount,
        botName,
        responseLength: responseLength || "NoOptimisation",
      }
    );

    // Token balance check
    if (
      tokenStats.remainingTokens <= 0 ||
      tokenStats.remainingTokens < tokenStats.tokensUsed
    ) {
      return res.status(400).json({
        message: "Not enough tokens",
        remainingTokens: tokenStats.remainingTokens,
        grandtotaltokenUsed: tokenStats.grandtotaltokenUsed,
      });
    }

    // Save DB
    await session.save();

    res.json({
      sessionId: currentSessionId,
      response: finalReply,
      ...tokenStats, // includes totalWords, tokensUsed, totalTokensUsed, grandtotaltokenUsed, remainingTokens
      botName,
      responseLength: responseLength || "NoOptimisation",
    });
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// export const getChatHistory = async (req, res) => {
//   try {
//     const { sessionId, email } = req.body;
//     if (!sessionId || !email) {
//       return res
//         .status(400)
//         .json({ message: "SessionId & Email are required" });
//     }

//     const session = await ChatSession.findOne({ sessionId, email });
//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // console.log("Raw session history >>>", session.history);
//     // Format history with token info
//     const formattedHistory = session.history.map((msg) => ({
//       prompt: msg.prompt,
//       response: msg.response,
//       tokensUsed: parseFloat((msg.tokensUsed || 0).toFixed(3)),
//       totalTokensUsed: parseFloat((msg.totalTokensUsed || 0).toFixed(3)),
//       botName: msg.botName,
//       create_time: msg.create_time,
//     }));

//     const totalTokensUsed = session.history.reduce(
//       (sum, msg) => sum + (msg.tokensUsed || 0),
//       0
//     );

//     const remainingTokens = 5000 - totalTokensUsed;

//     res.json({
//       response: formattedHistory,
//       // remainingTokens: parseFloat(remainingTokens.toFixed(3)),
//       // totalTokensUsed = last message’s cumulative tokens
//       totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
//     });
//   } catch (error) {
//     console.error("Error in getChatHistory:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const getChatHistory = async (req, res) => {
  try {
    const { sessionId, email } = req.body;
    if (!sessionId || !email) {
      return res
        .status(400)
        .json({ message: "SessionId & Email are required" });
    }

    const session = await ChatSession.findOne({ sessionId, email });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format history with token info
    const formattedHistory = session.history.map((msg) => ({
      prompt: msg.prompt,
      response: msg.response,
      tokensUsed: parseFloat((msg.tokensUsed || 0).toFixed(3)),
      totalTokensUsed: parseFloat((msg.totalTokensUsed || 0).toFixed(3)),
      botName: msg.botName,
      create_time: msg.create_time,
    }));

    // ✅ last entry has cumulative tokens (totalTokensUsed)
    const lastEntry = session.history[session.history.length - 1];
    const totalTokensUsed = lastEntry ? lastEntry.totalTokensUsed : 0;

    // ✅ global tokens calculation (all sessions)
    const sessions = await ChatSession.find({ email });
    const grandtotaltokenUsed = sessions.reduce((sum, chat) => {
      return (
        sum + chat.history.reduce((s, msg) => s + (msg.tokensUsed || 0), 0)
      );
    }, 0);

    const remainingTokens = parseFloat((5000 - grandtotaltokenUsed).toFixed(3));

    res.json({
      response: formattedHistory,
      totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
      grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
      remainingTokens,
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const getAllSessions = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     const sessions = await ChatSession.find({ email }).sort({
//       create_time: -1,
//     });

//     // const sessionList = sessions.map((chat) => {
//     //   const lastMessage =
//     //     chat.history.length > 0 ? chat.history[chat.history.length - 1] : null;
//     const sessionList = sessions.map((chat) => {
//       const totalTokens = chat.history.reduce(
//         (sum, msg) => sum + (msg.totalTokensUsed || 0),
//         0
//       );
//       // console.log(
//       //   "totalTokens for session:::::=======",
//       //   chat.sessionId,
//       //   totalTokens
//       // );
//       console.log("chat.history:::::=======", chat.history);
//       return {
//         session_id: chat.sessionId,
//         session_heading: chat.history.length
//           ? chat.history[0].prompt
//           : "Untitled",
//         create_time: chat.create_time,
//         // totalTokensUsed: lastMessage ? lastMessage.totalTokensUsed : 0,
//         totalTokensUsed: parseFloat(totalTokens.toFixed(3)), //  cumulative tokens
//       };
//     });

//     // Sum of all sessions' totalTokensUsed
//     const grandtotaltokenUsed = sessionList.reduce(
//       (sum, session) => sum + (session.totalTokensUsed || 0),
//       0
//     );

//     const remainingTokens = 5000 - grandtotaltokenUsed;

//     // const user = await User.findOne({ email });
//     console.log("user.remainingTokens<<<<<<<<<<", remainingTokens);

//     res.json({
//       response: [{ user_sessions: sessionList }],
//       remainingTokens: parseFloat(remainingTokens.toFixed(3)),
//       grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
//     });
//   } catch (error) {
//     console.error("Error in getAllSessions:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const getAllSessions = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const sessions = await ChatSession.find({ email }).sort({
      create_time: -1,
    });

    const sessionList = sessions.map((chat) => {
      // ✅ last message = cumulative tokens of that session
      const lastEntry = chat.history[chat.history.length - 1];
      const totalTokensUsed = lastEntry ? lastEntry.totalTokensUsed : 0;

      return {
        session_id: chat.sessionId,
        session_heading: chat.history.length
          ? chat.history[0].prompt
          : "Untitled",
        create_time: chat.create_time,
        totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
      };
    });

    // ✅ global sum across all sessions
    const grandtotaltokenUsed = sessionList.reduce(
      (sum, session) => sum + (session.totalTokensUsed || 0),
      0
    );

    const remainingTokens = parseFloat((5000 - grandtotaltokenUsed).toFixed(3));

    res.json({
      response: [{ user_sessions: sessionList }],
      remainingTokens,
      grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
    });
  } catch (error) {
    console.error("Error in getAllSessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
