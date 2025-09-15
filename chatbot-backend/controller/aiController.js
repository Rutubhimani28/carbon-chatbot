import fetch from "node-fetch";
// import ChatSession from "../model/ChatSession.js";
import User from "../model/User.js";
import ChatSession from "../model/ChatSession.js";
import { v4 as uuidv4 } from "uuid";

// export const getAIResponse = async (req, res) => {
//   try {
//     // Validate environment variable - USE YOUR ACTUAL OPENROUTER KEY
//     // if (!process.env.OPENROUTER_API_KEY) {
//     //   throw new Error(
//     //     "OpenRouter API key is missing from environment variables"
//     //   );
//     // }

//     const { prompt, sessionId, model } = req.body;
//     console.log("prompt<<<<<<<<<<<<<<<<<<<<<<<", prompt);

//     if (!prompt) {
//       return res.status(400).json({ message: "Prompt is required" });
//     }

//     const currentSessionId = sessionId || uuidv4();
//     // let messages = [];

//     // Load conversation history if session exists
//     // if (sessionId) {
//     //   const previousMessages = await ChatSession.find({ sessionId }).sort({
//     //     create_time: 1,
//     //   });
//     //   messages = previousMessages.flatMap((msg) => [
//     //     { role: "user", content: msg.prompt },
//     //     { role: "assistant", content: msg.response },
//     //   ]);
//     // }

//     // messages.push({ role: "user", content: prompt });

//     // const response = await fetch(
//     //   "https://api.openai.com/v1/chat/completions", //  OpenAI URL
//     //   {
//     //     method: "POST",
//     //     headers: {
//     //       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, //  OpenAI key
//     //       "Content-Type": "application/json",
//     //       //  OpenRouter specific headers remove કરો
//     //       // "HTTP-Referer": "http://localhost:8080", // REMOVE THIS
//     //       // "X-Title": "Chatbot App", // REMOVE THIS
//     //     },
//     //     body: JSON.stringify({
//     //       model: model || "gpt-4o", //  OpenAI model names (without "openai/" prefix)
//     //       messages,
//     //       temperature: 0.7,
//     //     }),
//     //   }
//     // );
//     // console.log(
//     //   "Status::::::::::::::::::::::",
//     //   response.status,
//     //   response.statusText
//     // );

//     // console.log("response<<<<<<<<<<<<<<<<<<<<<<<", response);

//     // if (!response.ok) {
//     //   const errorData = await response.json();
//     //   throw new Error(errorData.error?.message || "OpenRouter API Error");
//     // }

//     // const data = await response.json();
//     // console.log("dataaaaaaaaaaaaaaaaaaaaaaaa", data);
//     // const reply = data.choices[0].message.content;

//     // // Save to database
//     // await new ChatSession({
//     //   sessionId: currentSessionId,
//     //   prompt,
//     //   response: staticReply,
//     // }).save();

//     //  Static response
//     const staticReply =
//       "Hello! I'm just a computer program, so I don't have feelings, but I'm here and ready to help you. How can I assist you today?";

//     // Save to database
//     await new ChatSession({
//       sessionId: currentSessionId,
//       prompt,
//       response: staticReply,
//     }).save();

//     res.json({
//       sessionId: currentSessionId,
//       response: staticReply,
//     });
//   } catch (error) {
//     console.error("Error in getAIResponse:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// export const getAIResponse = async (req, res) => {
//   try {
//     const { prompt, sessionId, maxWords, create_time,email } = req.body; //  frontend થી maxWords પણ લેવું
//     console.log("prompt<<<<<<<<<<<<<<<<<", prompt, "maxWords:", maxWords);

//     if (!prompt) {
//       return res.status(400).json({ message: "Prompt is required" });
//     }

//     const currentSessionId = sessionId || uuidv4();

//     //  Static response
//     const staticReply =
//       "Hello! I'm just a computer program, so I don't have feelings, but I'm here and ready to help you. How can I assist you today?";

//     //  Word limit apply કરો
//     let finalReply = staticReply;
//     if (maxWords && !isNaN(maxWords)) {
//       finalReply = staticReply.split(" ").slice(0, Number(maxWords)).join(" ");
//     }

//     // Save to DB
//     await new ChatSession({
//        email,
//       sessionId: currentSessionId,
//       prompt,
//       response: finalReply,
//       create_time: create_time ? new Date(create_time) : new Date(),
//     }).save();

//     res.json({
//       sessionId: currentSessionId,
//       response: finalReply,
//     });
//   } catch (error) {
//     console.error("Error in getAIResponse:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

