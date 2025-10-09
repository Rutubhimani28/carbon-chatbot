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
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  InsertDriveFile,
} from "@mui/icons-material";
import SearchUI from "./SearchUi";
import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";
import KeyboardArrowDownTwoToneIcon from "@mui/icons-material/KeyboardArrowDownTwoTone";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutTwoToneIcon from "@mui/icons-material/LogoutTwoTone";
import leaf from "././assets/leaf.png"; // path adjust karo according to folder
import Mainlogo from "././assets/Mainlogo.png"; // path adjust karo
import Msg_logo from "././assets/Msg_logo.png"; // path adjust karo
import chat4 from "././assets/chat4.png"; // path adjust karo
import search6 from "././assets/search6.png"; // path adjust karo
import Search_logo1 from "././assets/Search_logo1.png"; // path adjust karo
import Swal from "sweetalert2";
// import CloseIcon from "@mui/icons-material/Close";

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
  const [selectedBot, setSelectedBot] = useState("chatgpt-5-mini");
  const [openProfile, setOpenProfile] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [responseLength, setResponseLength] = useState("");
  // 🔹 नवी state add करो
  const [sessionRemainingTokens, setSessionRemainingTokens] = useState(0);
  const [chatRemainingTokens, setChatRemainingTokens] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeView, setActiveView] = useState("chat");
  const [customValue, setCustomValue] = useState("");
  const [historyList, setHistoryList] = useState([]); // store user search history

  // In your state initialization
  // const [messageGroups, setMessageGroups] = useState([]);

  // State for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

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

  // Add this function to remove individual files
  const removeFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) => {
      const newFiles = prevFiles.filter(
        (file, index) => index !== indexToRemove
      );
      return newFiles;
    });
  };

  // Add this function to clear all files
  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

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

  const fetchSearchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.email;
      if (!email) return;

      setHistoryLoading(true);

      const res = await fetch(`${apiBaseUrl}/Searchhistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.history) {
        // extract only queries
        setHistoryList(data.history.map((h) => h.query));
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    fetchSearchHistory();
  }, [apiBaseUrl, historyLoading]);

  console.log("historyList::::::::::", historyList);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const currentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fetchChatbotResponseWithFiles = async (formData, currentSessionId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/ask`, {
        method: "POST",
        body: formData, // No Content-Type header - browser will set it with boundary
        signal: controller.signal,
      });

      // Handle "Not enough tokens" error
      if (!response.ok) {
        const errorData = await response.json();

        if (
          response.status === 400 &&
          errorData.message === "Not enough tokens"
        ) {
          await Swal.fire({
            title: "Not enough tokens!",
            text: "You don't have enough tokens to continue.",
            icon: "warning",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Ok",
            denyButtonText: "Switch to Free Model",
            cancelButtonText: "Purchase Tokens",
          }).then((result) => {
            if (result.isConfirmed) {
              // just close
            } else if (result.isDenied) {
              setSelectedBot("chatgpt-5-mini");
            } else if (result.isDismissed) {
              // window.location.href = "/purchase";
            }
          });

          return {
            response: "Not enough tokens to process your request.",
            sessionId: currentSessionId,
            botName: selectedBot,
            isError: true,
          };
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      abortControllerRef.current = null;
      const data = await response.json();

      console.log("API Response with files:", data);

      return {
        response: data.response?.replace(/\n\n/g, "<br/>") || "",
        sessionId: data.sessionId,
        remainingTokens: data.remainingTokens,
        tokensUsed: data.tokensUsed || null,
        totalTokensUsed: data.totalTokensUsed ?? null,
        botName: data.botName || selectedBot,
        files: data.files || [], // Include file info from backend
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }

      console.error("fetchChatbotResponseWithFiles error:", err);

      if (err.message && err.message.includes("Not enough tokens")) {
        return {
          response: "Not enough tokens to process your request.",
          sessionId: currentSessionId,
          botName: selectedBot,
          isError: true,
        };
      }

      return {
        response: "Sorry, something went wrong.",
        sessionId: currentSessionId,
        botName: selectedBot,
      };
    }
  };

  // const fetchChatSessions = async () => {
  //   setSessionLoading(true);
  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user || !user.email) return;

  //     const response = await fetch(
  //       "https://carbon-chatbot.onrender.com/api/ai/get_user_sessions",
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

      const response = await fetch(`${apiBaseUrl}/api/ai/get_user_sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

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
        setSessionRemainingTokens(userRemainingTokens);
      }

      if (data.grandTotalTokens !== undefined) {
        userTotalTokensUsed = data.grandTotalTokens;
        setTotalTokensUsed(userTotalTokensUsed);
      }

      // Handle different response structures
      if (data && Array.isArray(data.sessions)) {
        // Structure 1: response: [{ user_sessions: [...] }]
        if (data && data?.session?.length > 0) {
          console.log("data.response_if:::::", data);
          console.log(
            "data?.sessions?.history?.length:::::",
            data?.sessions?.history?.length
          );
          // alert("hhhhhhhhh");

          sessions = data?.sessions?.reverse().map((session) => {
            console.log(
              "session?.history?.[0]?.totalTokensUsed",
              session?.history?.[0]?.totalTokensUsed
            );
            // Save token count to localStorage
            if (session?.history?.[0]?.totalTokensUsed !== undefined) {
              localStorage.setItem(
                `tokens_${session.sessionId}`,
                session?.history?.[0]?.totalTokensUsed?.toString()
              );
            }
            return {
              id: session.sessionId,
              // name:
              //   session.heading ||
              //   `Chat ${session.sessionId.slice(0, 8)}`,
              name: session.heading || `Chat ${session.sessionId.slice(0, 8)}`,
              sessionId: session.sessionId,
              createTime: session.create_time || new Date().toISOString(),
              totalTokensUsed: session.totalTokensUsed || 0,
            };
          });
        }
        // Structure 2: response: [{ session_id, session_heading, ... }]
        else {
          console.log(
            "data?.sessions?.history?.length > 0_else:::====",
            data?.sessions?.history?.length > 0
          );
          console.log("data.response_else:::::", data);
          sessions = data?.sessions?.reverse().map((session) => {
            if (session?.history?.[0]?.totalTokensUsed !== undefined) {
              localStorage.setItem(
                `tokens_${session.sessionId}`,
                session?.history?.[0]?.totalTokensUsed?.toString()
              );
            }
            return {
              id: session.sessionId,
              // name:
              //   session.heading ||
              //   session.name ||
              //   `Chat ${session.sessionId.slice(0, 8)}`,
              name: session.heading || `Chat ${session.sessionId.slice(0, 8)}`,
              sessionId: session.sessionId,
              createTime:
                session.create_time ||
                session.createTime ||
                new Date().toISOString(),
              totalTokensUsed: session?.history?.[0]?.totalTokensUsed || 0,
            };
          });
        }
      }

      setChats(sessions);
      console.log("response::::::::", initialLoad, sessions, !selectedChatId); // Debug log); // Debug log
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

  // const getChatHistory = async (sessionId) => {
  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user || !user.email) return [];

  //     const response = await fetch("https://carbon-chatbot.onrender.com/api/ai/history", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ sessionId, email: user.email }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     // Extract token information from the response
  //     if (data.remainingTokens !== undefined) {
  //       setChatRemainingTokens(data.remainingTokens);
  //     }

  //     // if (data.totalTokensUsed !== undefined) {
  //     //   setTotalTokensUsed(data.totalTokensUsed);
  //     // }

  //     return data.response || [];
  //   } catch (error) {
  //     console.error("API Error:", error);
  //     return [];
  //   } finally {
  //     setHistoryLoading(false);
  //   }
  // };
  const getChatHistory = async (sessionId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) return [];

      const response = await fetch(`${apiBaseUrl}/api/ai/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email: user.email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaa:", data); // Debug log

      // Extract token information from the response
      if (data.remainingTokens !== undefined) {
        setChatRemainingTokens(data.remainingTokens);
      }

      // Return the response array, ensuring it's always an array
      return Array.isArray(data.response)
        ? data.response
        : Array.isArray(data.messages)
        ? data.messages
        : Array.isArray(data)
        ? data
        : [];
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

  // useEffect(() => {
  //   if (!selectedChatId) return;

  //   const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  //   if (!selectedChat) return;
  //   if (skipHistoryLoad) {
  //     setSkipHistoryLoad(false);
  //     return;
  //   }

  //   // if (selectedChatId) {
  //   //   const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  //   //   if (selectedChat) {

  //   if (selectedChat.sessionId) {
  //     loadChatHistory(selectedChat.sessionId);

  //     // Load the latest token count for this session
  //     const savedTokens = localStorage.getItem(
  //       `tokens_${selectedChat.sessionId}`
  //     );
  //     if (savedTokens) {
  //       setRemainingTokens(Number(savedTokens)); // ✅ add this line
  //       console.log("Current tokens:", savedTokens);
  //     }
  //   } else {
  //     setMessageGroups([[]]);
  //   }
  // }, [selectedChatId, skipHistoryLoad]);

  // const loadChatHistory = async (sessionId) => {
  //   if (!sessionId) {
  //     setMessageGroups([[]]);
  //     return;
  //   }

  //   setHistoryLoading(true);

  //   try {
  //     // Fetch from API
  //     const rawHistory = await getChatHistory(sessionId);

  //     // Load token count from localStorage
  //     // const savedTokens = localStorage.getItem(`tokens_${sessionId}`);
  //     // const tokenCount = savedTokens ? parseInt(savedTokens) : null;

  //     // Process the history into message groups
  //     const processedGroups = [];

  //     for (let i = 0; i < rawHistory.length; i++) {
  //       const message = rawHistory[i];

  //       // if (message.role === "user") {
  //       //   // Find the corresponding model response
  //       //   let modelResponse = null;
  //       //   let tokensUsed = null;
  //       //   let j = i + 1;

  //       //   while (j < rawHistory.length && rawHistory[j].role !== "user") {
  //       //     if (rawHistory[j].role === "model") {
  //       //       modelResponse = rawHistory[j];
  //       //       // Extract tokens used from the response if available
  //       //       tokensUsed = modelResponse.tokensUsed || null;
  //       //       break;
  //       //     }
  //       //     j++;
  //       //   }

  //       //   if (modelResponse) {
  //       //     processedGroups.push({
  //       //       prompt: message.content,
  //       //       responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
  //       //       time: new Date(
  //       //         message.timestamp || message.create_time || Date.now()
  //       //       ).toLocaleTimeString([], {
  //       //         hour: "2-digit",
  //       //         minute: "2-digit",
  //       //       }),
  //       //       currentSlide: 0,
  //       //       isTyping: false,
  //       //       isComplete: true,
  //       //       // tokensUsed: message.tokensUsed || null, // Add this line
  //       //       tokensUsed: tokensUsed, // Store tokens used
  //       //     });
  //       //   } else {
  //       //     // Handle case where there's a user message but no response yet
  //       //     processedGroups.push({
  //       //       prompt: message.content,
  //       //       responses: ["No response available"],
  //       //       time: new Date(
  //       //         message.timestamp || message.create_time || Date.now()
  //       //       ).toLocaleTimeString([], {
  //       //         hour: "2-digit",
  //       //         minute: "2-digit",
  //       //       }),
  //       //       currentSlide: 0,
  //       //       isTyping: false,
  //       //       isComplete: true,
  //       //       tokensUsed: null,
  //       //     });
  //       //   }
  //       // }

  //       // The backend now returns objects with prompt, response, tokensUsed, etc.
  //       if (message.prompt) {
  //         // This is a user message with a prompt field
  //         processedGroups.push({
  //           prompt: message.prompt,
  //           responses: [
  //             message.response
  //               ? message.response.replace(/\n\n/g, "<br/>")
  //               : "No response available",
  //           ],
  //           time: new Date(
  //             message.create_time || Date.now()
  //           ).toLocaleTimeString([], {
  //             hour: "2-digit",
  //             minute: "2-digit",
  //           }),
  //           currentSlide: 0,
  //           isTyping: false,
  //           isComplete: true,
  //           tokensUsed: message.tokensUsed || null,
  //           botName: message.botName || "chatgpt-5-mini", // Add botName from history
  //           files: message.files || [], // Include files from history
  //         });
  //       } else if (message.role === "user") {
  //         // Fallback for old format - find the corresponding model response
  //         let modelResponse = null;
  //         let tokensUsed = null;
  //         let j = i + 1;

  //         while (j < rawHistory.length && rawHistory[j].role !== "user") {
  //           if (rawHistory[j].role === "model") {
  //             modelResponse = rawHistory[j];
  //             // Extract tokens used from the response if available
  //             tokensUsed = modelResponse.tokensUsed || null;
  //             break;
  //           }
  //           j++;
  //         }

  //         if (modelResponse) {
  //           processedGroups.push({
  //             prompt: message.content,
  //             responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
  //             time: new Date(
  //               message.timestamp || message.create_time || Date.now()
  //             ).toLocaleTimeString([], {
  //               hour: "2-digit",
  //               minute: "2-digit",
  //             }),
  //             currentSlide: 0,
  //             isTyping: false,
  //             isComplete: true,
  //             tokensUsed: tokensUsed,
  //             botName: message.botName || "chatgpt-5-mini", // Add botName from history
  //             files: message.files || [], // Include files from history
  //           });
  //         } else {
  //           // Handle case where there's a user message but no response yet
  //           processedGroups.push({
  //             prompt: message.content,
  //             responses: ["No response available"],
  //             time: new Date(
  //               message.timestamp || message.create_time || Date.now()
  //             ).toLocaleTimeString([], {
  //               hour: "2-digit",
  //               minute: "2-digit",
  //             }),
  //             currentSlide: 0,
  //             isTyping: false,
  //             isComplete: true,
  //             tokensUsed: null,
  //             botName: message.botName || "chatgpt-5-mini", // Add botName from history
  //             files: message.files || [], // Include files from history
  //           });
  //         }
  //       }
  //     }

  //     setMessageGroups([processedGroups]);
  //   } catch (error) {
  //     console.error("Error loading chat history:", error);
  //     setMessageGroups([[]]);
  //   } finally {
  //     setHistoryLoading(false);
  //     setTimeout(() => scrollToBottom(), 200);
  //   }
  // };

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
  //       const response = await fetch("https://carbon-chatbot.onrender.com/api/ai/ask", {
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

  // const fetchChatbotResponse = async (text, currentSessionId) => {
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //   }

  //   const controller = new AbortController();
  //   abortControllerRef.current = controller;

  //   // 🔹 Get user email from localStorage (saved during login)
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   const email = user?.email;

  //   if (!email) {
  //     console.error("No user email found in localStorage");
  //     return {
  //       response: "User not logged in. Please login again.",
  //       sessionId: currentSessionId,
  //     };
  //   }

  //   const payload = {
  //     email, //  dynamic from login
  //     create_time: new Date().toISOString(),
  //     prompt: text,
  //     sessionId: currentSessionId || "",
  //     responseLength,
  //     botName: selectedBot, // Include the selected bot name in the request
  //   };

  //   try {
  //     const response = await fetch("https://carbon-chatbot.onrender.com/api/ai/ask", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //       signal: controller.signal,
  //     });

  //     // if (!response.ok) {
  //     //   throw new Error(`HTTP error! status: ${response.status}`);
  //     // }

  //     if (!response.ok) {
  //       const errorData = await response.json();

  //       //  Show SweetAlert if tokens not enough
  //       if (
  //         response.status === 400 &&
  //         errorData.message === "Not enough tokens"
  //       ) {
  //         await Swal.fire({
  //           title: "Not enough tokens!",
  //           text: "You don’t have enough tokens to continue.",
  //           icon: "warning",
  //           showCancelButton: true,
  //           showDenyButton: true,
  //           confirmButtonText: "Ok",
  //           denyButtonText: "Switch to Free Model",
  //           cancelButtonText: "Purchase Tokens",
  //         }).then((result) => {
  //           if (result.isConfirmed) {
  //             // just close
  //           } else if (result.isDenied) {
  //             // switch to free model
  //             setSelectedBot("chatgpt-5-mini");
  //           } else if (result.isDismissed) {
  //             // purchase tokens → redirect
  //             window.location.href = "/purchase";
  //           }
  //         });
  //       }

  //       throw new Error(
  //         errorData.message || `HTTP error! status: ${response.status}`
  //       );
  //     }

  //     abortControllerRef.current = null;
  //     const data = await response.json();

  //     console.log("API Response:", data);

  //     return {
  //       response: data.response?.replace(/\n\n/g, "<br/>") || "",
  //       sessionId: data.sessionId,
  //       remainingTokens: data.remainingTokens,
  //       // tokensUsed: data.tokensUsed ?? null,
  //       tokensUsed: data.tokensUsed || data.usage?.total_tokens || null,
  //       totalTokensUsed: data.totalTokensUsed ?? null,
  //       botName: data.botName || selectedBot, // Return the bot name from the response
  //     };
  //   } catch (err) {
  //     if (err?.name === "AbortError") {
  //       console.log("Request was aborted");
  //       return null;
  //     }
  //     console.error("fetchChatbotResponse error:", err);
  //     return {
  //       response: "Sorry, something went wrong.",
  //       sessionId: currentSessionId,
  //       botName: selectedBot, // Return the selected bot name even on error
  //     };
  //   }
  // };
  useEffect(() => {
    if (!selectedChatId) return;

    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    if (!selectedChat) return;
    if (skipHistoryLoad) {
      setSkipHistoryLoad(false);
      return;
    }

    console.log("Loading chat history for session:", selectedChat.sessionId); // Debug log

    if (selectedChat.sessionId) {
      loadChatHistory(selectedChat.sessionId);

      // Load the latest token count for this session
      const savedTokens = localStorage.getItem(
        `tokens_${selectedChat.sessionId}`
      );
      if (savedTokens) {
        setRemainingTokens(Number(savedTokens));
        console.log("Current tokens:", savedTokens);
      }
    } else {
      setMessageGroups([[]]);
    }
  }, [selectedChatId, skipHistoryLoad]);

  const loadChatHistory = async (sessionId) => {
    console.log("Fetching history for sessionId:::::::::::::", loadChatHistory); // Debug log
    if (!sessionId) {
      setMessageGroups([[]]);
      return;
    }

    setHistoryLoading(true);

    try {
      // Fetch from API
      const rawHistory = await getChatHistory(sessionId);

      // Process the history into message groups
      const processedGroups = [];

      for (let i = 0; i < rawHistory.length; i++) {
        const message = rawHistory[i];

        // Handle both new format (with prompt field) and old format
        if (message.prompt) {
          // New format - user message with prompt
          processedGroups.push({
            id: message.id || `msg_${i}`,
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
            // botName: message.botName || "chatgpt-5-mini",
            botName: message.botName || selectedBot,
            files: message.files || [],
          });
        } else if (message.role === "user") {
          // Old format - user message
          let modelResponse = null;
          let tokensUsed = null;
          let botName = "chatgpt-5-mini";
          let j = i + 1;

          // Look for the corresponding model response
          while (j < rawHistory.length && rawHistory[j].role !== "user") {
            if (rawHistory[j].role === "model") {
              modelResponse = rawHistory[j];
              tokensUsed = modelResponse.tokensUsed || null;
              botName = modelResponse.botName || "chatgpt-5-mini";
              break;
            }
            j++;
          }

          processedGroups.push({
            id: message.id || `msg_${i}`,
            prompt: message.content,
            responses: [
              modelResponse
                ? modelResponse.content.replace(/\n\n/g, "<br/>")
                : "No response available",
            ],
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
            botName: botName,
            files: message.files || [],
          });
        } else if (message.role === "model" && i === 0) {
          // Handle case where first message is from model (no preceding user message)
          processedGroups.push({
            id: `msg_${i}`,
            prompt: "System initiated conversation",
            responses: [message.content.replace(/\n\n/g, "<br/>")],
            time: new Date(
              message.timestamp || message.create_time || Date.now()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            currentSlide: 0,
            isTyping: false,
            isComplete: true,
            tokensUsed: message.tokensUsed || null,
            botName: message.botName || selectedBot,
            files: message.files || [],
          });
        }
      }

      // If no messages were processed but we have raw history, create fallback messages
      if (processedGroups.length === 0 && rawHistory.length > 0) {
        rawHistory.forEach((message, index) => {
          if (message.content) {
            processedGroups.push({
              id: `msg_${index}`,
              prompt:
                message.role === "user" ? message.content : "System message",
              responses: [
                message.role === "model"
                  ? message.content.replace(/\n\n/g, "<br/>")
                  : "Waiting for response...",
              ],
              time: new Date(
                message.timestamp || message.create_time || Date.now()
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              currentSlide: 0,
              isTyping: false,
              isComplete: true,
              tokensUsed: message.tokensUsed || null,
              botName: message.botName || selectedBot,
              files: message.files || [],
            });
          }
        });
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

  const fetchChatbotResponse = async (text, currentSessionId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      email,
      create_time: new Date().toISOString(),
      prompt: text,
      sessionId: currentSessionId || "",
      responseLength,
      botName: selectedBot,
    };

    try {
      // const response = await fetch(`${apiBaseUrl}/api/ai/ask`, {
      const response = await fetch(`${apiBaseUrl}/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // 🔹 Check for "Not enough tokens" error specifically
      if (!response.ok) {
        const errorData = await response.json();

        // If it's a "Not enough tokens" error, return it directly
        if (
          response.status === 400 &&
          errorData.message === "Not enough tokens"
        ) {
          // Show SweetAlert but also return the error message for display
          await Swal.fire({
            title: "Not enough tokens!",
            text: "You don't have enough tokens to continue.",
            icon: "warning",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Ok",
            denyButtonText: "Switch to Free Model",
            cancelButtonText: "Purchase Tokens",
          }).then((result) => {
            if (result.isConfirmed) {
              // just close
            } else if (result.isDenied) {
              setSelectedBot("chatgpt-5-mini");
            } else if (result.isDismissed) {
              window.location.href = "/purchase";
            }
          });

          // 🔹 Return the actual error message instead of generic error
          return {
            response: "Not enough tokens to process your request.",
            sessionId: currentSessionId,
            botName: selectedBot,
            isError: true, // Add flag to identify this as an error response
          };
        }

        // For other errors, throw normally
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      abortControllerRef.current = null;
      const data = await response.json();

      console.log("API Response:", data);

      return {
        response: data.response?.replace(/\n\n/g, "<br/>") || "",
        sessionId: data.sessionId,
        remainingTokens: data.remainingTokens,
        tokensUsed: data.tokensUsed || data.usage?.total_tokens || null,
        totalTokensUsed: data.totalTokensUsed ?? null,
        botName: data.botName || selectedBot,
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }

      console.error("fetchChatbotResponse error:", err);

      // 🔹 Check if it's a "Not enough tokens" error from the error message
      if (err.message && err.message.includes("Not enough tokens")) {
        return {
          response: "Not enough tokens to process your request.",
          sessionId: currentSessionId,
          botName: selectedBot,
          isError: true,
        };
      }

      return {
        response: "Sorry, something went wrong.",
        sessionId: currentSessionId,
        botName: selectedBot,
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

  //   // ✅ Unique message ID
  //   const messageId =
  //     Date.now() + "_" + Math.random().toString(36).substr(2, 5);

  //   let currentSessionId = selectedChatId
  //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
  //     : "";

  //   // ✅ PUSH message immutably (prevent duplicates)
  //   setMessageGroups((prev) => {
  //     const messages = prev[0] || [];

  //     // Optional: check for duplicate by id (safety)
  //     const alreadyExists = messages.some((msg) => msg.id === messageId);
  //     if (alreadyExists) return prev;

  //     const newMessage = {
  //       id: messageId,
  //       prompt,
  //       responses: ["Thinking..."],
  //       time: currentTime(),
  //       currentSlide: 0,
  //       isTyping: true,
  //       isComplete: false,
  //       tokensUsed: null,
  //       botName: selectedBot,
  //     };

  //     return [[...messages, newMessage]];
  //   });

  //   try {
  //     // 🔹 API call
  //     const result = await fetchChatbotResponse(prompt, currentSessionId);
  //     if (isStoppedRef.current || !result) return;

  //     // 🔸 Save tokens
  //     if (result.remainingTokens !== undefined) {
  //       setChatRemainingTokens(result.remainingTokens);
  //       const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //       localStorage.setItem(storageKey, result.remainingTokens.toString());
  //     }
  //     if (result.totalTokensUsed !== undefined) {
  //       setTotalTokensUsed(result.totalTokensUsed);
  //     }

  //     // 🔹 Update session ID if new
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

  //     // ✅ Typing effect
  //     const chars = result.response.split("");
  //     let currentText = "";

  //     for (let i = 0; i < chars.length; i += 5) {
  //       if (isStoppedRef.current) break;
  //       currentText += chars.slice(i, i + 5).join("");

  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const messages = updated[0] || [];

  //         const groupIndex = messages.findIndex((g) => g.id === messageId);
  //         if (groupIndex !== -1) {
  //           const updatedMessage = {
  //             ...messages[groupIndex],
  //             responses: [currentText],
  //             isTyping: !isStoppedRef.current,
  //             isComplete: !isStoppedRef.current,
  //             tokensUsed: result.tokensUsed || null,
  //             botName: result.botName || selectedBot,
  //           };

  //           const newMessages = [...messages];
  //           newMessages[groupIndex] = updatedMessage;

  //           return [newMessages];
  //         }
  //         return updated;
  //       });

  //       await new Promise((resolve) => setTimeout(resolve, 15));
  //     }
  //   } catch (error) {
  //     console.error("Failed to send message:", error);

  //     setMessageGroups((prev) => {
  //       const updated = [...prev];
  //       const messages = updated[0] || [];

  //       const groupIndex = messages.findIndex((g) => g.id === messageId);
  //       if (groupIndex !== -1) {
  //         const errorMessage = {
  //           ...messages[groupIndex],
  //           isTyping: false,
  //           isComplete: false,
  //           responses: ["Sorry, something went wrong."],
  //           tokensUsed: null,
  //         };

  //         const newMessages = [...messages];
  //         newMessages[groupIndex] = errorMessage;

  //         return [newMessages];
  //       }
  //       return updated;
  //     });
  //   } finally {
  //     setIsSending(false);
  //     setIsTypingResponse(false);
  //     scrollToBottom();
  //     setResponseLength("Response Length:");
  //     fetchChatSessions();
  //   }
  // };

  // const handleSend = async () => {
  //   if (!input.trim() || isSending) return;

  //   // 🔹 Prepare files data if any files are selected
  //   if (selectedFiles.length > 0) {
  //     console.log("Sending files:", selectedFiles);
  //     // અહીં તમે files ને server પર upload કરવાનો logic ઉમેરી શકો
  //     // Example: FormData બનાવીને files ઉમેરો
  //     const formData = new FormData();
  //     formData.append("prompt", input.trim());
  //     formData.append("email", user.email);
  //     formData.append("botName", selectedBot);
  //     formData.append("responseLength", responseLength);

  //     selectedFiles.forEach((file, index) => {
  //       formData.append(`files`, file);
  //     });

  //     // અહીં તમારો file upload API call ઉમેરો
  //   }

  //   isStoppedRef.current = false;
  //   const prompt = input.trim();
  //   setInput("");
  //   setIsSending(true);
  //   setIsTypingResponse(true);

  //   const messageId =
  //     Date.now() + "_" + Math.random().toString(36).substr(2, 5);

  //   let currentSessionId = selectedChatId
  //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
  //     : "";

  //   setMessageGroups((prev) => {
  //     const messages = prev[0] || [];
  //     const alreadyExists = messages.some((msg) => msg.id === messageId);
  //     if (alreadyExists) return prev;

  //     const newMessage = {
  //       id: messageId,
  //       prompt,
  //       responses: ["Thinking..."],
  //       time: currentTime(),
  //       currentSlide: 0,
  //       isTyping: true,
  //       isComplete: false,
  //       tokensUsed: null,
  //       botName: selectedBot,
  //     };

  //     return [[...messages, newMessage]];
  //   });

  //   try {
  //     const result = await fetchChatbotResponse(prompt, currentSessionId);
  //     if (isStoppedRef.current || !result) return;

  //     // 🔹 Check if this is an error response (like "Not enough tokens")
  //     if (result.isError) {
  //       // Directly show the error message without typing effect
  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const messages = updated[0] || [];

  //         const groupIndex = messages.findIndex((g) => g.id === messageId);
  //         if (groupIndex !== -1) {
  //           const errorMessage = {
  //             ...messages[groupIndex],
  //             isTyping: false,
  //             isComplete: true,
  //             responses: [result.response], // Use the actual error message
  //             tokensUsed: null,
  //           };

  //           const newMessages = [...messages];
  //           newMessages[groupIndex] = errorMessage;

  //           return [newMessages];
  //         }
  //         return updated;
  //       });
  //       return; // Exit early for error responses
  //     }

  //     // 🔹 Normal successful response processing continues below...
  //     if (result.remainingTokens !== undefined) {
  //       setChatRemainingTokens(result.remainingTokens);
  //       const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //       localStorage.setItem(storageKey, result.remainingTokens.toString());
  //     }
  //     if (result.totalTokensUsed !== undefined) {
  //       setTotalTokensUsed(result.totalTokensUsed);
  //     }

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

  //     const chars = result.response.split("");
  //     let currentText = "";

  //     for (let i = 0; i < chars.length; i += 5) {
  //       if (isStoppedRef.current) break;
  //       currentText += chars.slice(i, i + 5).join("");

  //       setMessageGroups((prev) => {
  //         const updated = [...prev];
  //         const messages = updated[0] || [];

  //         const groupIndex = messages.findIndex((g) => g.id === messageId);
  //         if (groupIndex !== -1) {
  //           const updatedMessage = {
  //             ...messages[groupIndex],
  //             responses: [currentText],
  //             isTyping: !isStoppedRef.current,
  //             isComplete: !isStoppedRef.current,
  //             tokensUsed: result.tokensUsed || null,
  //             botName: result.botName || selectedBot,
  //           };

  //           const newMessages = [...messages];
  //           newMessages[groupIndex] = updatedMessage;

  //           return [newMessages];
  //         }
  //         return updated;
  //       });

  //       await new Promise((resolve) => setTimeout(resolve, 15));
  //     }
  //   } catch (error) {
  //     console.error("Failed to send message:", error);

  //     setMessageGroups((prev) => {
  //       const updated = [...prev];
  //       const messages = updated[0] || [];

  //       const groupIndex = messages.findIndex((g) => g.id === messageId);
  //       if (groupIndex !== -1) {
  //         const errorMessage = {
  //           ...messages[groupIndex],
  //           isTyping: false,
  //           isComplete: false,
  //           responses: ["Sorry, something went wrong."],
  //           tokensUsed: null,
  //         };

  //         const newMessages = [...messages];
  //         newMessages[groupIndex] = errorMessage;

  //         return [newMessages];
  //       }
  //       return updated;
  //     });
  //   } finally {
  //     setIsSending(false);
  //     setIsTypingResponse(false);
  //     scrollToBottom();
  //     setResponseLength("Response Length:");
  //     fetchChatSessions();
  //   }
  // };

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isSending) return;

    isStoppedRef.current = false;
    const prompt = input.trim();
    setInput("");
    setSelectedFiles([]);
    setIsSending(true);
    setIsTypingResponse(true);

    const messageId =
      Date.now() + "_" + Math.random().toString(36).substr(2, 5);

    let currentSessionId = selectedChatId
      ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
      : "";

    // Add message to UI
    setMessageGroups((prev) => {
      const messages = prev[0] || [];
      const alreadyExists = messages.some((msg) => msg.id === messageId);
      if (alreadyExists) return prev;

      const newMessage = {
        id: messageId,
        prompt:
          prompt || `Files: ${selectedFiles.map((f) => f.name).join(", ")}`,
        responses: ["Thinking..."],
        time: currentTime(),
        currentSlide: 0,
        isTyping: true,
        isComplete: false,
        tokensUsed: null,
        botName: selectedBot,
        files: selectedFiles.map((f) => ({ name: f.name })), // Store file info for display
      };

      return [[...messages, newMessage]];
    });

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add text data
      formData.append("prompt", prompt);
      formData.append("email", user.email);
      formData.append("botName", selectedBot);
      formData.append("responseLength", responseLength);
      formData.append("sessionId", currentSessionId);

      // Add files
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Call the API with FormData
      const result = await fetchChatbotResponseWithFiles(
        formData,
        currentSessionId
      );

      if (isStoppedRef.current || !result) return;

      // Handle token updates and response (same as before)
      if (result.remainingTokens !== undefined) {
        setChatRemainingTokens(result.remainingTokens);
        const storageKey = `tokens_${currentSessionId || result.sessionId}`;
        localStorage.setItem(storageKey, result.remainingTokens.toString());
      }
      if (result.totalTokensUsed !== undefined) {
        setTotalTokensUsed(result.totalTokensUsed);
      }

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

      // Clear files after successful send
      // setSelectedFiles([]);

      // Typing effect for response
      if (!result.isError) {
        const chars = result.response.split("");
        let currentText = "";

        for (let i = 0; i < chars.length; i += 5) {
          if (isStoppedRef.current) break;
          currentText += chars.slice(i, i + 5).join("");

          setMessageGroups((prev) => {
            const updated = [...prev];
            const messages = updated[0] || [];

            const groupIndex = messages.findIndex((g) => g.id === messageId);
            if (groupIndex !== -1) {
              const updatedMessage = {
                ...messages[groupIndex],
                responses: [currentText],
                isTyping: !isStoppedRef.current,
                isComplete: !isStoppedRef.current,
                tokensUsed: result.tokensUsed || null,
                botName: result.botName || selectedBot,
              };

              const newMessages = [...messages];
              newMessages[groupIndex] = updatedMessage;

              return [newMessages];
            }
            return updated;
          });

          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageGroups((prev) => {
        const updated = [...prev];
        const messages = updated[0] || [];

        const groupIndex = messages.findIndex((g) => g.id === messageId);
        if (groupIndex !== -1) {
          const errorMessage = {
            ...messages[groupIndex],
            isTyping: false,
            isComplete: false,
            responses: ["Sorry, something went wrong."],
            tokensUsed: null,
          };

          const newMessages = [...messages];
          newMessages[groupIndex] = errorMessage;

          return [newMessages];
        }
        return updated;
      });
    } finally {
      setIsSending(false);
      setIsTypingResponse(false);
      scrollToBottom();
      setResponseLength(" ");
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
        width: "100vw", // 🔹 Add this line
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          // width: isCollapsed ? 60 : 290,
          width: { xs: "0px", sm: isCollapsed ? 60 : 290 }, // mobile → hide, tablet/desktop → normal
          display: { xs: "none", sm: "flex" }, // xs પર sidebar hide
          bgcolor: "#f5f5f5",
          height: "100vh",
          flexShrink: 0,
          transition: "width 0.3s ease",
          boxShadow: { xs: 3, md: 0 },
          // display: "flex",
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
                  gap: 0,
                  alignItems: "center",
                  justifyContent: "space-between",
                  pt: ["2px"],
                  px: 0,
                }}
              >
                {/* <Box
                  component="img"
                  src={Msg_logo}
                  alt="Msg_logo"
                  sx={{
                    width: ["126px"], // fix logo width
                    height: ["62px"], // fix height
                    objectFit: "contain", // keep aspect ratio, no blur
                    cursor: "pointer",
                    ml: 0,
                    mr: -["25px"],
                  }}
                /> */}

                <Box
                  component="img"
                  src={Msg_logo}
                  alt="Msg_logo"
                  sx={{
                    width: ["137px"], // fix logo width
                    height: ["63px"], // fix height
                    objectFit: "contain", // keep aspect ratio, no blur
                    cursor: "pointer",
                    ml: 0,
                    // mr: -["25px"],
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    mr: 4,
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      // mr: 4,
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                      pr: 0,
                      cursor: "pointer",
                      position: "relative", // needed for underline positioning
                      pb: "0px", // space for underline
                    }}
                    onClick={() => setActiveView("chat")}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontSize: "16px",
                        fontWeight: activeView === "chat" ? 600 : 400,
                        color: activeView === "chat" ? "#2F67F6" : "inherit",
                        transition: "color 0.3s ease",
                      }}
                    >
                      Chat
                    </Typography>

                    <Box
                      component="img"
                      src={chat4}
                      alt="chat4"
                      sx={{
                        width: ["39px"], // fix logo width
                        height: ["42px"], // fix height
                        objectFit: "contain", // keep aspect ratio, no blur
                        cursor: "pointer",
                        // ml: 0,
                        // ml: -["10px"],
                        // mt: ["10px"],
                      }}
                      onClick={() => setActiveView("chat")}
                    />

                    {/* 🔹 Underline (visible only when active) */}
                    {activeView === "chat" && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "3px",
                          backgroundColor: "#2F67F6",
                          borderRadius: "2px",
                          transition: "all 0.3s ease",
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      // mr: 4,
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      position: "relative",
                      pb: "4px",
                      // mt:0,
                    }}
                    onClick={() => setActiveView("search")}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontSize: "16px",
                        fontWeight: activeView === "search" ? 600 : 400,
                        color: activeView === "search" ? "#2F67F6" : "inherit",
                        transition: "color 0.3s ease",
                      }}
                    >
                      Search
                    </Typography>

                    <Box
                      component="img"
                      src={search6}
                      alt="search6"
                      sx={{
                        width: ["39px"], // fix logo width
                        height: ["42px"], // fix height
                        objectFit: "contain", // keep aspect ratio, no blur
                        cursor: "pointer",
                        // ml: 0,
                        // ml: -["10px"],
                        // mt: ["10px"],
                      }}
                      onClick={() => setActiveView("search")}
                    />

                    {/* 🔹 Underline (visible only when active) */}
                    {activeView === "search" && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "3px",
                          backgroundColor: "#2F67F6",
                          borderRadius: "2px",
                          transition: "all 0.3s ease",
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* </Box> */}
                {/* <IconButton onClick={() => setIsCollapsed(true)}
                >
                  <FeaturedPlayListOutlinedIcon />
                </IconButton> */}
              </Box>

              {/* New Chat */}
              <Box
                sx={{ display: "flex", alignItems: "center", pt: 0, pl: 1 }}
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
              ) : activeView === "chat" ? (
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
              ) : (
                <Typography
                  variant="body2"
                  sx={{ p: 2, textAlign: "center", color: "gray" }}
                ></Typography>
              )}
            </Box>

            <Box
              sx={{
                position: "sticky",
                zIndex: 2,
                bgcolor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                p: 1,
                pb: 2,
                pt: 2,
                gap: 1,
                width: "94%",
                cursor: "pointer",
              }}
              onClick={handleToggleMenu} // toggle use
            >
              {/* Divider Top */}
              <Divider
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                }}
              />

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
                {/* {username || email} */}
                {(username || email)?.charAt(0).toUpperCase() +
                  (username || email)?.slice(1)}
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
                  <PersonRoundedIcon fontSize="small" sx={{ mr: 1 }} />
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
          </>
        )}
      </Box>

      {/* models */}
      {/* <Box
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
      </Box>  */}

      {/* chatbot */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // 🔹 Important for flexbox
          overflow: "hidden", // 🔹 Prevent horizontal scroll
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 3,
            ml: 2,
            flexShrink: 0,
            // bgcolor: "red",
          }}
        >
          {/* <IconButton onClick={() => setIsCollapsed(true)}> */}
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
            <FeaturedPlayListOutlinedIcon sx={{ ml: "-11px", mr: "7px" }} />
          </IconButton>

          <FormControl
            fullWidth
            size="small"
            gap={1}
            sx={{ mr: 2, display: "flex", flexDirection: "row", gap: 1 }}
          >
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
              <MenuItem value="chatgpt-5-mini">ChatGPT5 Mini</MenuItem>
              <MenuItem value="deepseek">DeepSeek</MenuItem>
              <MenuItem value="grok">Grok 3 Mini</MenuItem>
            </Select>

            {/* AI history */}
            <Select
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              displayEmpty
              IconComponent={() => null} // removes arrow
              sx={{
                bgcolor: "#fff",
                borderRadius: "5px",
                maxWidth: "175px",
                width: "175px",
                "& .MuiSelect-select": {
                  pl: 1.5, // small padding for text
                },
              }}
            >
              <MenuItem value="" disabled>
                AI History
              </MenuItem>
              {historyLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : historyList.length > 0 ? (
                historyList.map((query, idx) => (
                  <MenuItem key={idx} value={query}>
                    {query}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No history found</MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Custom Dropdown (no arrow) */}
          {/* <FormControl fullWidth size="small" sx={{ maxWidth: 175 }}>
            <Select
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              displayEmpty
              IconComponent={() => null} // removes arrow
              sx={{
                bgcolor: "#fff",
                borderRadius: "5px",
                "& .MuiSelect-select": {
                  pl: 1.5, // small padding for text
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Option
              </MenuItem>
              <MenuItem value="option1">Option 1</MenuItem>
              <MenuItem value="option2">Option 2</MenuItem>
              <MenuItem value="option3">Option 3</MenuItem>
            </Select>
          </FormControl> */}
        </Box>

        <Box
          className="chat-header-box"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
            width: "100%",
            // maxWidth: "940px",
            maxWidth: { xs: "100%", md: "940px" },
            mx: "auto",
            // px: { xs: 6, sm: 8, md: 10, lg: 12 },
            // px: { xs: 2, sm: 4, md: 6, lg: 12 }, // padding responsive
            // height: "100vh",
            px: { xs: 1, sm: 2, md: 4 }, // 🔹 Reduced padding for 1024x768
            height: "calc(100vh - 100px)", // 🔹 Better height calculation
            mb: 0,
            pb: 0,
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
          {activeView === "chat" ? (
            <>
              {/* 👉 Main Content (Conditional) */}
              <Box
                sx={{
                  height: "78vh",
                  // p: 2,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  overflow: "auto",
                  p: { xs: 1, sm: 1, md: 2 }, // 🔹 Reduced padding
                  minHeight: 0, // 🔹 Important for flex scrolling
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
                  <Box
                    sx={{ textAlign: "center", py: 8, color: "text.secondary" }}
                  >
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
                      {/* <Logo /> */}
                    </leafatar>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Welcome to the Wrds
                    </Typography>
                    <Typography variant="body2">
                      Start a conversation by typing a message below.
                    </Typography>
                  </Box>
                ) : (
                  // Chat Messages
                  <Box sx={{ spaceY: 6, width: "100%", minWidth: 0 }}>
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
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "14px" }}
                            >
                              You
                            </Typography>
                          </Box>
                          {/* <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end", // Right side ma mukse
                        alignItems:"flex-end",
                        float:"right",
                        mb: 1,
                      }}
                    > */}

                          {group.files && group.files.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#f0f4ff",
                                borderRadius: "6px",
                                padding: "2px 8px",
                                border: "1px solid #2F67F6",
                                maxWidth: "120px",
                                mb: 0.5,
                                // size: "20px",
                              }}
                            >
                              <InsertDriveFile
                                sx={{
                                  fontSize: "14px",
                                  color: "#2F67F6",
                                  mr: 1,
                                }}
                              />

                              {/* <Typography
                            variant="caption"
                            sx={{
                              color: "#2F67F6",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "11px",
                              fontWeight: "500",
                            }}
                          >
                           
                            {group.files.map((f) => f.name).join(", ")}
                          </Typography> */}
                              <Box sx={{ overflow: "hidden" }}>
                                {group.files.map((f, idx) => (
                                  <Typography
                                    key={idx}
                                    component="a"
                                    href={f.cloudinaryUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="caption"
                                    sx={{
                                      color: "#2F67F6",
                                      display: "block",
                                      textDecoration: "none",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      fontSize: "11px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {/* {f.filename} ({f.wordCount}w / {f.tokenCount}t) */}
                                    {/* Try these different properties */}
                                    {f.name ||
                                      f.filename ||
                                      f.originalName ||
                                      f.fileName}{" "}
                                    {/* ({f.wordCount}w / {f.tokenCount}t) */}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}

                          <Paper
                            sx={{
                              // p: 1.5,
                              p: { xs: 1, sm: 1.5 }, // 🔹 Responsive padding
                              bgcolor: "#2F67F6",
                              color: "#fff",
                              borderRadius: 3,
                              // maxWidth: { xs: "80%", md: "70%" },
                              // maxWidth: { xs: "85%", sm: "80%", md: "70%" },
                              maxWidth: { xs: "95%", sm: "90%", md: "80%" },
                            }}
                          >
                            {/* <Typography>
                          {group.prompt.charAt(0).toUpperCase() +
                            group.prompt.slice(1)}
                        </Typography> */}

                            <Typography>
                              {group.prompt.charAt(0).toUpperCase() +
                                group.prompt.slice(1)}
                            </Typography>

                            {/* Show attached files */}
                            {/* {group.files && group.files.length > 0 && (
                          <Box sx={{ mt: 1, fontSize: "12px", opacity: 0.9 }}>
                            <Typography variant="caption">
                              Attached:{" "}
                              {group.files.map((f) => f.name).join(", ")}
                            </Typography>
                          </Box>
                        )} */}

                            <Typography variant="caption">
                              {group.time}
                            </Typography>
                          </Paper>
                          {/* </Box> */}
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
                                mt: 0.5,
                              }}
                              // onClick={() => setIsCollapsed(false)}
                            />

                            {/* ✅ Bot name + AI Assistant */}
                            <Box ml={1}>
                              <Typography
                                variant="caption"
                                sx={{
                                  textDecoration: "underline",
                                  fontSize: "16px",
                                }}
                              >
                                {/* {group.botName} */}
                                {group.botName.charAt(0).toUpperCase() +
                                  group.botName.slice(1)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                WORDS
                              </Typography>
                            </Box>
                          </Box>

                          <Paper
                            sx={{
                              // p: 1.5,
                              p: { xs: 1, sm: 1.5 },
                              bgcolor: "#f1f6fc",
                              borderRadius: 3,
                              // maxWidth: { xs: "80%", md: "70%" },
                              maxWidth: { xs: "95%", sm: "90%", md: "80%" },
                            }}
                          >
                            <Box sx={{ mb: 2 }}>
                              {group.isTyping &&
                              [
                                "Thinking...",
                                "Analyzing...",
                                "Generating...",
                              ].includes(
                                group.responses[group.currentSlide]
                              ) ? (
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
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  Token Count
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
                sx={{ mb: 0, pb: 0, display: "flex", flexDirection: "column" }}
              >
                <Box
                  sx={{
                    minHeight: "60px",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid #e0e0e0",
                    bgcolor: "#fafafa",
                    pb: 0.5,
                    position: "relative",
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    // position: "relative",
                  }}
                >
                  {/* File Attachment Button - Positioned absolutely inside the container */}
                  {/* <IconButton
                component="label"
                sx={{
                  color: "#2F67F6",
                  position: "absolute",
                  left: "15px",
                  top: "52%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  backgroundColor: "white",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  // boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  
                }}
              >
                <input
                  type="file"
                  hidden
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.pptx,.xlsx,.csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      console.log("File selected:", file);
                    }
                  }}
                />
                <AttachFileIcon fontSize="small" />
              </IconButton> */}
                  <IconButton
                    component="label"
                    sx={{
                      color: "#2F67F6",
                      position: "absolute",
                      left: "15px",
                      bottom: "14px", // 👈 bottom ma fix karva
                      zIndex: 2,
                      // backgroundColor: "white",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.pptx,.xlsx,.csv"
                      // onChange={(e) => {
                      //   const files = e.target.files;
                      //   if (files && files.length > 0) {
                      //     setSelectedFile(files); // 🔹 array of files સેટ કરો
                      //     console.log("Files selected:", files);
                      //   }
                      // }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files); // Convert FileList to Array
                        // if (files.length > 0) {
                        //   // setSelectedFiles(files);
                        //   setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
                        //   console.log("Files selected:", files);
                        // }
                        if (files.length > 0) {
                          setSelectedFiles((prevFiles) => {
                            // Limit to 5 files maximum (matches backend limit)
                            const newFiles = [...prevFiles, ...files];
                            return newFiles.slice(0, 5);
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                    <AttachFileIcon fontSize="small" />
                  </IconButton>

                  {/* Main Input with extra left padding for file icon */}
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
                        height: "auto",
                        minHeight: "40px",
                        padding:
                          selectedFiles.length > 0
                            ? "30px 14px 8.5px 37px !important"
                            : "0px !important",
                        paddingLeft: "37px !important", // Space for file icon
                        paddingTop: selectedFiles.length > 0 ? "30px" : "0px", // Adjust top padding for files
                      },
                      "& .MuiOutlinedInput-input": {
                        padding: "8px",
                        height: "auto",
                        minHeight: "24px",
                        marginTop: selectedFiles.length > 0 ? "24px" : "0px",
                      },
                      "& .Mui-disabled": {
                        opacity: 0.5,
                      },
                      fontSize: { xs: "14px", sm: "16px" },
                      minWidth: { xs: "100%", sm: "200px" },
                      mb: { xs: 1, sm: 0 },
                    }}
                    multiline
                    maxRows={selectedFiles.length > 0 ? 4 : 3}
                    InputProps={{
                      startAdornment: selectedFiles.length > 0 && ( // 🔹 selectedFiles.length તપાસો
                        <Box
                          sx={{
                            position: "absolute",
                            top: "8px",
                            left: "11px",
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap", // 🔹 Multiple files માટે wrap કરો
                            gap: 0.5, // 🔹 Files વચ્ચે gap
                            // maxWidth: "200px", // 🔹 Maximum width
                            maxWidth: "calc(100% - 50px)", // Prevent overflow
                          }}
                        >
                          {/* File Name Display */}
                          {selectedFiles.map((file, index) => (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#f0f4ff",
                                borderRadius: "12px",
                                padding: "2px 8px",
                                border: "1px solid #2F67F6",
                                maxWidth: "120px",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#2F67F6",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                }}
                              >
                                {/* {file.name} */}
                                {file.name.length > 15
                                  ? file.name.substring(0, 12) + "..."
                                  : file.name}
                              </Typography>
                              <IconButton
                                size="small"
                                // onClick={() => setSelectedFiles(null)}
                                onClick={() => removeFile(index)} // 🔹 index પાસ કરો
                                sx={{ color: "#ff4444", p: 0.5, ml: 0.5 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ),
                    }}
                  />
                  {console.log("selectedFiles length:", selectedFiles.length)}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: 1,
                      flexShrink: 0,
                    }}
                  >
                    <TextField
                      select
                      size="small"
                      value={responseLength}
                      onChange={(e) => setResponseLength(e.target.value)}
                      sx={{
                        width: { xs: "140px", sm: "179px" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#fff",
                          textAlign: "center",
                        },
                      }}
                      SelectProps={{
                        displayEmpty: true,
                        MenuProps: {
                          disablePortal: true,
                          PaperProps: {
                            style: { maxHeight: 200, borderRadius: "10px" },
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Response Length:
                      </MenuItem>
                      <MenuItem value="Short">Short (50-100 words)</MenuItem>
                      <MenuItem value="Concise">
                        Concise (150-250 words)
                      </MenuItem>
                      <MenuItem value="Long">Long (300-500 words)</MenuItem>
                      <MenuItem value="NoOptimisation">
                        No Optimisation
                      </MenuItem>
                    </TextField>

                    <IconButton
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isSending || isTypingResponse}
                      sx={{
                        "&:disabled": {
                          opacity: 0.5,
                          cursor: "not-allowed",
                        },
                        ml: 1,
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* 👉 Tagline (Always Common) */}
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "11px" }}
                  >
                    This AI Assistant can help with general information.
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <SearchUI setHistoryList={setHistoryList} />
          )}
        </Box>
      </Box>

      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        maxWidth="xs"
        fullWidth
      >
        {/* <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          User Profile
        </DialogTitle> */}
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: "1px solid #e0e0e0",
            position: "relative", // જરૂરી
          }}
        >
          User Profile
          {/* Close Button */}
          <IconButton
            aria-label="close"
            onClick={() => setOpenProfile(false)}
            size="small"
            sx={{
              position: "absolute",
              right: 6,
              top: 7,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
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
              {/* {(username || "Unknown User")} */}
              {(username || "Unknown User")?.charAt(0).toUpperCase() +
                (username || "Unknown User")?.slice(1)}
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
              {sessionRemainingTokens}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatUI;
