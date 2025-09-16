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
    const { prompt, sessionId, responseLength, email, botName } = req.body;

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
    // const staticReply =
    //   "Hello! I'm just a computer program, so I don't have feelings, but I'm here and ready to help you. How can I assist you today?";

    // Generate response based on selected bot
    let response = "";
    if (botName === "gpt-4") {
      response =
        "This is a response from GPT-4 model. It builds on the successes of previous GPT models, offering enhanced reasoning, accuracy, and the ability to process extensive inputs, such as entire documents or complex visual information.. As a person, a role model exemplifies admirable qualities such as perseverance, kindness, and leadership, serving as a source of motivation and guidance for others to develop similar strengths. As a representation, a model provides a framework to understand and predict behaviors or systems, whether it's a scientific model of planetary motion or a mathematical model in economics. In essence, a model offers a blueprint for imitation or an explanatory structure for complex phenomena. A role model is an inspirational person whom we admire and aspire to be like. They demonstrate qualities like strong work ethic, resilience in the face of challenges, and compassion for others. For instance, a parent might serve as a role model by balancing career and family life";
    } else if (botName === "assistant-x") {
      response =
        "This is a response from Assistant X model. It builds on the successes of previous GPT models, offering enhanced reasoning, accuracy, and the ability to process extensive inputs, such as entire documents or complex visual information.. As a person, a role model exemplifies admirable qualities such as perseverance, kindness, and leadership, serving as a source of motivation and guidance for others to develop similar strengths. As a representation, a model provides a framework to understand and predict behaviors or systems, whether it's a scientific model of planetary motion or a mathematical model in economics. In essence, a model offers a blueprint for imitation or an explanatory structure for complex phenomena. A role model is an inspirational person whom we admire and aspire to be like. They demonstrate qualities like strong work ethic, resilience in the face of challenges, and compassion for others. For instance, a parent might serve as a role model by balancing career and family life";
    } else if (botName === "custom-ai") {
      response =
        "This is a response from Custom AI Bot model. It builds on the successes of previous GPT models, offering enhanced reasoning, accuracy, and the ability to process extensive inputs, such as entire documents or complex visual information.. As a person, a role model exemplifies admirable qualities such as perseverance, kindness, and leadership, serving as a source of motivation and guidance for others to develop similar strengths. As a representation, a model provides a framework to understand and predict behaviors or systems, whether it's a scientific model of planetary motion or a mathematical model in economics. In essence, a model offers a blueprint for imitation or an explanatory structure for complex phenomena. A role model is an inspirational person whom we admire and aspire to be like. They demonstrate qualities like strong work ethic, resilience in the face of challenges, and compassion for others. For instance, a parent might serve as a role model by balancing career and family life";
    } else {
      // Default to GPT-3.5
      response =
        "Hello! I'm just a computer program, so I don't have feelings, but I'm here and ready to help you. How can I assist you today? . As a person, a role model exemplifies admirable qualities such as perseverance, kindness, and leadership, serving as a source of motivation and guidance for others to develop similar strengths. As a representation, a model provides a framework to understand and predict behaviors or systems, whether it's a scientific model of planetary motion or a mathematical model in economics. In essence, a model offers a blueprint for imitation or an explanatory structure for complex phenomena. A role model is an inspirational person whom we admire and aspire to be like. They demonstrate qualities like strong work ethic, resilience in the face of challenges, and compassion for others. For instance, a parent might serve as a role model by balancing career and family life. ";
    }

    // Apply dropdown limit
    // let finalReply = response;

    // if (maxWords && !isNaN(maxWords)) {
    //   finalReply = response.split(" ").slice(0, Number(maxWords)).join(" ");
    // }

    let minWords = 0;
    let maxWords = Infinity;

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
      minWords = 0;
      maxWords = Infinity; // કોઈ limit નહીં
    }

    let words = response.split(" ");
    let finalReply = words.slice(0, maxWords).join(" ");

    // (Optional) જો response બહુ નાનો હોય તો fallback logic
    if (words.length < minWords) {
      finalReply = words.join(" "); // અથવા default msg આપી શકાય
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

    const responseWordCount = finalReply.trim().split(/\s+/).length;

    // Push to session history
    session.history.push({
      prompt,
      response: finalReply,
      wordCount,
      tokensUsed,
      totalTokensUsed,
      botName: botName || "gpt-3.5", // Store botName in history
      responseLength: responseLength || "NoOptimisation",
      create_time: new Date(),
    });

    // Save both
    await user.save();
    await session.save();
    console.log("Raw session history >>>", session.history);

    res.json({
      sessionId: currentSessionId,
      response: finalReply,
      responseWordCount,
      remainingTokens: parseFloat(user.remainingTokens.toFixed(3)), //  upto 3 decimals
      tokensUsed: parseFloat(tokensUsed.toFixed(3)),
      totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
      botName: botName || "gpt-3.5", // Include botName in response
      responseLength: responseLength || "NoOptimisation",
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
    // console.log("Raw session history >>>", session.history);
    // Format history with token info
    const formattedHistory = session.history.map((msg) => ({
      prompt: msg.prompt,
      response: msg.response,
      tokensUsed: parseFloat((msg.tokensUsed || 0).toFixed(3)),
      totalTokensUsed: parseFloat((msg.totalTokensUsed || 0).toFixed(3)),
      botName: msg.botName,
      create_time: msg.create_time,
    }));

    const totalTokensUsed = session.history.reduce(
      (sum, msg) => sum + (msg.tokensUsed || 0),
      0
    );

    const remainingTokens = 5000 - totalTokensUsed;

    res.json({
      response: formattedHistory,
      remainingTokens: parseFloat(remainingTokens.toFixed(3)),
      // totalTokensUsed = last message’s cumulative tokens
      totalTokensUsed: parseFloat(totalTokensUsed.toFixed(3)),
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
        totalTokensUsed: parseFloat(totalTokens.toFixed(3)), //  cumulative tokens
      };
    });

    // Sum of all sessions' totalTokensUsed
    const grandtotaltokenUsed = sessionList.reduce(
      (sum, session) => sum + (session.totalTokensUsed || 0),
      0
    );

    const remainingTokens = 5000 - grandtotaltokenUsed;

    // const user = await User.findOne({ email });
    console.log("user.remainingTokens<<<<<<<<<<", remainingTokens);

    res.json({
      response: [{ user_sessions: sessionList }],
      remainingTokens: parseFloat(remainingTokens.toFixed(3)),
      grandtotaltokenUsed: parseFloat(grandtotaltokenUsed.toFixed(3)),
    });
  } catch (error) {
    console.error("Error in getAllSessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