export const getAIResponse = async (req, res) => {
  try {
    const { prompt, sessionId, maxWords, email } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const currentSessionId = sessionId || uuidv4();

    // Word count & tokens used
    const wordCount = prompt.trim().split(/\s+/).length;
    // const tokensUsed = Math.ceil(wordCount * 1.3);
    const tokensUsed = wordCount * 1.3;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      // જો user already DB માં છે → એને પણ 5000 tokens reset કરી દો
      user.remainingTokens = 5000;
    }

    // if (!user) {
    //   user = new User({ email, remainingTokens: 5000 });
    // }
    console.log("remainingTokens<<<<<<<<<<", user.remainingTokens);

    // Check tokens
    if (user.remainingTokens < tokensUsed) {
      return res.status(400).json({
        message: "Not enough tokens",
        remainingTokens: user.remainingTokens,
      });
    }

    // Deduct tokens
    user.remainingTokens -= tokensUsed;

    // Generate static reply (replace later with real model call)
    const staticReply =
      "Hello! I'm just a computer program, so I don't have feelings, but I'm here and ready to help you. How can I assist you today?";

    // Apply dropdown limit
    let finalReply = staticReply;
    if (maxWords && !isNaN(maxWords)) {
      finalReply = staticReply.split(" ").slice(0, Number(maxWords)).join(" ");
    }

    // Calculate tokens for AI response
    // const aiWordCount = finalReply.trim().split(/\s+/).length;
    // const aiTokensUsed = Math.ceil(aiWordCount * 1.3);
    // const totalTokensUsed = tokensUsed + aiTokensUsed;
    const totalTokensUsed = tokensUsed;

    // Check tokens again for AI response
    if (user.remainingTokens < totalTokensUsed) {
      return res.status(400).json({
        message: "Not enough tokens for the response",
        remainingTokens: user.remainingTokens,
      });
    }
    // Deduct tokens
    user.remainingTokens -= totalTokensUsed;

    // Find or create session
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
    console.log("tokensUsed<<<<<<<<<<", tokensUsed);
    console.log("totalTokensUsed<<<<<<<<<<", totalTokensUsed);

    // Push to session history
    session.history.push({
      prompt,
      response: finalReply,
      wordCount,
      tokensUsed,
      totalTokensUsed,
      create_time: new Date(),
    });

    // Save both
    await user.save();
    await session.save();

    res.json({
      sessionId: currentSessionId,
      response: finalReply,
      remainingTokens: user.remainingTokens,
      tokensUsed,
      totalTokensUsed,
    });
  } catch (error) {
    console.error("Error in getAIResponse:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// const response = await fetch(
//   "https://openrouter.ai/api/v1/chat/completions",
//   {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // CORRECT - using env variable
//       "HTTP-Referer": "http://localhost:8080", // Update this to your actual domain
//       "X-Title": "Chatbot App",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: model || "openai/gpt-4o", // Good default choice
//       // model: model || "google/gemini-pro", // Good default choice
//       // model: "google/gemini-pro:free",
//       messages,
//       temperature: 0.7 ,
//     }),
//   }
// );

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

//     // const formattedHistory = session.history.flatMap((msg) => [
//     //   { role: "user", content: msg.prompt },
//     //   { role: "model", content: msg.response },
//     // ]);

//     // Format history with token information
//     const formattedHistory = [];
//     session.history.forEach((msg) => {
//       formattedHistory.push({
//         role: "user",
//         content: msg.prompt,
//         tokensUsed: msg.tokensUsed || null, // Add tokens used for user message
//       });

//       formattedHistory.push({
//         role: "model",
//         content: msg.response,
//         tokensUsed: msg.tokensUsed || null, // Add tokens used for model response
//       });
//     });

//     res.json({
//       response: formattedHistory,
//       remainingTokens: user.remainingTokens,
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
      tokensUsed: msg.tokensUsed || 0,
      totalTokensUsed: msg.totalTokensUsed || 0,
      create_time: msg.create_time,
    }));

    res.json({
      response: formattedHistory,
      remainingTokens: user.remainingTokens,
      // totalTokensUsed = last message’s cumulative tokens
      totalTokensUsed:
        session.history.length > 0
          ? session.history[session.history.length - 1].totalTokensUsed
          : 0,
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

//     const sessionList = sessions.map((chat) => ({
//       session_id: chat.sessionId,
//       session_heading: chat.history.length
//         ? chat.history[0].prompt
//         : "Untitled",
//       create_time: chat.create_time,
//     }));

//     const user = await User.findOne({ email });
//     console.log("user.remainingTokens<<<<<<<<<<", user?.remainingTokens);

//     res.json({
//       response: [{ user_sessions: sessionList }],
//       remainingTokens: user ? user.remainingTokens : 0,
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

    // const sessionList = sessions.map((chat) => {
    //   const lastMessage =
    //     chat.history.length > 0 ? chat.history[chat.history.length - 1] : null;
    const sessionList = sessions.map((chat) => {
      const totalTokens = chat.history.reduce(
        (sum, msg) => sum + (msg.totalTokensUsed || 0),
        0
      );

      return {
        session_id: chat.sessionId,
        session_heading: chat.history.length
          ? chat.history[0].prompt
          : "Untitled",
        create_time: chat.create_time,
        // totalTokensUsed: lastMessage ? lastMessage.totalTokensUsed : 0,
        totalTokensUsed: totalTokens, // 👈 cumulative tokens
      };
    });

       // Sum of all sessions' totalTokensUsed
    const grandtotaltokenUsed = sessionList.reduce(
      (sum, session) => sum + (session.totalTokensUsed || 0),
      0
    );

    const user = await User.findOne({ email });
    console.log("user.remainingTokens<<<<<<<<<<", user?.remainingTokens);

    res.json({
      response: [{ user_sessions: sessionList }],
      remainingTokens: user ? user.remainingTokens : 0,
      grandtotaltokenUsed,
    });
  } catch (error) {
    console.error("Error in getAllSessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
