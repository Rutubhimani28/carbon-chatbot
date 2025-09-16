import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  List,
  ListItemText,
  Divider,
  Button,
  Paper,
  FormControl,
  Select,
  ListItemButton,
  CircularProgress,
  Skeleton,
  MenuItem,
  Menu,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Send as SendIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";
import KeyboardArrowDownTwoToneIcon from "@mui/icons-material/KeyboardArrowDownTwoTone";
import LogoutTwoToneIcon from "@mui/icons-material/LogoutTwoTone";
import leaf from "././assets/leaf.png"; // path adjust karo according to folder
import Mainlogo from "././assets/Mainlogo.png"; // path adjust karo

// Mock logo - replace with your actual logo import
const Logo = () => (
  <Avatar sx={{ bgcolor: "#2F67F6", width: 32, height: 32 }}>
    <Typography variant="body2" sx={{ color: "white" }}>
      AI
    </Typography>
  </Avatar>
);

const ChatUI = () => {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messageGroups, setMessageGroups] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const abortControllerRef = useRef(null);
  const isStoppedRef = useRef(false);
  const [maxWords, setMaxWords] = useState(10);
  const [skipHistoryLoad, setSkipHistoryLoad] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedBot, setSelectedBot] = useState("gpt-3.5");
  const [openProfile, setOpenProfile] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);

  // In your state initialization
  // const [messageGroups, setMessageGroups] = useState([]);

  // State for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const handleClick = (event, idx, tokens) => {
    setAnchorEl(event.currentTarget);
    setActiveGroup(idx);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveGroup(null);
  };
  const [anchorsEl, setAnchorsEl] = useState(null);

  const handleToggleMenu = (event) => {
    if (anchorsEl) {
      // જો પહેલેથી open છે → close
      setAnchorsEl(null);
    } else {
      // નહીતર open
      setAnchorsEl(event.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setAnchorsEl(null);
  };

  // Add this function to generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;
  const email = user?.email;

  useEffect(() => {
    const lastSessionId = localStorage.getItem("lastChatSessionId");
    if (lastSessionId) {
      setSelectedChatId(lastSessionId);

      // Load token count from localStorage
      const savedTokens = localStorage.getItem(`tokens_${lastSessionId}`);
      if (savedTokens) {
        console.log("Restored tokens:", savedTokens);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const currentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // const fetchChatSessions = async () => {
  //   setSessionLoading(true);
  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user || !user.email) return;

  //     const response = await fetch(
  //       "http://localhost:8080/api/ai/get_user_sessions",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ email: user.email }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("API Response:", data);

  //     // Process the sessions based on API response
  //     let sessions = [];

  //     if (data.response && Array.isArray(data.response)) {
  //       if (data.response[0] && data.response[0].user_sessions) {
  //         sessions = data.response[0].user_sessions.map((session) => {
  //           // Save token count to localStorage
  //           if (session.remainingTokens !== undefined) {
  //             localStorage.setItem(
  //               `tokens_${session.session_id}`,
  //               session.remainingTokens.toString()
  //             );
  //           }
  //           return {
  //             id: session.session_id,
  //             name:
  //               session.session_heading ||
  //               `Chat ${session.session_id.slice(0, 8)}`,
  //             sessionId: session.session_id,
  //             createTime: session.create_time || new Date().toISOString(),
  //             remainingTokens: session.remainingTokens,
  //           };
  //         });
  //       } else {
  //         sessions = data.response.map((session) => {
  //           if (session.remainingTokens !== undefined) {
  //             localStorage.setItem(
  //               `tokens_${session.session_id}`,
  //               session.remainingTokens.toString()
  //             );
  //           }
  //           return {
  //             id: session.session_id,
  //             name:
  //               session.session_heading ||
  //               session.name ||
  //               `Chat ${session.session_id.slice(0, 8)}`,
  //             sessionId: session.session_id,
  //             createTime:
  //               session.create_time ||
  //               session.createTime ||
  //               new Date().toISOString(),
  //             remainingTokens: session.remainingTokens,
  //           };
  //         });
  //       }
  //     }

  //     setChats(sessions);

  //     // Select the first chat if none is selected
  //     if (initialLoad && sessions.length > 0 && !selectedChatId) {
  //       const firstSessionId = sessions[0].id;
  //       setSelectedChatId(firstSessionId);
  //       localStorage.setItem("lastChatSessionId", firstSessionId);
  //       loadChatHistory(sessions[0].sessionId);
  //     }
  //   } catch (error) {
  //     console.error("API Error:", error);
  //   } finally {
  //     setSessionLoading(false);
  //     setInitialLoad(false);
  //   }
  // };
  const fetchChatSessions = async () => {
    setSessionLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) return;

      const response = await fetch(
        "http://localhost:8080/api/ai/get_user_sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Process the sessions based on API response
      let sessions = [];
      let userRemainingTokens = 0;
      let userTotalTokensUsed = 0;

      // Extract remaining tokens and total tokens used from the response
      if (data.remainingTokens !== undefined) {
        userRemainingTokens = data.remainingTokens;
        setRemainingTokens(userRemainingTokens);
      }

      if (data.grandtotaltokenUsed !== undefined) {
        userTotalTokensUsed = data.grandtotaltokenUsed;
        setTotalTokensUsed(userTotalTokensUsed);
      }

      // Handle different response structures
      if (data.response && Array.isArray(data.response)) {
        // Structure 1: response: [{ user_sessions: [...] }]
        if (data.response[0] && data.response[0].user_sessions) {
          sessions = data.response[0].user_sessions.map((session) => {
            // Save token count to localStorage
            if (session.totalTokensUsed !== undefined) {
              localStorage.setItem(
                `tokens_${session.session_id}`,
                session.totalTokensUsed.toString()
              );
            }
            return {
              id: session.session_id,
              name:
                session.session_heading ||
                `Chat ${session.session_id.slice(0, 8)}`,
              sessionId: session.session_id,
              createTime: session.create_time || new Date().toISOString(),
              totalTokensUsed: session.totalTokensUsed || 0,
            };
          });
        }
        // Structure 2: response: [{ session_id, session_heading, ... }]
        else {
          sessions = data.response.map((session) => {
            if (session.totalTokensUsed !== undefined) {
              localStorage.setItem(
                `tokens_${session.session_id}`,
                session.totalTokensUsed.toString()
              );
            }
            return {
              id: session.session_id,
              name:
                session.session_heading ||
                session.name ||
                `Chat ${session.session_id.slice(0, 8)}`,
              sessionId: session.session_id,
              createTime:
                session.create_time ||
                session.createTime ||
                new Date().toISOString(),
              totalTokensUsed: session.totalTokensUsed || 0,
            };
          });
        }
      }

      setChats(sessions);

      // Select the first chat if none is selected
      if (initialLoad && sessions.length > 0 && !selectedChatId) {
        const firstSessionId = sessions[0].id;
        setSelectedChatId(firstSessionId);
        localStorage.setItem("lastChatSessionId", firstSessionId);
        loadChatHistory(sessions[0].sessionId);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setSessionLoading(false);
      setInitialLoad(false);
    }
  };

  const getChatHistory = async (sessionId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) return [];

      const response = await fetch("http://localhost:8080/api/ai/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email: user.email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract token information from the response
      if (data.remainingTokens !== undefined) {
        setRemainingTokens(data.remainingTokens);
      }

      if (data.totalTokensUsed !== undefined) {
        setTotalTokensUsed(data.totalTokensUsed);
      }

      return data.response || [];
    } catch (error) {
      console.error("API Error:", error);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!historyLoading && messageGroups.length > 0) {
      scrollToBottom();
    }
  }, [historyLoading, messageGroups, scrollToBottom]);

  // useEffect(() => {
  //   fetchChatSessions();
  // }, []);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      // Redirect to login if no user data
      window.location.href = "/login";
      return;
    }

    const lastSessionId = localStorage.getItem("lastChatSessionId");
    if (lastSessionId) {
      setSelectedChatId(lastSessionId);

      // Load token count from localStorage
      const savedTokens = localStorage.getItem(`tokens_${lastSessionId}`);
      if (savedTokens) {
        console.log("Restored tokens:", savedTokens);
      }
    }

    // Fetch chat sessions after confirming user exists
    fetchChatSessions();
  }, []);

  useEffect(() => {
    if (skipHistoryLoad) {
      setSkipHistoryLoad(false);
      return;
    }

    if (selectedChatId) {
      const selectedChat = chats.find((chat) => chat.id === selectedChatId);
      if (selectedChat) {
        if (selectedChat.sessionId) {
          loadChatHistory(selectedChat.sessionId);

          // Load the latest token count for this session
          const savedTokens = localStorage.getItem(
            `tokens_${selectedChat.sessionId}`
          );
          if (savedTokens) {
            setRemainingTokens(Number(savedTokens)); // ✅ add this line
            console.log("Current tokens:", savedTokens);
          }
        } else {
          setMessageGroups([[]]);
        }
      }
    }
  }, [selectedChatId, skipHistoryLoad]);

  const loadChatHistory = async (sessionId) => {
    if (!sessionId) {
      setMessageGroups([[]]);
      return;
    }

    setHistoryLoading(true);

    try {
      // Fetch from API
      const rawHistory = await getChatHistory(sessionId);

      // Load token count from localStorage
      // const savedTokens = localStorage.getItem(`tokens_${sessionId}`);
      // const tokenCount = savedTokens ? parseInt(savedTokens) : null;

      // Process the history into message groups
      const processedGroups = [];

      for (let i = 0; i < rawHistory.length; i++) {
        const message = rawHistory[i];

        // if (message.role === "user") {
        //   // Find the corresponding model response
        //   let modelResponse = null;
        //   let tokensUsed = null;
        //   let j = i + 1;

        //   while (j < rawHistory.length && rawHistory[j].role !== "user") {
        //     if (rawHistory[j].role === "model") {
        //       modelResponse = rawHistory[j];
        //       // Extract tokens used from the response if available
        //       tokensUsed = modelResponse.tokensUsed || null;
        //       break;
        //     }
        //     j++;
        //   }

        //   if (modelResponse) {
        //     processedGroups.push({
        //       prompt: message.content,
        //       responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
        //       time: new Date(
        //         message.timestamp || message.create_time || Date.now()
        //       ).toLocaleTimeString([], {
        //         hour: "2-digit",
        //         minute: "2-digit",
        //       }),
        //       currentSlide: 0,
        //       isTyping: false,
        //       isComplete: true,
        //       // tokensUsed: message.tokensUsed || null, // Add this line
        //       tokensUsed: tokensUsed, // Store tokens used
        //     });
        //   } else {
        //     // Handle case where there's a user message but no response yet
        //     processedGroups.push({
        //       prompt: message.content,
        //       responses: ["No response available"],
        //       time: new Date(
        //         message.timestamp || message.create_time || Date.now()
        //       ).toLocaleTimeString([], {
        //         hour: "2-digit",
        //         minute: "2-digit",
        //       }),
        //       currentSlide: 0,
        //       isTyping: false,
        //       isComplete: true,
        //       tokensUsed: null,
        //     });
        //   }
        // }

        // The backend now returns objects with prompt, response, tokensUsed, etc.
        if (message.prompt) {
          // This is a user message with a prompt field
          processedGroups.push({
            prompt: message.prompt,
            responses: [
              message.response
                ? message.response.replace(/\n\n/g, "<br/>")
                : "No response available",
            ],
            time: new Date(
              message.create_time || Date.now()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            currentSlide: 0,
            isTyping: false,
            isComplete: true,
            tokensUsed: message.tokensUsed || null,
            botName: message.botName || "gpt-3.5", // Add botName from history
          });
        } else if (message.role === "user") {
          // Fallback for old format - find the corresponding model response
          let modelResponse = null;
          let tokensUsed = null;
          let j = i + 1;

          while (j < rawHistory.length && rawHistory[j].role !== "user") {
            if (rawHistory[j].role === "model") {
              modelResponse = rawHistory[j];
              // Extract tokens used from the response if available
              tokensUsed = modelResponse.tokensUsed || null;
              break;
            }
            j++;
          }

          if (modelResponse) {
            processedGroups.push({
              prompt: message.content,
              responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
              time: new Date(
                message.timestamp || message.create_time || Date.now()
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              currentSlide: 0,
              isTyping: false,
              isComplete: true,
              tokensUsed: tokensUsed,
              botName: message.botName || "gpt-3.5", // Add botName from history
            });
          } else {
            // Handle case where there's a user message but no response yet
            processedGroups.push({
              prompt: message.content,
              responses: ["No response available"],
              time: new Date(
                message.timestamp || message.create_time || Date.now()
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              currentSlide: 0,
              isTyping: false,
              isComplete: true,
              tokensUsed: null,
              botName: message.botName || "gpt-3.5", // Add botName from history
            });
          }
        }
      }

      setMessageGroups([processedGroups]);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessageGroups([[]]);
    } finally {
      setHistoryLoading(false);
      setTimeout(() => scrollToBottom(), 200);
    }
  };

  // const fetchChatbotResponse = async (text, currentSessionId) => {
  //     if (abortControllerRef.current) {
  //       abortControllerRef.current.abort();
  //     }

  //     const controller = new AbortController();
  //     abortControllerRef.current = controller;

  //     const payload = {
  //       email: user.email,
  //       create_time: new Date().toISOString(),
  //       prompt: text,
  //       sessionId: currentSessionId || "", // Send blank if no session ID
  //       maxWords: maxWords,
  //     };

  //     try {
  //       const response = await fetch("http://localhost:8080/api/ai/ask", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //         signal: controller.signal,
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       abortControllerRef.current = null;
  //       const data = await response.json();

  //       console.log("API Response:", data);
  //       console.log("Available token fields:", {
  //         tokensUsed: data.tokensUsed,
  //         usage: data.usage,
  //         remainingTokens: data.remainingTokens,
  //         total_tokens: data.usage?.total_tokens,
  //       });

  //       return {
  //         response: data.response.replace(/\n\n/g, "<br/>"),
  //         sessionId: data.sessionId, // This will be the new session ID from the server
  //         remainingTokens: data.remainingTokens,
  //         tokensUsed: data.tokensUsed || data.usage?.total_tokens || null,
  //         totalTokensUsed: data.totalTokensUsed || null, // ✅ include here
  //       };
  //     } catch (err) {
  //       if (err?.name === "AbortError") {
  //         console.log("Request was aborted");
  //         return null;
  //       }
  //       console.error(err);
  //       return {
  //         response: "Sorry, something went wrong.",
  //         sessionId: currentSessionId,
  //       };
  //     }
  //   };

  const fetchChatbotResponse = async (text, currentSessionId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 🔹 Get user email from localStorage (saved during login)
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;

    if (!email) {
      console.error("No user email found in localStorage");
      return {
        response: "User not logged in. Please login again.",
        sessionId: currentSessionId,
      };
    }

    const payload = {
      email, // 🔹 dynamic from login
      create_time: new Date().toISOString(),
      prompt: text,
      sessionId: currentSessionId || "",
      maxWords,
      botName: selectedBot, // Include the selected bot name in the request
    };

    try {
      const response = await fetch("http://localhost:8080/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      abortControllerRef.current = null;
      const data = await response.json();

      console.log("API Response:", data);

      return {
        response: data.response?.replace(/\n\n/g, "<br/>") || "",
        sessionId: data.sessionId,
        remainingTokens: data.remainingTokens,
        // tokensUsed: data.tokensUsed ?? null,
        tokensUsed: data.tokensUsed || data.usage?.total_tokens || null,
        totalTokensUsed: data.totalTokensUsed ?? null,
        botName: data.botName || selectedBot, // Return the bot name from the response
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }
      console.error("fetchChatbotResponse error:", err);
      return {
        response: "Sorry, something went wrong.",
        sessionId: currentSessionId,
        botName: selectedBot, // Return the selected bot name even on error
      };
    }
  };

  // const handleSend = async () => {
  //   if (!input.trim() || isSending) return;

  //   isStoppedRef.current = false;
  //   const prompt = input.trim();
  //   setInput("");
  //   setIsSending(true);
  //   setIsTypingResponse(true);

  //   let currentSessionId = selectedChatId
  //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
  //     : "";

  //   // Add new message group directly to state
  //   setMessageGroups((prev) => {
  //     const updated = [...prev];
  //     const chatGroups = updated[0] || [];
  //     chatGroups.push({
  //       prompt,
  //       responses: ["Thinking..."],
  //       time: currentTime(),
  //       currentSlide: 0,
  //       isTyping: true,
  //       isComplete: false,
  //       tokensUsed: null, // Initialize tokens as null
  //     });
  //     return updated;
  //   });

  //   try {
  //     const result = await fetchChatbotResponse(prompst, currentSessionId);
  //     if (isStoppedRef.current || !result) return;

  //     // if (result.remainingTokens !== undefined) {
  //     //   setRemainingTokens(result.remainingTokens);
  //     //   // const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //     //   // localStorage.setItem(storageKey, result.remainingTokens.toString());
  //     // }
  //     // Save tokens
  //     if (result.remainingTokens !== undefined) {
  //       const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //       localStorage.setItem(storageKey, result.remainingTokens.toString());
  //       setChats((prev) =>
  //         prev.map((chat) =>
  //           chat.sessionId === (currentSessionId || result.sessionId)
  //             ? { ...chat, remainingTokens: result.remainingTokens }
  //             : chat
  //         )
  //       );
  //     }

  //     if (
  //       result.tokensUsed !== undefined ||
  //       result.totalTokensUsed !== undefined
  //     ) {
  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const chatGroups = updated[0] || [];
  //         const idx = chatGroups.findIndex((g) => g.prompt === prompt);
  //         if (idx !== -1) {
  //           chatGroups[idx] = {
  //             ...chatGroups[idx],
  //             tokensUsed: result.tokensUsed,
  //             totalTokensUsed: result.totalTokensUsed,
  //           };
  //         }
  //         return updated;
  //       });
  //     }

  //     if (result) {
  //       if (result.totalTokensUsed !== undefined) {
  //         setTotalTokensUsed(result.totalTokensUsed);
  //       }
  //     }

  //     // Extract tokens used from response (assuming API returns tokensUsed)
  //     const tokensUsed =
  //       result.tokensUsed || result.usage?.total_tokens || null;

  //     // If this was a new chat with no session ID, update it with the one from the response
  //     if (!currentSessionId && result.sessionId) {
  //       // Update the selected chat's session ID in the chats array
  //       setChats((prev) => {
  //         return prev.map((chat) => {
  //           if (chat.id === selectedChatId) {
  //             return {
  //               ...chat,
  //               sessionId: result.sessionId,
  //             };
  //           }
  //           return chat;
  //         });
  //       });

  //       // Update the current session ID
  //       currentSessionId = result.sessionId;

  //       // Update localStorage with the new session ID
  //       localStorage.setItem("lastChatSessionId", selectedChatId);
  //     }

  //     // Update the response directly in state instead of calling history API
  //     const chars = result.response.split("");
  //     let currentText = "";

  //     for (let i = 0; i < chars.length; i++) {
  //       if (isStoppedRef.current) break;

  //       currentText += chars[i];

  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const chatGroups = updated[0] || [];
  //         const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
  //         if (groupIndex !== -1) {
  //           chatGroups[groupIndex] = {
  //             ...chatGroups[groupIndex],
  //             responses: [currentText],
  //             isTyping: !isStoppedRef.current,
  //             isComplete: !isStoppedRef.current,
  //             tokensUsed: tokensUsed, // Store tokens used
  //           };
  //         }
  //         return updated;
  //       });

  //       await new Promise((resolve) => setTimeout(resolve, 30));
  //     }

  //     // Update token count if available
  //     if (result.remainingTokens !== undefined) {
  //       const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //       localStorage.setItem(storageKey, result.remainingTokens.toString());
  //     }
  //   } catch (error) {
  //     console.error("Failed to send message:", error);
  //     setMessageGroups((prev) => {
  //       const updated = [...prev];
  //       const chatGroups = updated[0] || [];
  //       const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
  //       if (groupIndex !== -1) {
  //         chatGroups[groupIndex] = {
  //           ...chatGroups[groupIndex],
  //           isTyping: false,
  //           isComplete: false,
  //           responses: ["Sorry, something went wrong."],
  //           tokensUsed: null,
  //         };
  //       }
  //       return updated;
  //     });
  //   } finally {
  //     setIsSending(false);
  //     setIsTypingResponse(false);
  //     scrollToBottom();
  //   }
  // };
  // --------------------------------------------------------
  // const handleSend = async () => {
  //   if (!input.trim() || isSending) return;

  //   isStoppedRef.current = false;
  //   const prompt = input.trim();
  //   setInput("");
  //   setIsSending(true);
  //   setIsTypingResponse(true);

  //   let currentSessionId = selectedChatId
  //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
  //     : "";

  //   // Add new message in UI
  //   setMessageGroups((prev) => {
  //     const updated = [...prev];
  //     const chatGroups = updated[0] || [];
  //     chatGroups.push({
  //       prompt,
  //       responses: ["Thinking..."],
  //       time: currentTime(),
  //       currentSlide: 0,
  //       isTyping: true,
  //       isComplete: false,
  //       tokensUsed: null,
  //       totalTokensUsed: totalTokens, // initial
  //     });
  //     return updated;
  //   });

  //   try {
  //     // 🔹 Call API
  //     const result = await fetchChatbotResponse(prompt, currentSessionId);
  //     if (isStoppedRef.current || !result) return;

  //     // 🔹 Save Remaining Tokens in localStorage + state
  //     if (result.remainingTokens !== undefined) {
  //       const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //       localStorage.setItem(storageKey, result.remainingTokens.toString());

  //       setRemainingTokens(result.remainingTokens); // update profile dialog
  //       setChats((prev) =>
  //         prev.map((chat) =>
  //           chat.sessionId === (currentSessionId || result.sessionId)
  //             ? { ...chat, remainingTokens: result.remainingTokens }
  //             : chat
  //         )
  //       );
  //     }

  //     // 🔹 Update tokens in message group
  //     if (
  //       result.tokensUsed !== undefined ||
  //       result.totalTokensUsed !== undefined
  //     ) {
  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const chatGroups = updated[0] || [];
  //         const idx = chatGroups.findIndex((g) => g.prompt === prompt);
  //         if (idx !== -1) {
  //           chatGroups[idx] = {
  //             ...chatGroups[idx],
  //             tokensUsed: result.tokensUsed,
  //             totalTokensUsed: result.totalTokensUsed,
  //           };
  //         }
  //         return updated;
  //       });
  //     }

  //     if (result.totalTokensUsed !== undefined) {
  //       setTotalTokensUsed(result.totalTokensUsed);
  //     }

  //     // 🔹 If new chat (no sessionId yet), update session
  //     if (!currentSessionId && result.sessionId) {
  //       setChats((prev) =>
  //         prev.map((chat) =>
  //           chat.id === selectedChatId
  //             ? { ...chat, sessionId: result.sessionId }
  //             : chat
  //         )
  //       );
  //       currentSessionId = result.sessionId;
  //       localStorage.setItem("lastChatSessionId", selectedChatId);
  //     }

  //     // 🔹 Typing animation
  //     const chars = result.response.split("");
  //     let currentText = "";

  //     for (let i = 0; i < chars.length; i++) {
  //       if (isStoppedRef.current) break;

  //       currentText += chars[i];

  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const chatGroups = updated[0] || [];
  //         const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
  //         if (groupIndex !== -1) {
  //           chatGroups[groupIndex] = {
  //             ...chatGroups[groupIndex],
  //             responses: [currentText],
  //             isTyping: !isStoppedRef.current,
  //             isComplete: !isStoppedRef.current,
  //           };
  //         }
  //         return updated;
  //       });

  //       await new Promise((resolve) => setTimeout(resolve, 30));
  //     }
  //   } catch (error) {
  //     console.error("Failed to send message:", error);
  //     setMessageGroups((prev) => {
  //       const updated = [...prev];
  //       const chatGroups = updated[0] || [];
  //       const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
  //       if (groupIndex !== -1) {
  //         chatGroups[groupIndex] = {
  //           ...chatGroups[groupIndex],
  //           isTyping: false,
  //           isComplete: false,
  //           responses: ["Sorry, something went wrong."],
  //           tokensUsed: null,
  //         };
  //       }
  //       return updated;
  //     });
  //   } finally {
  //     setIsSending(false);
  //     setIsTypingResponse(false);
  //     scrollToBottom();
  //   }
  // };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    isStoppedRef.current = false;
    const prompt = input.trim();
    setInput("");
    setIsSending(true);
    setIsTypingResponse(true);

    let currentSessionId = selectedChatId
      ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
      : "";

    // Add new message in UI
    // setMessageGroups((prev) => {
    //   const updated = [...prev];
    //   const chatGroups = updated[0] || [];
    //   chatGroups.push({
    //     prompt,
    //     responses: ["Thinking..."],
    //     time: currentTime(),
    //     currentSlide: 0,
    //     isTyping: true,
    //     isComplete: false,
    //     tokensUsed: null,
    //   });
    //   return updated;
    // });

    setMessageGroups((prev) => {
      const updated = [...prev];
      const chatGroups = updated[0] || [];

      // Check if this prompt already exists to prevent duplicates
      const promptExists = chatGroups.some((g) => g.prompt === prompt);

      if (!promptExists) {
        chatGroups.push({
          prompt,
          responses: ["Thinking..."],
          time: currentTime(),
          currentSlide: 0,
          isTyping: true,
          isComplete: false,
          tokensUsed: null,
          botName: selectedBot, // Store the bot name at the time of sending
        });
      }

      return updated;
    });

    try {
      // Call API
      const result = await fetchChatbotResponse(prompt, currentSessionId);
      if (isStoppedRef.current || !result) return;

      // Update tokens from the response
      if (result.remainingTokens !== undefined) {
        setRemainingTokens(result.remainingTokens);

        // Save to localStorage for this session
        const storageKey = `tokens_${currentSessionId || result.sessionId}`;
        localStorage.setItem(storageKey, result.remainingTokens.toString());
      }

      if (result.totalTokensUsed !== undefined) {
        setTotalTokensUsed(result.totalTokensUsed);
      }

      // If new chat (no sessionId yet), update session
      if (!currentSessionId && result.sessionId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, sessionId: result.sessionId }
              : chat
          )
        );
        currentSessionId = result.sessionId;
        localStorage.setItem("lastChatSessionId", selectedChatId);
      }

      //   // Save token count for the   new session
      //   if (result.remainingTokens !== undefined) {
      //     localStorage.setItem(
      //       `tokens_${result.sessionId}`,
      //       result.remainingTokens.toString()
      //     );
      //   }
      // }

      // Typing animation
      const chars = result.response.split("");
      let currentText = "";

      for (let i = 0; i < chars.length; i++) {
        if (isStoppedRef.current) break;

        currentText += chars[i];

        setMessageGroups((prev) => {
          const updated = [...prev];
          const chatGroups = updated[0] || [];
          const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
          if (groupIndex !== -1) {
            chatGroups[groupIndex] = {
              ...chatGroups[groupIndex],
              responses: [currentText],
              isTyping: !isStoppedRef.current,
              isComplete: !isStoppedRef.current,
              tokensUsed: result.tokensUsed || null,
              botName: result.botName || selectedBot, // Update with the bot name from response
            };
          }
          return updated;
        });

        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageGroups((prev) => {
        const updated = [...prev];
        const chatGroups = updated[0] || [];
        const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
        if (groupIndex !== -1) {
          chatGroups[groupIndex] = {
            ...chatGroups[groupIndex],
            isTyping: false,
            isComplete: false,
            responses: ["Sorry, something went wrong."],
            tokensUsed: null,
          };
        }
        return updated;
      });
    } finally {
      setIsSending(false);
      setIsTypingResponse(false);
      scrollToBottom();

      // Refresh the session list to get updated token counts
      fetchChatSessions();
    }
  };

  const createNewChat = () => {
    const newSessionId = generateSessionId(); // Generate a proper session ID
    const newChat = {
      // id: `temp_${Date.now()}`, // temporary ID for UI
      id: newSessionId,
      name: `Chat ${chats.length + 1}`,
      // sessionId: "", // blank session ID
      sessionId: newSessionId,
      createTime: new Date().toISOString(),
    };

    setChats((prev) => [newChat, ...prev]);
    setSkipHistoryLoad(true); // prevent history load
    setSelectedChatId(newChat.id);
    localStorage.setItem("lastChatSessionId", newChat.id);
    setMessageGroups([[]]); // reset messages
  };

  function formatChatTime(date) {
    const now = new Date();
    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const timeStr = date.toLocaleTimeString("en-US", timeOptions);

    if (date.toDateString() === now.toDateString()) {
      return `Today  ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday  ${timeStr}`;
    }

    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays <= 7) {
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${dayName}, ${dateStr},  ${timeStr}`;
    }

    const fullDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `${fullDate},  ${timeStr}`;
  }

  const filteredChats = chats.filter((chat) =>
    chat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "98.2vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: isCollapsed ? 60 : 290,
          bgcolor: "#f5f5f5",
          height: "100vh",
          flexShrink: 0,
          transition: "width 0.3s ease",
          boxShadow: { xs: 3, md: 0 },
          display: "flex",
          flexDirection: "column",
          alignItems: isCollapsed ? "center" : "flex-start",
        }}
      >
        {isCollapsed ? (
          // Collapsed Mode: only icons
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
            {/* <MenuIcon
              style={{ cursor: "pointer" }}
              onClick={() => setIsCollapsed(false)}
            /> */}
            {/* <Avatar src={leaf} sx={{ ml: 1 }} /> */}

            <Avatar
              src={leaf}
              alt="leaf"
              sx={{
                border: "2px solid #4d4646ff", // lighter black (#aaa / #bbb / grey[500])
                bgcolor: "white",
                width: 25, // thodu mota rakho
                height: 25,
                p: "2px", // andar jagya
                cursor: "pointer",
                pl: "1px",
              }}
              onClick={() => setIsCollapsed(false)}
            />
            <AddIcon onClick={createNewChat} style={{ cursor: "pointer" }} />
            <SearchIcon style={{ cursor: "pointer" }} />
          </Box>
        ) : (
          <>
            {/* 🔹 Fixed Header Section */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                bgcolor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
                pb: 1,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  justifyContent: "space-between",
                  pt: 1,
                  px: 0,
                }}
              >
                {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> */}
                {/* <Avatar
                  src={Mainlogo}
                  alt="Main Logo"
                  variant="square"
                  sx={{
                    width: ["179px"],
                    height: 32,
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                /> */}
                <Box
                  component="img"
                  src={Mainlogo}
                  alt="Main Logo"
                  sx={{
                    width: ["144px"], // fix logo width
                    height: ["40px"], // fix height
                    objectFit: "contain", // keep aspect ratio, no blur
                    cursor: "pointer",
                    ml: 0,
                  }}
                />
                {/* </Box> */}
                <IconButton onClick={() => setIsCollapsed(true)}>
                  <FeaturedPlayListOutlinedIcon />
                </IconButton>
              </Box>

              {/* New Chat */}
              <Box
                sx={{ display: "flex", alignItems: "center", pt: 1, pl: 1 }}
                onClick={createNewChat}
              >
                <AddIcon />
                <Button
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    color: "black",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#f5f5f5", color: "black" },
                  }}
                >
                  New Chat
                </Button>
              </Box>

              {/* Search */}
              <Box
                sx={{
                  py: 2,
                  pb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  pl: 1,
                }}
              >
                <SearchIcon />
                <TextField
                  placeholder="Search chats..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                      backgroundColor: "#fff",
                      width: "248px",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* sidebar chat list */}
            <Box
              sx={{
                overflowY: "auto",
                height: "calc(100vh - 120px)",
                pr: 1,
                mt: 2,
                width: "100%",
              }}
            >
              {sessionLoading ? (
                <div>
                  {[...Array(7)].map((_, i) => (
                    <Box key={i}>
                      <Skeleton sx={{ width: "100%", p: 3 }} />
                    </Box>
                  ))}
                </div>
              ) : (
                <List>
                  {filteredChats
                    ?.filter((item) => item?.name)
                    .map((chat) => (
                      <ListItemButton
                        key={chat.id}
                        selected={chat.id === selectedChatId}
                        onClick={() => {
                          setSelectedChatId(chat.id);
                          localStorage.setItem("lastChatSessionId", chat.id);
                          loadChatHistory(chat.sessionId);
                        }}
                        className={`cursor-pointer transition-colors ${
                          chat.id === selectedChatId
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        sx={{
                          borderRadius: 1.5,
                          my: 0.8,
                          backgroundColor:
                            chat.id === selectedChatId ? "#e3f2fd" : "#fff",
                          border:
                            chat.id === selectedChatId
                              ? "1px solid #3067f6"
                              : "1px solid #80808052",
                          "&:hover": {
                            backgroundColor:
                              chat.id === selectedChatId
                                ? "#e3f2fd"
                                : "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={chat.name.replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                          secondary={formatChatTime(new Date(chat.createTime))}
                        />
                      </ListItemButton>
                    ))}
                </List>
              )}
            </Box>

            {/* <Box
              sx={{
                position: "sticky",
                zIndex: 2,
                bgcolor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                // flexDirection: "column",
                // alignItems: "center",
                p: 1,
                gap:1,
                // textAlign: "center",
                width: "100%",
                // height:"100%",
              }}
            >
              
                <Avatar
                  sx={{
                    bgcolor: "#1976d2",
                    width: 34,
                    height: 34,
                    fontSize: 20,
                  }}
                >
                  {(username || email || "U").charAt(0).toUpperCase()}
                </Avatar>

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mt: 1,  }}
                >
                  {username || email}
                </Typography>
              </Box> */}

            <Box
              sx={{
                position: "sticky",
                zIndex: 2,
                bgcolor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                p: 1,
                gap: 1,
                width: "94%",
                cursor: "pointer",
              }}
              onClick={handleToggleMenu} // toggle use
            >
              <Avatar
                sx={{
                  bgcolor: "#1976d2",
                  width: 30,
                  height: 30,
                  fontSize: 20,
                }}
              >
                {(username || email || "U").charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {username || email}
              </Typography>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorsEl}
                open={Boolean(anchorsEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                PaperProps={{
                  sx: {
                    width: 200, // અહીં તમે custom width આપી શકો
                    height: 90, // અહીં height
                    borderRadius: 2, // rounded corner (optional)
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    setOpenProfile(true); // Profile box open
                  }}
                >
                  Profile
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleCloseMenu(); // Menu બંધ કરો
                    localStorage.clear(); // બધું clear કરો
                    window.location.href = "/login"; // login page પર redirect
                  }}
                >
                  <LogoutTwoToneIcon
                    fontSize="small"
                    sx={{ mr: 1 }} // icon ni right side margin + red color
                  />
                  Logout
                </MenuItem>
              </Menu>
            </Box>

            {/* Logout Button */}
            {/* <Button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                variant="text"
                color="error"
                size="small"
                sx={{ mt: 1 }}
              >
                Logout
              </Button> */}
          </>
        )}
      </Box>

      {/* models */}
      <Box
        sx={{
          mt: 3,
          ml: 2,
          flexShrink: 0,
        }}
      >
        <FormControl fullWidth size="small">
          <Select
            labelId="bot-select-label"
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            sx={{
              bgcolor: "#fff",
              borderRadius: "5px",
              maxWidth: "175px",
              width: "175px",
            }}
          >
            <MenuItem value="gpt-3.5">OpenAI GPT-3.5</MenuItem>
            <MenuItem value="gpt-4">OpenAI GPT-4</MenuItem>
            <MenuItem value="assistant-x">Assistant X</MenuItem>
            <MenuItem value="custom-ai">Custom AI Bot</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* chatbot */}

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          width: "100%",
          maxWidth: "900px",
          mx: "auto",
          px: { xs: 6, sm: 8, md: 10, lg: 12 },
          height: "100vh",
        }}
      >
        {/* 👉 Header (Always Common) */}
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            height: "64px",
          }}
        >
          <Logo />
          <Box ml={1}>
            <Typography fontWeight="bold">Chatbot</Typography>
            <Typography variant="caption" color="text.secondary">
              Always online · Ready to help
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: "green",
              borderRadius: "50%",
              ml: "auto",
              mr: 1,
            }}
          />
          <Typography variant="caption">Online</Typography>
        </Box> */}

        {/* 👉 Main Content (Conditional) */}
        <Box
          sx={{
            height: "78vh",
            p: 2,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "auto",
          }}
        >
          {historyLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 8,
                height: "48.5vh",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading chat history...
                </Typography>
              </Box>
            </Box>
          ) : messageGroups[0]?.length === 0 ? (
            // Welcome Screen
            <Box sx={{ textAlign: "center", py: 12, color: "text.secondary" }}>
              <leafatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#3dafe2",
                  color: "#fff",
                }}
              >
                <Logo />
              </leafatar>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Welcome to the AI Chatbot!
              </Typography>
              <Typography variant="body2">
                Start a conversation by typing a message below.
              </Typography>
            </Box>
          ) : (
            // Chat Messages
            <Box sx={{ spaceY: 6, width: "100%" }}>
              {(messageGroups[0] || []).map((group, idx) => (
                <Box key={idx} mb={3}>
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    flexDirection={"column"}
                    alignItems={"flex-end"}
                    mb={1.5}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mr: 1,
                        // fontSize:"19px",
                      }}
                    >
                      <Typography variant="caption"   sx={{ fontSize: "14px" }}>You</Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: "#2F67F6",
                        color: "#fff",
                        borderRadius: 3,
                        maxWidth: { xs: "80%", md: "70%" },
                      }}
                    >
                      <Typography>{group.prompt}</Typography>
                      <Typography variant="caption">{group.time}</Typography>
                    </Paper>
                  </Box>

                  {/* AI Response */}
                  <Box>
                    {/* 🔹 Selected model name upar */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        // p: 1,
                        // borderBottom: "1px solid #e0e0e0",
                        mb: 0.5,
                        color: "text.primary",
                      }}
                    >
                      {/* ✅ Logo */}
                      {/* <Logo /> */}
                      <Avatar
                        src={leaf}
                        alt="leaf"
                        sx={{
                          border: "2px solid #4d4646ff", // lighter black (#aaa / #bbb / grey[500])
                          bgcolor: "white",
                          width: 23, // thodu mota rakho
                          height: 23,
                          p: "2px", // andar jagya
                          cursor: "pointer",
                          // pl: "1px",
                          mt:0.5,
                        }}
                        // onClick={() => setIsCollapsed(false)}
                      />

                      {/* ✅ Bot name + AI Assistant */}
                      <Box ml={1}>
                        <Typography
                          variant="caption"
                          sx={{ textDecoration: "underline", fontSize: "16px" }}
                        >
                          {group.botName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          AI Assistant
                        </Typography>
                      </Box>
                    </Box>

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: "#f1f6fc",
                        borderRadius: 3,
                        maxWidth: { xs: "80%", md: "70%" },
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        {group.isTyping &&
                        [
                          "Thinking...",
                          "Analyzing...",
                          "Generating...",
                        ].includes(group.responses[group.currentSlide]) ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body1">
                              {group.responses[group.currentSlide]}
                            </Typography>
                          </Box>
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: group.responses[group.currentSlide],
                            }}
                          />
                        )}
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-end"
                      >
                        {/* Time on left */}
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.6, mb: 0.5 }}
                        >
                          {group.time}
                        </Typography>

                        {/* Icon on right */}
                        <IconButton
                          size="small"
                          onClick={(e) => handleClick(e, idx)}
                        >
                          <KeyboardArrowDownTwoToneIcon fontSize="small" />
                        </IconButton>

                        {/* Popover for usage token */}
                        <Popover
                          open={Boolean(anchorEl) && activeGroup === idx}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          PaperProps={{
                            sx: {
                              p: 1,
                              borderRadius: 2,
                              boxShadow: 3,
                              minWidth: 140,
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Usage Tokens
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {group.tokensUsed !== null &&
                            group.tokensUsed !== undefined
                              ? group.tokensUsed
                              : "N/A"}
                          </Typography>
                          {/* <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {usageTokens !== undefined && usageTokens !== null
                              ? usageTokens
                              : "N/A"}
                          </Typography> */}
                        </Popover>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* 👉 Footer (Always Common) */}
        <Box
          sx={{
            height: "50px",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e0e0e0",
            // p: 1.5,
            bgcolor: "#fafafa",
            pb: 0.5,
          }}
        >
          {/* Main Input */}
          <TextField
            fullWidth
            placeholder="Ask me..."
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isSending || isTypingResponse}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "25px",
                backgroundColor: "#fff",
              },
              "& .Mui-disabled": {
                opacity: 0.5,
              },
            }}
            multiline
            maxRows={4}
          />

          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            {/* Round Dropdown */}
            <TextField
              select
              size="small"
              value={maxWords}
              onChange={(e) => setMaxWords(Number(e.target.value))}
              sx={{
                width: 80,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  backgroundColor: "#fff",
                  textAlign: "center",
                },
              }}
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                },
              }}
            >
              {[5, 10, 15, 20, 25, 50].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </TextField>

            <IconButton
              onClick={() => handleSend()}
              disabled={!input.trim() || isSending || isTypingResponse}
              sx={{
                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 👉 Tagline (Always Common) */}
        <Box textAlign="center" py={0.5}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "11px" }}
          >
            This AI Assistant can help with general information.
          </Typography>
        </Box>
      </Box>

      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          User Profile
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", p: 3 }}>
          {/* Avatar */}
          <Avatar
            sx={{
              bgcolor: "#1976d2",
              width: 80,
              height: 80,
              fontSize: 32,
              mx: "auto",
              mb: 2,
              mt: 1,
            }}
          >
            {(username || email || "U").charAt(0).toUpperCase()}
          </Avatar>

          {/* Username */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontWeight: "medium", fontSize: "17px" }}
            >
              Username:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {username || "Unknown User"}
            </Typography>
          </Box>

          {/* Email */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontWeight: "medium", fontSize: "17px" }}
            >
              Email:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {email || "No email"}
            </Typography>
          </Box>

          {/* Tokens Used */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontWeight: "medium", fontSize: "17px" }}
            >
              Total Tokens Used:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {totalTokensUsed}
            </Typography>
          </Box>

          {/* Remaining Tokens */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontWeight: "medium", fontSize: "17px" }}
            >
              Remaining Tokens:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {remainingTokens}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatUI;
