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
  Autocomplete,
  ListItemButton,
  CircularProgress,
  Skeleton,
  MenuItem,
  Menu,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
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
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
import GrokSearchUI from "./GrokSearchUI";
import { useGrok } from "./context/GrokContext";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import chat from "././assets/chat.webp";
import Words1 from "././assets/words1.webp"; // path adjust karo
// import Words2 from "././assets/words2.webp"; // path adjust karo
import Words2 from "././assets/words2.png"; // path adjust karo
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopCircleIcon from "@mui/icons-material/StopCircle";

const ChatUI = () => {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [smartAISessions, setSmartAISessions] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messageGroups, setMessageGroups] = useState([]);
  const [smartAIMessageGroups, setSmartAIMessageGroups] = useState([[]]); // 🧠 separate Smart AI history
  const [isSending, setIsSending] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const abortControllerRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const isStoppedRef = useRef(false);
  const [maxWords, setMaxWords] = useState(10);
  const [skipHistoryLoad, setSkipHistoryLoad] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedBot, setSelectedBot] = useState("chatgpt-5-mini");
  const [openProfile, setOpenProfile] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(0);
  // const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [responseLength, setResponseLength] = useState("Short");
  const lastSelectedResponseLength = useRef(responseLength);

  // 🔹 नवी state add करो
  // const [sessionRemainingTokens, setSessionRemainingTokens] = useState(0);
  const [chatRemainingTokens, setChatRemainingTokens] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [grokcustomValue, setGrokCustomValue] = useState("");
  const [activeView, setActiveView] = useState("chat");
  const [customValue, setCustomValue] = useState("");
  const [historyList, setHistoryList] = useState([]); // store user search history
  const [selectedGrokQuery, setSelectedGrokQuery] = useState("");
  const [isSmartAI, setIsSmartAI] = useState(false);
  // const [error, setError] = useState("");
  // const [tokenCount, setTokenCount] = useState(0);
  const [linkCount, setLinkCount] = useState(3);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const partialResponseRef = useRef("");
  const currentPromptRef = useRef("");

  const {
    loading,
    setLoading,
    error,
    setError,
    tokenCount,
    setTokenCount,
    sessionRemainingTokens,
    setSessionRemainingTokens,
    results,
    setResults,
    grokhistoryList,
    setGrokHistoryList,
    totalTokensUsed,
    setTotalTokensUsed,
    totalSearches,
    setTotalSearches,
  } = useGrok();

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
      setAnchorsEl(null);
    } else {
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
    // Whenever user changes dropdown, keep latest value saved
    lastSelectedResponseLength.current = responseLength;
  }, [responseLength]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Custom Popper for wider dropdown
  const StyledPopper = styled(Popper)({
    "& .MuiAutocomplete-paper": {
      minWidth: "400px", // 🔥 Set your desired width here
    },
  });

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
  // useEffect(() => {
  //   fetchSearchHistory();
  // }, [apiBaseUrl, historyLoading]);

  console.log("historyList::::::::::", historyList);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // const startListening = () => {
  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;

  //   if (!SpeechRecognition) {
  //     alert("Your browser does not support speech recognition!");
  //     return;
  //   }

  //   const recognition = new SpeechRecognition();
  //   recognition.lang = "en-US"; // or "gu-IN" for Gujarati
  //   recognition.continuous = false;
  //   recognition.interimResults = true;

  //   recognition.onstart = () => setIsListening(true);

  //   recognition.onresult = (event) => {
  //     let transcript = "";
  //     for (let i = event.resultIndex; i < event.results.length; i++) {
  //       transcript += event.results[i][0].transcript;
  //     }
  //     setInput(transcript); // live typing into your input box
  //   };

  //   recognition.onerror = (event) => {
  //     console.error("Speech recognition error:", event.error);
  //     setIsListening(false);
  //   };

  //   recognition.onend = () => {
  //     setIsListening(false);
  //     recognitionRef.current = null;
  //   };

  //   recognition.start();
  //   recognitionRef.current = recognition;
  // };

  // const stopListening = () => {
  //   recognitionRef.current?.stop();
  //   setIsListening(false);
  // };

  // const startListening = () => {
  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;

  //   if (!SpeechRecognition) {
  //     alert("Your browser does not support speech recognition!");
  //     return;
  //   }

  //   // prevent multiple instances
  //   if (recognitionRef.current) return;

  //   const recognition = new SpeechRecognition();
  //   recognition.lang = "en-US"; // or "gu-IN"
  //   recognition.continuous = true; // 👈 keep listening until stop
  //   recognition.interimResults = true;

  //   recognition.onstart = () => {
  //     console.log("🎤 Voice input started...");
  //     setIsListening(true);
  //   };

  //   recognition.onresult = (event) => {
  //     let transcript = "";
  //     for (let i = event.resultIndex; i < event.results.length; i++) {
  //       transcript += event.results[i][0].transcript;
  //     }

  //     // 👇 accumulate or live-update typed text
  //     setInput((prev) => transcript);
  //   };

  //   recognition.onerror = (event) => {
  //     console.error("Speech recognition error:", event.error);
  //     setIsListening(false);
  //     recognitionRef.current = null;
  //   };

  //   recognition.onend = () => {
  //     console.log("🛑 Voice input stopped");
  //     setIsListening(false);
  //     recognitionRef.current = null;
  //   };

  //   recognition.start();
  //   recognitionRef.current = recognition;
  // };

  // const stopListening = () => {
  //   console.log("⛔ Stop clicked");
  //   if (recognitionRef.current) {
  //     recognitionRef.current.stop();
  //     recognitionRef.current = null;
  //   }
  //   setIsListening(false);
  // };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition!");
      return;
    }

    if (recognitionRef.current) return; // prevent multiple mic instances

    const recognition = new SpeechRecognition();
    // recognition.lang = "en-US"; // or "gu-IN"
    recognition.lang = "auto"; // ✅ auto-detect spoken language
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = ""; // 🔹 store only final confirmed speech

    recognition.onstart = () => {
      console.log("🎤 Listening started...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      // loop through results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.trim();

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // 🔹 Combine final confirmed + current speaking (no duplication)
      const combinedText = (finalTranscript + interimTranscript).trim();

      // 🔹 Update input box only with latest clean text (no repeats)
      setInput(combinedText);

      // ✅ Translate to English
      // if (combinedText) {
      //   try {
      //     const translated = translateToEnglish(combinedText);
      //     setInput(translated);
      //   } catch (error) {
      //     console.error("🌐 Translation error:", error);
      //     setInput(combinedText); // fallback: show raw speech
      //   }
      // }
    };

    recognition.onerror = (event) => {
      console.error("🎙️ Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      console.log("🛑 Listening stopped");
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // ✅ Translation function (LibreTranslate or Google API)
  // async function translateToEnglish(text) {
  //   try {
  //     // 🔹 Option 1: Free LibreTranslate API (no key required, slower)
  //     // const res = await fetch("https://libretranslate.de/translate", {
  //     const res = await fetch(`${apiBaseUrl}/api/ai/translate`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         text,
  //         // q: text,
  //         // source: "auto",
  //         // target: "en",
  //         // format: "text",
  //       }),
  //     });
  //     const data = await res.json();
  //     return data.translatedText;
  //   } catch (error) {
  //     console.error("🔴 Translation error:", error);
  //     return text; // fallback: return original text if translation fails
  //   }
  // }

  const handleSearch = async (searchQuery) => {
    const finalQuery = searchQuery || query; // ✅ use passed query if available
    console.log("finalQuery:::====", finalQuery);
    if (!finalQuery) return; // do nothing if query is empty
    setLoading(true);
    setError(null);
    setTokenCount(0);

    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;
    console.log("user:::=====", user);
    try {
      const response = await fetch(`${apiBaseUrl}/search`, {
        // const response = await fetch(`${apiBaseUrl}/grokSearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: finalQuery,
          email, // optional
          category: "general", // optional
          linkCount,
          raw: false,
        }),
      });

      const data = await response.json();

      if (data.limitReached) {
        Swal.fire({
          title: "Search Limit Reached 🚫",
          text: data.message,
          icon: "warning",
          confirmButtonText: "OK",
        });
        setLoading(false);
        return;
      }

      if (response.status === 403 || data.allowed === false) {
        Swal.fire({
          title: "Restricted Search 🚫",
          text:
            data.message || "This search is not allowed for your age group.",
          icon: "warning",
        });
        setError(data.message);
        setLoading(false);
        return;
      }

      if (response.status === 400 && data.message === "Not enough tokens") {
        setResults(null);
        setTokenCount(0);

        await Swal.fire({
          title: "Not enough tokens!",
          text: "You don't have enough tokens to continue.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ok",
          cancelButtonText: "Purchase Tokens",
          allowOutsideClick: true, // ✅ allow closing by clicking outside
          allowEscapeKey: true, // ✅ allow Esc key
          allowEnterKey: true, // ✅ allow Enter key
        }).then((results) => {
          if (results.isConfirmed) {
            Swal.close();
          } else if (results.isDismissed) {
            // window.location.href = "/purchase";
          }
        });

        setError("Not enough tokens to process your request.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // const data = await response.json();

      if (data.remainingTokens !== undefined) {
        setSessionRemainingTokens(data.remainingTokens); // ✅ update parent
      }
      setResults(data);
      // setTokenCount(data.tokenUsage?.totalTokens || 0); // <-- update token count

      // ✅ Get token counts
      const usedTokens =
        data.summaryStats?.tokens || data.tokenUsage?.totalTokens || 0;
      setTokenCount(usedTokens);

      // // ✅ Update total tokens used
      // setTotalTokensUsed((prev) => (prev || 0) + usedTokens);

      // // ✅ Deduct used tokens from remaining
      // setSessionRemainingTokens((prev) =>
      //   Math.max(0, (prev || 0) - usedTokens)
      // );

      try {
        const statsRes = await fetch(`${apiBaseUrl}/userTokenStats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          if (typeof stats.totalTokensUsed === "number") {
            setTotalTokensUsed(stats.totalTokensUsed);
          }
          if (typeof stats.remainingTokens === "number") {
            setSessionRemainingTokens(stats.remainingTokens);
            localStorage.setItem(
              "globalRemainingTokens",
              stats.remainingTokens
            );
          }
        }
      } catch (e) {
        console.warn(
          "Failed to refresh userTokenStats after search:",
          e.message
        );
      }

      if (data.totalSearches !== undefined) {
        setTotalSearches(data.totalSearches);
      }

      // const currentTokens = data.tokenUsage?.totalTokens || 0;

      // // ✅ Update token count for this search
      // setTokenCount(currentTokens);

      // // ✅ Add to global total tokens used
      // setTotalTokensUsed((prevTotal) => prevTotal + currentTokens);

      // 🔹 Save to localStorage for persistence
      localStorage.setItem(
        "lastGrokSearch",
        JSON.stringify({ query: finalQuery, results: data })
      );
      console.log("Search Response:", data);

      // 🔹 2. After search success → Call Search History API
      await fetch(`${apiBaseUrl}/Searchhistory`, {
        // await fetch(`${apiBaseUrl}/grokSearchhistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((historyData) => {
          console.log("Updated search history:", historyData);
          if (historyData.history?.length > 0)
            setGrokHistoryList(historyData.history.map((h) => h.query));
        })
        .catch((err) => {
          console.error("Search history fetch error:", err);
        });
    } catch (err) {
      console.error("Search API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fetchChatbotResponseWithFiles = async (
    formData,
    currentSessionId,
    isSmartAI = false
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    //  Add here
    currentPromptRef.current = input;
    partialResponseRef.current = "";

    try {
      // 👇 Dynamic endpoint
      const endpoint =
        isSmartAI || activeView === "smartAi"
          ? `${apiBaseUrl}/api/ai/SmartAIask`
          : `${apiBaseUrl}/api/ai/ask`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData, // No Content-Type header - browser will set it with boundary
        signal: controller.signal,
      });

      const data = await response.json();

      // Handle "Not enough tokens" error
      // if (!response.ok) {
      //   const errorData = await response.json();

      //   if (
      //     response.status === 400 &&
      //     errorData.message === "Not enough tokens"
      //   ) {
      //     await Swal.fire({
      //       title: "Not enough tokens!",
      //       text: "You don't have enough tokens to continue.",
      //       icon: "warning",
      //       showCancelButton: true,
      //       showDenyButton: true,
      //       confirmButtonText: "Ok",
      //       denyButtonText: "Switch to Free Model",
      //       cancelButtonText: "Purchase Tokens",
      //     }).then((result) => {
      //       if (result.isConfirmed) {
      //         // just close
      //       } else if (result.isDenied) {
      //         setSelectedBot("chatgpt-5-mini");
      //       } else if (result.isDismissed) {
      //         // window.location.href = "/purchase";
      //       }
      //     });

      //     return {
      //       response: "Not enough tokens to process your request.",
      //       sessionId: currentSessionId,
      //       botName: selectedBot,
      //       isError: true,
      //     };
      //   }

      //   throw new Error(
      //     errorData.message || `HTTP error! status: ${response.status}`
      //   );
      // }

      // 🛑 Check for “Not enough tokens” here (works 100%)
      if (data?.message === "Not enough tokens") {
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
          // botName: selectedBot,
          botName:
            isSmartAI || activeView === "smartAi" ? "Smart AI" : selectedBot,
          isError: true,
        };
      }

      // 🛑 AGE-BASED RESTRICTION HANDLER
      if (response.status === 403 || data.allowed === false) {
        await Swal.fire({
          title: "Restricted Search 🚫",
          text:
            data.message || "This request is not allowed for your age group.",
          icon: "warning",
        });
        return {
          response: data.message,
          sessionId: currentSessionId,
          // botName: selectedBot,
          botName:
            isSmartAI || activeView === "smartAi" ? "Smart AI" : selectedBot,
          isError: true,
        };
      }

      // 🟢 while processing response, store it in partial ref
      if (data?.response) {
        partialResponseRef.current = data.response; // save the full (or partial) response
      }

      // 🟢 (optional) you can also do this line if you render “typing” in UI:
      setIsTypingResponse(false);

      abortControllerRef.current = null;
      // const data = await response.json();

      console.log("API Response with files:", data);

      // ✅ Immediately refresh user token stats after chat completion
      // try {
      //   const user = JSON.parse(localStorage.getItem("user"));
      //   const email = user?.email;
      //   if (email) {
      //     const statsRes = await fetch(`${apiBaseUrl}/userTokenStats`, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ email }),
      //     });

      //     if (statsRes.ok) {
      //       const stats = await statsRes.json();
      //       if (typeof stats.totalTokensUsed === "number") {
      //         setTotalTokensUsed(stats.totalTokensUsed);
      //       }
      //       if (typeof stats.remainingTokens === "number") {
      //         setSessionRemainingTokens(stats.remainingTokens);
      //         localStorage.setItem("globalRemainingTokens", stats.remainingTokens);
      //       }
      //     }
      //   }
      // } catch (e) {
      //   console.warn("⚠️ Failed to refresh userTokenStats after chat:", e.message);
      // }

      return {
        response: data.response?.replace(/\n\n/g, "<br/>") || "",
        sessionId: data.sessionId,
        remainingTokens: data.remainingTokens,
        tokensUsed: data.tokensUsed || null,
        totalTokensUsed: data.totalTokensUsed ?? null,
        // botName: data.botName || selectedBot,
        botName:
          isSmartAI || activeView === "smartAi"
            ? "Smart AI"
            : data.botName || selectedBot,
        files: data.files || [], // Include file info from backend
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }

      console.error("fetchChatbotResponseWithFiles error:", err);

      // if (err.message && err.message.includes("Not enough tokens")) {
      //   return {
      //     response: "Not enough tokens to process your request.",
      //     sessionId: currentSessionId,
      //     botName: selectedBot,
      //     isError: true,
      //   };
      // }

      // 🟡 Catch any other "Not enough tokens" message (fallback)
      if (err.message && err.message.includes("Not enough tokens")) {
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
            // Just close
          } else if (result.isDenied) {
            setSelectedBot("chatgpt-5-mini");
          } else if (result.isDismissed) {
            // window.location.href = "/purchase";
          }
        });

        return {
          response: "Not enough tokens to process your request.",
          sessionId: currentSessionId,
          // botName: selectedBot,
          botName:
            isSmartAI || activeView === "smartAi" ? "Smart AI" : selectedBot,
          isError: true,
        };
      }

      return {
        response: "Sorry, something went wrong.",
        sessionId: currentSessionId,
        // botName: selectedBot,
        botName:
          isSmartAI || activeView === "smartAi" ? "Smart AI" : selectedBot,
        isError: true,
      };
    }
  };

  // Add this function
  // const handleStopResponse = async () => {
  //   if (abortControllerRef.current) {
  //     console.log("⛔ User clicked Stop");
  //     abortControllerRef.current.abort(); // cancel fetch
  //     abortControllerRef.current = null;
  //     // isStoppedRef.current = true;
  //   }
  //   isStoppedRef.current = true;

  //   setIsTypingResponse(false);

  //   const user = JSON.parse(localStorage.getItem("user"));
  //   const email = user?.email;

  //   // 🧩 Get partial response text from the currently displayed message
  //   const partialResponse = getCurrentPartialResponse(); // <-- define below

  //   // Save partial response to backend

  //   // if (partialResponseRef.current && selectedChatId) {
  //   if (partialResponse && selectedChatId) {
  //     try {
  //       await fetch(`${apiBaseUrl}/api/ai/save_partial`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           email,
  //           sessionId: selectedChatId,
  //           prompt: currentPromptRef.current,
  //           partialResponse,
  //           // partialResponse: partialResponseRef.current,
  //           botName: selectedBot,
  //         }),
  //       });
  //       console.log("✅ Partial response saved");
  //     } catch (err) {
  //       console.error("Failed to save partial response:", err);
  //     }
  //   }
  // };

  const handleStopResponse = async () => {
    if (abortControllerRef.current) {
      console.log("⛔ User clicked Stop");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isStoppedRef.current = true;
    setIsTypingResponse(false);

    const partialResponse = getCurrentPartialResponse();
    if (!partialResponse || !selectedChatId) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.email;

      const messageType = activeView === "smartAi" ? "smart Ai" : "chat";

      const res = await fetch(`${apiBaseUrl}/api/ai/save_partial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          sessionId: selectedChatId,
          prompt: currentPromptRef.current,
          partialResponse,
          botName: selectedBot,
          type: messageType, // ✅ add type
        }),
      });

      const data = await res.json();
      console.log("✅ Partial response saved:", data);

      if (data.success) {
        // ✅ Update tokens + UI instantly based on type
        if (messageType === "smart Ai") {
          // 🧠 Update Smart AI message group
          setSmartAIMessageGroups((prev) => {
            const updated = [...prev];
            const messages = updated[0] || [];
            const lastMsgIndex = messages.length - 1;

            if (lastMsgIndex >= 0) {
              messages[lastMsgIndex] = {
                ...messages[lastMsgIndex],
                isTyping: false,
                isComplete: false,
                tokensUsed: data.tokensUsed,
                type: "smart Ai",
              };
              updated[0] = messages;
            }

            return updated;
          });
        } else {
          // 💬 Update Chat message group
          setMessageGroups((prev) => {
            const updated = [...prev];
            const messages = updated[0] || [];
            const lastMsgIndex = messages.length - 1;

            if (lastMsgIndex >= 0) {
              messages[lastMsgIndex] = {
                ...messages[lastMsgIndex],
                isTyping: false,
                isComplete: false,
                tokensUsed: data.tokensUsed,
                type: "chat",
              };
              updated[0] = messages;
            }

            return updated;
          });
        }

        // ✅ userTokenStats (AFTER save_partial)
        try {
          const statsRes = await fetch(`${apiBaseUrl}/userTokenStats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (statsRes.ok) {
            const stats = await statsRes.json();
            if (typeof stats.totalTokensUsed === "number")
              setTotalTokensUsed(stats.totalTokensUsed);
            if (typeof stats.remainingTokens === "number") {
              setSessionRemainingTokens(stats.remainingTokens);
              localStorage.setItem(
                "globalRemainingTokens",
                stats.remainingTokens
              );
            }
          }
        } catch (err) {
          console.warn(
            "⚠️ Failed to refresh stats after partial save:",
            err.message
          );
        }

        // re-fetch chat session so DB stays synced
        // await fetchChatSessions();
        // ✅ Re-fetch only relevant sessions
        if (messageType === "smart Ai") {
          await fetchSmartAISessions(); // refresh smart Ai tab
        } else {
          await fetchChatSessions(); // refresh chat tab
        }
      }
    } catch (err) {
      console.error("❌ Failed to save partial response:", err);
    }
  };

  // Helper function
  const getCurrentPartialResponse = () => {
    // 🧠 detect which view is active
    const messageType =
      activeView === "smartAi" || isSmartAI ? "smart Ai" : "chat";

    // 🧩 choose the correct message source
    const currentGroups =
      messageType === "smart Ai" ? smartAIMessageGroups : messageGroups;

    const lastMsgGroup = currentGroups?.[0] || [];
    const lastMsg = lastMsgGroup[lastMsgGroup.length - 1];
    return lastMsg?.responses?.[0] || "";
  };

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

      // ✅ Filter only type:"chat"
      const filteredSessions = data.sessions?.filter(
        (s) => s?.type?.toLowerCase() === "chat"
      );

      // Handle different response structures
      // if (data && Array.isArray(data.sessions)) {
      //   // Structure 1: response: [{ user_sessions: [...] }]
      //   if (data && data?.session?.length > 0) {
      //     console.log("data.response_if:::::", data);
      //     console.log(
      //       "data?.sessions?.history?.length:::::",
      //       data?.sessions?.history?.length
      //     );
      //     // alert("hhhhhhhhh");

      //     sessions = data?.sessions?.reverse().map((session) => {
      //       console.log(
      //         "session?.history?.[0]?.totalTokensUsed",
      //         session?.history?.[0]?.totalTokensUsed
      //       );
      //       // Save token count to localStorage
      //       if (session?.history?.[0]?.totalTokensUsed !== undefined) {
      //         localStorage.setItem(
      //           `tokens_${session.sessionId}`,
      //           session?.history?.[0]?.totalTokensUsed?.toString()
      //         );
      //       }
      //       return {
      //         id: session.sessionId,
      //         // name:
      //         //   session.heading ||
      //         //   `Chat ${session.sessionId.slice(0, 8)}`,
      //         name: session.heading || `Chat ${session.sessionId.slice(0, 8)}`,
      //         sessionId: session.sessionId,
      //         createTime: session.create_time || new Date().toISOString(),
      //         totalTokensUsed: session.totalTokensUsed || 0,
      //       };
      //     });
      //   }
      //   // Structure 2: response: [{ session_id, session_heading, ... }]
      //   else {
      //     console.log(
      //       "data?.sessions?.history?.length > 0_else:::====",
      //       data?.sessions?.history?.length > 0
      //     );
      //     console.log("data.response_else:::::", data);

      //     sessions = data?.sessions?.reverse().map((session) => {
      //       if (session?.history?.[0]?.totalTokensUsed !== undefined) {
      //         localStorage.setItem(
      //           `tokens_${session.sessionId}`,
      //           session?.history?.[0]?.totalTokensUsed?.toString()
      //         );
      //       }
      //       return {
      //         id: session.sessionId,
      //         // name:
      //         //   session.heading ||
      //         //   session.name ||
      //         //   `Chat ${session.sessionId.slice(0, 8)}`,
      //         name: session.heading || `Chat ${session.sessionId.slice(0, 8)}`,
      //         sessionId: session.sessionId,
      //         createTime:
      //           session.create_time ||
      //           session.createTime ||
      //           new Date().toISOString(),
      //         totalTokensUsed: session?.history?.[0]?.totalTokensUsed || 0,
      //       };
      //     });
      //   }
      // }

      // ✅ Process filtered chat sessions only
      if (Array.isArray(filteredSessions) && filteredSessions.length > 0) {
        sessions = filteredSessions.reverse().map((session) => {
          // ✅ Save token count to localStorage if available
          if (session?.history?.[0]?.totalTokensUsed !== undefined) {
            localStorage.setItem(
              `tokens_${session.sessionId}`,
              session?.history?.[0]?.totalTokensUsed?.toString()
            );
          }

          return {
            id: session.sessionId,
            name: session.heading || `Chat ${session.sessionId.slice(0, 8)}`,
            sessionId: session.sessionId,
            createTime:
              session.create_time ||
              session.createTime ||
              new Date().toISOString(),
            // totalTokensUsed: session?.history?.[0]?.totalTokensUsed || 0,
            totalTokensUsed: session.totalTokensUsed || 0,
            type: "chat", // ✅ always tag as chat type
          };
        });
      }
      console.log("sessions:::::::", sessions);
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

      // ✅ Add/force type:"chat" in each message
      // const filteredMessages = messagesArray
      //   .filter((msg) => !msg.type || msg.type.toLowerCase() === "chat")
      //   .map((msg) => ({
      //     ...msg,
      //     type: "chat",
      //   }));

      // console.log("Filtered chat history:", filteredMessages);

      // return filteredMessages;

      // ✅ Filter only type:"chat"
      const messages = (data.response || data.messages || []).filter(
        (msg) => msg?.type?.toLowerCase() === "chat"
      );

      return messages;
    } catch (error) {
      console.error("API Error:", error);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  // 🧠 Fetch Smart AI sessions
  const fetchSmartAISessions = async () => {
    setSessionLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) return;

      const response = await fetch(
        `${apiBaseUrl}/api/ai/get_smartAi_sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

      const data = await response.json();
      console.log("SmartAI Sessions:", data);

      // ✅ Filter only type:"smart Ai"
      const filteredSessions = data.sessions?.filter(
        (s) => s?.type?.toLowerCase() === "smart Ai"
      );

      let sessions = [];

      // ✅ Process filtered smart AI sessions only
      if (Array.isArray(filteredSessions) && filteredSessions.length > 0) {
        sessions = filteredSessions.reverse().map((session) => {
          // ✅ Save token count to localStorage if available
          if (session?.history?.[0]?.totalTokensUsed !== undefined) {
            localStorage.setItem(
              `tokens_${session.sessionId}`,
              session?.history?.[0]?.totalTokensUsed?.toString()
            );
          }

          return {
            id: session.sessionId,
            name:
              session.heading || `Smart AI ${session.sessionId.slice(0, 8)}`,
            sessionId: session.sessionId,
            createTime:
              session.create_time ||
              session.createTime ||
              new Date().toISOString(),
            totalTokensUsed: session.totalTokensUsed || 0,
            type: "smart Ai", // ✅ always tag as Smart AI type
          };
        });
      }

      console.log("Smart AI sessions (filtered):", sessions);

      // ✅ Store only Smart AI sessions
      setSmartAISessions(sessions || []);

      // Auto-load first Smart AI chat
      if (sessions?.length && initialLoad && !selectedChatId) {
        const firstSessionId = sessions[0].id;
        setSelectedChatId(firstSessionId);
        localStorage.setItem("lastSmartAISessionId", firstSessionId);
        loadSmartAIHistory(sessions[0].sessionId);
      }
    } catch (err) {
      console.error("Smart AI sessions error:", err);
    } finally {
      setSessionLoading(false);
      setInitialLoad(false);
    }
  };

  // 🧠 Fetch Smart AI chat history
  const getSmartAIHistory = async (sessionId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) return [];

      const response = await fetch(`${apiBaseUrl}/api/ai/SmartAIhistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email: user.email }),
      });

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

      const data = await response.json();
      console.log("Smart AI History:", data);

      if (data.remainingTokens !== undefined)
        setChatRemainingTokens(data.remainingTokens);

      return Array.isArray(data.response)
        ? data.response
        : Array.isArray(data.messages)
        ? data.messages
        : [];

      // ✅ Filter only type:"smart Ai"
      const messages = (data.response || data.messages || []).filter(
        (msg) => msg?.type?.toLowerCase() === "smart Ai"
      );

      return messages;
    } catch (err) {
      console.error("Smart AI history error:", err);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // 🧠 choose which message list to scroll based on active view
    const currentGroups =
      activeView === "smartAi" || isSmartAI
        ? smartAIMessageGroups
        : messageGroups;

    if (!historyLoading && currentGroups.length > 0) {
      scrollToBottom();
    }
  }, [
    historyLoading,
    messageGroups,
    ,
    smartAIMessageGroups,
    activeView,
    isSmartAI,
    scrollToBottom,
  ]);

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
    // fetchChatSessions();

    // Fetch combined token stats (chat + search) for profile
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/userTokenStats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });
        if (!res.ok) return;
        const stats = await res.json();
        if (stats?.totalTokensUsed !== undefined) {
          setTotalTokensUsed(stats.totalTokensUsed);
        }
        if (stats?.totalSearches !== undefined) {
          setTotalSearches(stats.totalSearches);
        }
        if (stats?.remainingTokens !== undefined) {
          setSessionRemainingTokens(stats.remainingTokens);
        }
      } catch (e) {
        console.warn("Failed to load user token stats:", e.message);
      }
    })();

    // Fetch chat sessions after confirming user exists
    // fetchChatSessions();

    // ✅ Fetch data depending on selected view
    if (isSmartAI || activeView === "smartAi") {
      console.log("🧠 Loading Smart AI sessions...");
      fetchSmartAISessions();
    } else {
      console.log("💬 Loading normal chat sessions...");
      fetchChatSessions();
    }
  }, [activeView, isSmartAI]);

  useEffect(() => {
    if (!selectedChatId) return;

    // const selectedChat = chats.find((chat) => chat.id === selectedChatId);
    // 🧠 Choose correct session list
    const currentSessions =
      activeView === "smartAi" || isSmartAI ? smartAISessions : chats;

    const selectedChat = currentSessions.find(
      (chat) => chat.id === selectedChatId
    );

    if (!selectedChat) return;
    if (skipHistoryLoad) {
      setSkipHistoryLoad(false);
      return;
    }

    console.log("Loading chat history for session:", selectedChat.sessionId); // Debug log

    if (selectedChat.sessionId) {
      if (activeView === "smartAi") {
        // 🧠 Smart AI tab
        loadSmartAIHistory(selectedChat.sessionId);

        // 🔹 Load latest token count for Smart AI
        const savedTokens = localStorage.getItem(
          `tokens_${selectedChat.sessionId}_smartAi`
        );
        if (savedTokens) {
          setRemainingTokens(Number(savedTokens));
          console.log("Smart AI tokens:", savedTokens);
        }
      } else {
        // 💬 Chat tab
        loadChatHistory(selectedChat.sessionId);

        // 🔹 Load latest token count for Chat
        const savedTokens = localStorage.getItem(
          `tokens_${selectedChat.sessionId}_chat`
        );
        if (savedTokens) {
          setRemainingTokens(Number(savedTokens));
          console.log("Chat tokens:", savedTokens);
        }
      }
    } else {
      // 🧹 Reset UI if no session
      if (activeView === "smartAi") {
        setSmartAIMessageGroups([[]]);
      } else {
        setMessageGroups([[]]);
      }
    }
  }, [
    selectedChatId,
    skipHistoryLoad,
    activeView,
    isSmartAI,
    chats,
    smartAISessions,
  ]);

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

  const loadSmartAIHistory = async (sessionId) => {
    console.log("🧠 Fetching Smart AI history for sessionId:", sessionId);
    if (!sessionId) {
      setSmartAIMessageGroups([[]]); // ✅ clear Smart AI messages
      return;
    }

    setHistoryLoading(true);

    try {
      // 1️⃣ Fetch Smart AI history data
      const rawHistory = await getSmartAIHistory(sessionId);

      // 2️⃣ Process Smart AI messages
      const processedGroups = [];

      for (let i = 0; i < rawHistory.length; i++) {
        const message = rawHistory[i];

        if (message.prompt) {
          processedGroups.push({
            id: message.id || `smartMsg_${i}`,
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
            botName: message.botName || "Smart AI",
            files: message.files || [],
          });
        } else if (message.role === "user") {
          // legacy structure (user + model)
          let modelResponse = null;
          let tokensUsed = null;
          let botName = "Smart AI";
          let j = i + 1;

          while (j < rawHistory.length && rawHistory[j].role !== "user") {
            if (rawHistory[j].role === "model") {
              modelResponse = rawHistory[j];
              tokensUsed = modelResponse.tokensUsed || null;
              botName = modelResponse.botName || "Smart AI";
              break;
            }
            j++;
          }

          processedGroups.push({
            id: message.id || `smartMsg_${i}`,
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
            tokensUsed,
            botName,
            files: message.files || [],
          });
        }
      }

      // 3️⃣ Handle fallback case
      if (processedGroups.length === 0 && rawHistory.length > 0) {
        rawHistory.forEach((message, index) => {
          if (message.content) {
            processedGroups.push({
              id: `smartMsg_${index}`,
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
              botName: message.botName || "Smart AI",
              files: message.files || [],
            });
          }
        });
      }

      // 4️⃣ Save Smart AI messages to a separate state
      setSmartAIMessageGroups([processedGroups]); // ✅ separate from chat
    } catch (error) {
      console.error("❌ Error loading Smart AI history:", error);
      setSmartAIMessageGroups([[]]);
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

  const handleSend = async (editedPrompt = null, editedId = null) => {
    // if (( !input.trim() && selectedFiles.length === 0) || isSending)
    isStoppedRef.current = false;
    const prompt = editedPrompt ? editedPrompt.trim() : input.trim();
    if (!prompt) return;

    setInput("");
    setSelectedFiles([]);
    setIsSending(true);
    setIsTypingResponse(true);

    const messageId =
      Date.now() + "_" + Math.random().toString(36).substr(2, 5); // always new id

    // 🧠 Choose correct session list
    const currentSessions =
      activeView === "smartAi" || isSmartAI ? smartAISessions : chats;

    let currentSessionId = selectedChatId
      ? currentSessions.find((chat) => chat.id === selectedChatId)?.sessionId ||
        ""
      : "";

    const messageType =
      activeView === "smartAi" || isSmartAI ? "smart Ai" : "chat";

    // 🧠 choose correct state setter
    const setMessagesFn =
      messageType === "smart Ai" ? setSmartAIMessageGroups : setMessageGroups;

    setMessagesFn((prev) => {
      const updated = [...prev];
      const messages = updated[0] || [];

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
        // botName: selectedBot,
        botName: messageType === "smart Ai" ? "Smart AI" : selectedBot,
        files: selectedFiles.map((f) => ({ name: f.name })),
      };

      if (editedId) {
        const index = messages.findIndex((m) => m.id === editedId);
        if (index !== -1)
          updated[0] = [
            ...messages.slice(0, index + 1),
            newMessage,
            ...messages.slice(index + 1),
          ];
        else updated[0] = [...messages, newMessage];
      } else {
        updated[0] = [...messages, newMessage];
      }

      return updated;
    });

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("email", user.email);
      // formData.append("botName", selectedBot);
      if (!isSmartAI && activeView !== "smartAi")
        formData.append("botName", selectedBot);
      // formData.append("responseLength", responseLength || "Short");
      // ✅ Always use last selected option unless user changes it
      formData.append(
        "responseLength",
        lastSelectedResponseLength.current || "Short"
      );
      formData.append("sessionId", currentSessionId);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const result = await fetchChatbotResponseWithFiles(
        formData,
        currentSessionId,
        messageType === "smart Ai" || isSmartAI
      );

      if (!result || isStoppedRef.current) return;

      const responseText = result.response || "";

      // ✅ Typing animation effect starts here
      if (!result.isError) {
        const lines = responseText.split("\n");
        let allText = "";

        const LINES_PER_BATCH = 35; // 👉 number of lines to type together

        for (let l = 0; l < lines.length; l += LINES_PER_BATCH) {
          // if (isStoppedRef.current) break;
          if (isStoppedRef.current) {
            // ⛔ Stop pressed → save partial response
            try {
              await fetch(`${apiBaseUrl}/api/ai/save_partial`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  sessionId: selectedChatId || currentSessionId,
                  prompt,
                  partialResponse: allText + lineText,
                  // botName: selectedBot,
                  botName:
                    messageType === "smart Ai" ? "smart Ai" : selectedBot,
                }),
              });
            } catch (err) {
              console.error("Failed to save partial response:", err);
            }
            break;
          }

          const batch = lines.slice(l, l + LINES_PER_BATCH).join("\n");

          let lineText = "";
          const chars = batch.split("");

          for (let i = 0; i < chars.length; i += 50) {
            if (isStoppedRef.current) break;

            lineText += chars.slice(i, i + 50).join("");

            setMessagesFn((prev) => {
              const updated = [...prev];
              const messages = updated[0] || [];
              const index = messages.findIndex((m) => m.id === messageId);
              if (index !== -1) {
                messages[index] = {
                  ...messages[index],
                  responses: [allText + lineText],
                  isTyping: !isStoppedRef.current,
                  isComplete: false,
                  tokensUsed: result.tokensUsed || 0,
                  // botName: result.botName || selectedBot,
                  botName:
                    messageType === "smart Ai"
                      ? "Smart AI"
                      : result.botName || selectedBot,
                };
                updated[0] = messages;
              }
              return updated;
            });

            await new Promise((resolve) => setTimeout(resolve, 20)); // typing speed
          }

          if (isStoppedRef.current) break;

          allText += lineText + "\n";
          await new Promise((resolve) => setTimeout(resolve, 0)); // small pause between batches
        }

        // ✅ Mark complete after typing done
        // ✅ After typing completes (not stopped)
        if (!isStoppedRef.current) {
          setMessagesFn((prev) => {
            const updated = [...prev];
            const messages = updated[0] || [];
            const index = messages.findIndex((m) => m.id === messageId);
            if (index !== -1) {
              messages[index] = {
                ...messages[index],
                isTyping: false,
                isComplete: true,
                responses: [allText.trim()],
                tokensUsed: result.tokensUsed || 0,
                // botName: result.botName || selectedBot,
                botName:
                  messageType === "smart Ai"
                    ? "Smart AI"
                    : result.botName || selectedBot,
              };
              updated[0] = messages;
            }
            return updated;
          });
        }
      }
      // ✅ Typing animation ends

      // ✅ Always update latest state working code
      // setMessageGroups((prev) => {
      //   const updated = [...prev];
      //   const messages = updated[0] || [];
      //   const index = messages.findIndex((m) => m.id === messageId);

      //   if (index !== -1) {
      //     messages[index] = {
      //       ...messages[index],
      //       responses: [responseText],
      //       isTyping: false,
      //       isComplete: true,
      //       tokensUsed: result.tokensUsed || 0,
      //       botName: result.botName || selectedBot,
      //     };
      //     updated[0] = messages;
      //   }
      //   return updated;
      // });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
      setIsTypingResponse(false);
      scrollToBottom();
      // setResponseLength(" ");

      // ✅ Only refresh sessions if user did NOT stop typing (full response)
      // if (!isStoppedRef.current) {
      //   fetchChatSessions();
      // }

      // ✅ Only call userTokenStats + get_user_session if NOT stopped
      if (!isStoppedRef.current) {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const email = user?.email;
          if (email) {
            // 👉 userTokenStats
            const statsRes = await fetch(`${apiBaseUrl}/userTokenStats`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            if (statsRes.ok) {
              const stats = await statsRes.json();
              if (typeof stats.totalTokensUsed === "number")
                setTotalTokensUsed(stats.totalTokensUsed);
              if (typeof stats.remainingTokens === "number") {
                setSessionRemainingTokens(stats.remainingTokens);
                localStorage.setItem(
                  "globalRemainingTokens",
                  stats.remainingTokens
                );
              }
            }

            // 👉 get_user_session
            // await fetchChatSessions();

            // ✅ Refresh sessions based on current type
            if (activeView === "smartAi" || isSmartAI) {
              await fetchSmartAISessions(); // 🧠 Smart AI tab
            } else {
              await fetchChatSessions(); // 💬 Chat tab
            }
          }
        } catch (err) {
          console.warn("⚠️ Failed to refresh stats after chat:", err.message);
        }
      }
    }
  };

  const createNewChat = () => {
    const newSessionId = generateSessionId(); // Generate a proper session ID
    const newChat = {
      // id: `temp_${Date.now()}`, // temporary ID for UI
      id: newSessionId,
      name:
        activeView === "smartAi" || isSmartAI
          ? `Smart AI ${smartAISessions?.length + 1 || 1}`
          : `Chat ${chats.length + 1}`,
      // sessionId: "", // blank session ID
      sessionId: newSessionId,
      createTime: new Date().toISOString(),
    };

    if (activeView === "smartAi" || isSmartAI) {
      // 🧠 Smart AI Chat
      setSmartAISessions((prev) => [newChat, ...prev]); // Add to Smart AI session list
      setSkipHistoryLoad(true);
      setSelectedChatId(newChat.id);
      localStorage.setItem("lastSmartAISessionId", newChat.id);
      setSmartAIMessageGroups([[]]); // Reset Smart AI message history
    } else {
      // 💬 Normal Chat
      setChats((prev) => [newChat, ...prev]); // Add to chat list
      setSkipHistoryLoad(true);
      setSelectedChatId(newChat.id);
      localStorage.setItem("lastChatSessionId", newChat.id);
      setMessageGroups([[]]); // Reset normal chat messages
    }

    // setChats((prev) => [newChat, ...prev]);
    // setSkipHistoryLoad(true); // prevent history load
    // setSelectedChatId(newChat.id);
    // localStorage.setItem("lastChatSessionId", newChat.id);
    // setMessageGroups([[]]); // reset messages
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

  const filteredChats = (
    activeView === "smartAi" || isSmartAI ? smartAISessions : chats
  ).filter((chat) =>
    chat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        // display: "flex",
        height: "100vh",
        // position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
        // width: "100vw", // 🔹 Add this line
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          ml: 0,
          px: 2,
          flexShrink: 0,
          bgcolor: "#1268fb",
          zIndex: 100,
          position: "sticky",
          top: 0,
          height: "102px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* logo */}
        <img src={Words2} height={85} width={146} />

        <FormControl
          fullWidth
          size="small"
          gap={1}
          sx={{
            ml: "58px",
            display: "flex",
            flexDirection: "row",
            gap: 2.5,
            mt: 0,
          }}
        >
          {(activeView === "chat" || activeView === "smartAi") && (
            <Autocomplete
              value={
                filteredChats.find((chat) => chat.id === selectedChatId) || null
              }
              onChange={(event, newValue) => {
                if (newValue && newValue.id) {
                  setSelectedChatId(newValue.id);
                  localStorage.setItem("lastChatSessionId", newValue.id);
                  loadChatHistory(newValue.sessionId);
                }
              }}
              getOptionLabel={(option) => option.name || ""}
              options={filteredChats || []}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={sessionLoading}
              PopperComponent={StyledPopper}
              noOptionsText={
                sessionLoading ? (
                  <Box sx={{ p: 2 }}>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} sx={{ width: "100%", mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  "No session found"
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select chat session"
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "5px",
                    mt: "0px",
                    width: "157px",
                    maxWidth: "190px",
                    "& .MuiOutlinedInput-input": { fontSize: "17px" },
                    "& .MuiOutlinedInput-root": {
                      height: "30px", // ↓ smaller overall height
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "17px",
                        fontFamily: "Calibri, sans-serif",
                      }}
                    >
                      {option.name.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                      {formatChatTime(new Date(option.createTime))}
                    </Typography>
                  </Box>
                </li>
              )}
              sx={{
                "& .MuiAutocomplete-option": {
                  borderRadius: 1.5,
                  my: 0.5,
                },
              }}
            />
          )}

          {activeView === "chat" && (
            <Select
              labelId="bot-select-label"
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              sx={{
                bgcolor: "#fff",
                borderRadius: "5px",
                mt: "0px",
                height: "30px",
                width: "157px",
                maxWidth: "190px",
              }}
            >
              <MenuItem value="chatgpt-5-mini">ChatGPT 5-Mini</MenuItem>
              <MenuItem value="grok">Grok 3-Mini</MenuItem>
              <MenuItem value="claude-3-haiku">Claude-3</MenuItem>
            </Select>
          )}

          {/* AI Grok history */}
          {activeView === "search2" && (
            <Select
              value={grokcustomValue}
              onChange={async (e) => {
                const selected = e.target.value;
                setGrokCustomValue(selected);
                setSelectedGrokQuery(selected);
                await handleSearch(selected);
                // setTimeout(() => setCustomValue(""), 500);
              }}
              displayEmpty
              IconComponent={() => null} // removes arrow
              sx={{
                bgcolor: "#fff",
                borderRadius: "5px",
                maxWidth: "200px",
                width: "180px",
                height: "34px",
                mt: 0,
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
              ) : grokhistoryList.length > 0 ? (
                grokhistoryList.map((query, idx) => (
                  <MenuItem
                    key={idx}
                    value={query}
                    sx={{
                      fontSize: "17px",
                      fontFamily: "Calibri, sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    {query}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No history found</MenuItem>
              )}
            </Select>
          )}

          {(activeView === "chat" || activeView === "smartAi") && (
            <Button
              variant="contained"
              size="small"
              sx={{
                ml: 1,
                bgcolor: "#1976d2",
                textTransform: "none",
                borderRadius: "8px",
              }}
              onClick={() => {
                setActiveView("smartAi");
                setIsSmartAI(false);
              }}
              // onClick={() => setIsSmartAI(!isSmartAI)}
            >
              {/* {isSmartAI ? "Smart AI (On)" : "Smart AI"} */}
              Smart AI
            </Button>
          )}
          {(activeView === "chat" || activeView === "smartAi") && (
            <Box onClick={createNewChat}>
              <AddIcon sx={{ alignItems: "center", mt: 0.3 }} />
            </Box>
          )}
        </FormControl>

        {/* add new */}

        {/* tab */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mr: "36px",
            gap: 3.5,
            mt: 0,
          }}
        >
          <Box
            sx={{
              gap: 1,
              cursor: "pointer",
              position: "relative", // needed for underline positioning
              pb: "0px",
            }}
            onClick={() => {
              setActiveView("chat");
              setIsSmartAI(false);
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontSize: "17px",
                fontWeight: activeView === "chat" ? 600 : 400,
                color: activeView === "chat" ? "#fff" : "inherit",
                transition: "color 0.3s ease",
              }}
            >
              Chat
            </Typography>

            {activeView === "chat" && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "3px",
                  backgroundColor: "#fff",
                  borderRadius: "2px",
                  transition: "all 0.3s ease",
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              gap: 1,
              cursor: "pointer",
              position: "relative",
              pb: "0px",
            }}
            onClick={() => setActiveView("search2")}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontSize: "17px",
                fontWeight: activeView === "search2" ? 600 : 400,
                color: activeView === "search2" ? "#fff" : "inherit",
                transition: "color 0.3s ease",
              }}
            >
              Browsing
            </Typography>

            {activeView === "search2" && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "3px",
                  backgroundColor: "#fff",
                  // backgroundColor: "#2F67F6",
                  borderRadius: "2px",
                  transition: "all 0.3s ease",
                }}
              />
            )}
          </Box>
        </Box>

        {/* Username + Icon (click to open menu) */}
        <Box
          sx={{
            display: "flex",
            // alignItems: "center",
            alignItems: "flex-end",
            gap: 1,
            mr: "38px",
            cursor: "pointer",
            mt: 0,
          }}
          onClick={(event) => setAnchorsEl(event.currentTarget)}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: "17px", color: "#fff" }}
          >
            {(username || email)?.charAt(0).toUpperCase() +
              (username || email)?.slice(1)}
          </Typography>

          <PersonIcon sx={{ fontSize: 29, color: "#fff" }} />
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorsEl}
          open={Boolean(anchorsEl)}
          onClose={handleCloseMenu}
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
              width: 200,
              height: 90,
              borderRadius: 2,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setOpenProfile(true); // Profile modal open
            }}
          >
            <PersonRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Profile
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseMenu();
              localStorage.clear();
              window.location.href = "/login"; // redirect to login
            }}
          >
            <LogoutTwoToneIcon fontSize="small" sx={{ mr: 1, color: "red" }} />
            Logout
          </MenuItem>
        </Menu>

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
          alignItems: "center",
          transition: "all 0.3s ease",
          px: { xs: 2, sm: 3, md: 2 },
          mb: 0,
          pb: 0,
        }}
      >
        {activeView === "chat" ? (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                width: "100%",
                maxWidth: { xs: "100%", sm: "100%", md: "100%" },
                px: { xs: 1, sm: 2, md: 11 },
                mb: 0,
                mt: "11px",
                pb: 0,
              }}
            >
              {/* 👉 Main Content (Conditional) */}
              <Box
                sx={{
                  height: "70vh",
                  // p: 2,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  overflow: "auto",
                  p: { xs: 1, sm: 1, md: 2 }, // 🔹 Reduced padding
                  minHeight: 0, // 🔹 Important for flex scrolling
                  /* 🔹 Scrollbar hide */
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none", // 🔹 Firefox
                  "-ms-overflow-style": "none", // 🔹 IE 10+
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
                    sx={{
                      textAlign: "center",
                      py: 8,
                      color: "text.secondary",
                    }}
                  >
                    {/* <leafatar
                      sx={{
                        width: 64,
                        height: 64,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "#3dafe2",
                        color: "#fff",
                      }}
                    > */}
                    {/* <Logo /> */}
                    {/* </leafatar> */}

                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Welcome to the <strong>Wrds</strong>
                    </Typography>

                    {/* <Typography variant="body2">
                      Start a conversation by typing a message below.
                    </Typography> */}
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
                              sx={{
                                fontSize: "18px",
                                fontFamily: "Calibri, sans-serif",
                                fontWeight: 400, // Regular weight
                              }}
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
                              p: { xs: 1, sm: 1.5 },
                              bgcolor: "#2F67F6",
                              color: "#fff",
                              borderRadius: 3,
                              minWidth: "300px",
                              maxWidth: { xs: "95%", sm: "90%", md: "80%" },
                            }}
                          >
                            {editingId === group.id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <TextField
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  multiline
                                  minRows={2}
                                  fullWidth
                                  autoFocus
                                  variant="outlined"
                                  sx={{
                                    bgcolor: "#fff",
                                    borderRadius: 1,
                                    "& .MuiInputBase-input": { color: "#000" },
                                  }}
                                />

                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditText("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                      handleSend(editText, group.id);
                                      setEditingId(null);
                                      setEditText("");
                                    }}
                                  >
                                    Save
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <>
                                <Typography
                                  sx={{
                                    fontSize: "17px",
                                    fontFamily: "Calibri, sans-serif",
                                    fontWeight: 400,
                                  }}
                                >
                                  {group.prompt.charAt(0).toUpperCase() +
                                    group.prompt.slice(1)}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography variant="caption">
                                    {group.time}
                                  </Typography>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Tooltip
                                      title={
                                        copiedId === group.id
                                          ? "Copied!"
                                          : "Copy"
                                      }
                                      arrow
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color:
                                            copiedId === group.id
                                              ? "#8cff8c"
                                              : "#fff",
                                          p: "2px",
                                        }}
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            group.prompt
                                          );
                                          setCopiedId(group.id);
                                          setTimeout(
                                            () => setCopiedId(null),
                                            1500
                                          );
                                        }}
                                      >
                                        <ContentCopyIcon fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Edit" arrow>
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#fff", p: "2px" }}
                                        onClick={() => {
                                          setEditingId(group.id);
                                          setEditText(group.prompt);
                                        }}
                                      >
                                        <EditIcon fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </>
                            )}
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
                            {/* <Logo /> */}
                            <Avatar
                              src={chat}
                              alt="chat"
                              sx={{
                                // border: "2px solid #4d4646ff", // lighter black (#aaa / #bbb / grey[500])
                                bgcolor: "white",
                                width: 40, // thodu mota rakho
                                height: 40,
                                p: "2px", // andar jagya
                                cursor: "pointer",
                                // pl: "1px",
                              }}
                              // onClick={() => setIsCollapsed(false)}
                            />
                            {console.log(
                              group.botName,
                              group.botName.charAt(0).toUpperCase() ===
                                "chatgpt-5-mini"
                                ? "ChatGPT 5-Mini"
                                : group.botName.charAt(0).toUpperCase() +
                                    group.botName.slice(1) ===
                                  "grok"
                                ? "Grok 3-Mini"
                                : "",
                              "group"
                            )}
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

                                {/* {group.botName === "chatgpt-5-mini"
                                  ? "ChatGPT 5-Mini"
                                  : group.botName === "grok"
                                  ? "Grok 3-Mini"
                                  : group.botName === "claude-3-haiku"
                                  ? "Claude-3"
                                  : ""} */}

                                {isSmartAI
                                  ? "Smart AI"
                                  : group.botName === "chatgpt-5-mini"
                                  ? "ChatGPT 5-Mini"
                                  : group.botName === "grok"
                                  ? "Grok 3-Mini"
                                  : group.botName === "claude-3-haiku"
                                  ? "Claude-3"
                                  : ""}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Wrds
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
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontFamily: "Calibri, sans-serif",
                                      fontWeight: 400,
                                    }}
                                  >
                                    {group.responses[group.currentSlide]}
                                  </Typography>
                                </Box>
                              ) : (
                                <div
                                  style={{
                                    fontSize: "17px",
                                    fontFamily: "Calibri, sans-serif",
                                    fontWeight: 400, // Regular weight
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: group.responses[group.currentSlide],
                                  }}
                                />
                              )}
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                              }}
                            >
                              <Box>
                                {/* Time on left */}
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.6, mb: 0.5 }}
                                >
                                  {group.time}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                }}
                              >
                                {/* 🛑 Stop button beside token dropdown */}
                                {/* {group.isBeingProcessed && ( */}
                                {/* <IconButton
                                    size="small"
                                    onClick={stopGeneration}
                                    sx={{
                                      color: "#665c5cff",
                                      p: 0.3,
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      "&:hover": {
                                        bgcolor: "rgba(229, 57, 53, 0.1)",
                                      },
                                    }}
                                  >
                                    <StopIcon fontSize="small" />
                                  </IconButton> */}
                                {/* )} */}

                                {/* Icon on right */}
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleClick(e, idx)}
                                >
                                  <KeyboardArrowDownTwoToneIcon fontSize="small" />
                                </IconButton>

                                {/* Popover for usage token */}
                                <Popover
                                  open={
                                    Boolean(anchorEl) && activeGroup === idx
                                  }
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
                  mb: 0,
                  pb: "16px",
                  display: "flex",
                  p: { xs: 1, sm: 1, md: 2 }, // 🔹 Reduced padding
                  width: "100%",
                  // maxWidth: { xs: "100%", md: "940px" },
                  // maxWidth: { xs: "100%", sm: "95%", md: "1080px" },
                  flexDirection: "column",
                }}
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
                    // pb: 0.5,
                    pb: "20px",
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
                      bottom: "34px", // 👈 bottom ma fix karva
                      zIndex: 2,
                      // backgroundColor: "white",
                      borderRadius: "50%",
                      width: "32px",
                      height: "40px",
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
                        minHeight: "67px",
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

                      endAdornment: (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {/* 🎤 Voice Input Button */}
                          <IconButton
                            onClick={
                              isListening ? stopListening : startListening
                            }
                            sx={{
                              color: isListening ? "red" : "#10a37f",
                              mr: 0.5,
                            }}
                            title={
                              isListening
                                ? "Stop recording"
                                : "Start voice input"
                            }
                          >
                            {isListening ? (
                              <StopCircleIcon />
                            ) : (
                              <KeyboardVoiceIcon />
                            )}
                          </IconButton>

                          {/* 🛑 Stop Generating Button (for chatbot response) */}
                          {(isTypingResponse || isSending) && (
                            <Tooltip title="Stop generating">
                              <IconButton
                                onClick={() => {
                                  isStoppedRef.current = true;
                                  handleStopResponse();
                                }}
                                color="error"
                                sx={{ mr: 0.5 }}
                              >
                                <StopCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      ),

                      // endAdornment: (
                      //   <IconButton
                      //     onClick={isListening ? stopListening : startListening}
                      //     sx={{
                      //       color: isListening ? "red" : "#10a37f",
                      //       mr: 1,
                      //     }}
                      //     title={
                      //       isListening ? "Stop recording" : "Start voice input"
                      //     }
                      //   >
                      //     {isListening ? <StopCircleIcon /> : <KeyboardVoiceIcon />}
                      //   </IconButton>
                      // ),
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
                      onChange={(e) => {
                        setResponseLength(e.target.value);
                        lastSelectedResponseLength.current = e.target.value; // ✅ store last selected
                      }}
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

                    {/* 🔹 Stop icon appears when AI is typing a response */}
                    {/* {isTypingResponse && (
                        <IconButton
                          onClick={() => handleStop()}
                          color="error"
                          title="Stop Response"
                          sx={{
                            ml: 1,
                            bgcolor: "#ffe6e6",
                            "&:hover": { bgcolor: "#ffcccc" },
                          }}
                        >
                          <StopIcon />
                        </IconButton>
                      )} */}
                  </Box>
                </Box>

                {/* 👉 Tagline (Always Common) */}
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "14px" }}
                  >
                    How <strong>Wrds</strong> can help you today?
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : activeView === "smartAi" ? (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                width: "100%",
                maxWidth: { xs: "100%", sm: "100%", md: "100%" },
                px: { xs: 1, sm: 2, md: 11 },
                mb: 0,
                mt: "11px",
                pb: 0,
              }}
            >
              {/* 👉 Main Content (Conditional) */}
              <Box
                sx={{
                  height: "70vh",
                  // p: 2,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  overflow: "auto",
                  p: { xs: 1, sm: 1, md: 2 }, // 🔹 Reduced padding
                  minHeight: 0, // 🔹 Important for flex scrolling
                  /* 🔹 Scrollbar hide */
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none", // 🔹 Firefox
                  "-ms-overflow-style": "none", // 🔹 IE 10+
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
                ) : smartAIMessageGroups[0]?.length === 0 ? (
                  // Welcome Screen
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      color: "text.secondary",
                    }}
                  >
                    {/* <leafatar
                      sx={{
                        width: 64,
                        height: 64,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "#3dafe2",
                        color: "#fff",
                      }}
                    > */}
                    {/* <Logo /> */}
                    {/* </leafatar> */}

                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Welcome to the <strong>Wrds</strong>
                    </Typography>

                    {/* <Typography variant="body2">
                      Start a conversation by typing a message below.
                    </Typography> */}
                  </Box>
                ) : (
                  // Chat Messages
                  <Box sx={{ spaceY: 6, width: "100%", minWidth: 0 }}>
                    {(smartAIMessageGroups[0] || []).map((group, idx) => (
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
                              sx={{
                                fontSize: "18px",
                                fontFamily: "Calibri, sans-serif",
                                fontWeight: 400, // Regular weight
                              }}
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
                              p: { xs: 1, sm: 1.5 },
                              bgcolor: "#2F67F6",
                              color: "#fff",
                              borderRadius: 3,
                              minWidth: "300px",
                              maxWidth: { xs: "95%", sm: "90%", md: "80%" },
                            }}
                          >
                            {editingId === group.id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <TextField
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  multiline
                                  minRows={2}
                                  fullWidth
                                  autoFocus
                                  variant="outlined"
                                  sx={{
                                    bgcolor: "#fff",
                                    borderRadius: 1,
                                    "& .MuiInputBase-input": { color: "#000" },
                                  }}
                                />

                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditText("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                      handleSend(editText, group.id);
                                      setEditingId(null);
                                      setEditText("");
                                    }}
                                  >
                                    Save
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <>
                                <Typography
                                  sx={{
                                    fontSize: "17px",
                                    fontFamily: "Calibri, sans-serif",
                                    fontWeight: 400,
                                  }}
                                >
                                  {group.prompt.charAt(0).toUpperCase() +
                                    group.prompt.slice(1)}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography variant="caption">
                                    {group.time}
                                  </Typography>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Tooltip
                                      title={
                                        copiedId === group.id
                                          ? "Copied!"
                                          : "Copy"
                                      }
                                      arrow
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color:
                                            copiedId === group.id
                                              ? "#8cff8c"
                                              : "#fff",
                                          p: "2px",
                                        }}
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            group.prompt
                                          );
                                          setCopiedId(group.id);
                                          setTimeout(
                                            () => setCopiedId(null),
                                            1500
                                          );
                                        }}
                                      >
                                        <ContentCopyIcon fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Edit" arrow>
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#fff", p: "2px" }}
                                        onClick={() => {
                                          setEditingId(group.id);
                                          setEditText(group.prompt);
                                        }}
                                      >
                                        <EditIcon fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </>
                            )}
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
                            {/* <Logo /> */}
                            <Avatar
                              src={chat}
                              alt="chat"
                              sx={{
                                // border: "2px solid #4d4646ff", // lighter black (#aaa / #bbb / grey[500])
                                bgcolor: "white",
                                width: 40, // thodu mota rakho
                                height: 40,
                                p: "2px", // andar jagya
                                cursor: "pointer",
                                // pl: "1px",
                              }}
                              // onClick={() => setIsCollapsed(false)}
                            />
                            {console.log(
                              group.botName,
                              group.botName.charAt(0).toUpperCase() ===
                                "chatgpt-5-mini"
                                ? "ChatGPT 5-Mini"
                                : group.botName.charAt(0).toUpperCase() +
                                    group.botName.slice(1) ===
                                  "grok"
                                ? "Grok 3-Mini"
                                : "",
                              "group"
                            )}
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
                                {/* {group.botName === "chatgpt-5-mini"
                                  ? "ChatGPT 5-Mini"
                                  : group.botName === "grok"
                                  ? "Grok 3-Mini"
                                  : group.botName === "claude-3-haiku"
                                  ? "Claude-3"
                                  : ""} */}
                                Smart AI
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Wrds
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
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontFamily: "Calibri, sans-serif",
                                      fontWeight: 400,
                                    }}
                                  >
                                    {group.responses[group.currentSlide]}
                                  </Typography>
                                </Box>
                              ) : (
                                <div
                                  style={{
                                    fontSize: "17px",
                                    fontFamily: "Calibri, sans-serif",
                                    fontWeight: 400, // Regular weight
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: group.responses[group.currentSlide],
                                  }}
                                />
                              )}
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                              }}
                            >
                              <Box>
                                {/* Time on left */}
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.6, mb: 0.5 }}
                                >
                                  {group.time}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                }}
                              >
                                {/* 🛑 Stop button beside token dropdown */}
                                {/* {group.isBeingProcessed && ( */}
                                {/* <IconButton
                                    size="small"
                                    onClick={stopGeneration}
                                    sx={{
                                      color: "#665c5cff",
                                      p: 0.3,
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      "&:hover": {
                                        bgcolor: "rgba(229, 57, 53, 0.1)",
                                      },
                                    }}
                                  >
                                    <StopIcon fontSize="small" />
                                  </IconButton> */}
                                {/* )} */}

                                {/* Icon on right */}
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleClick(e, idx)}
                                >
                                  <KeyboardArrowDownTwoToneIcon fontSize="small" />
                                </IconButton>

                                {/* Popover for usage token */}
                                <Popover
                                  open={
                                    Boolean(anchorEl) && activeGroup === idx
                                  }
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
                  mb: 0,
                  pb: "16px",
                  display: "flex",
                  p: { xs: 1, sm: 1, md: 2 }, // 🔹 Reduced padding
                  width: "100%",
                  // maxWidth: { xs: "100%", md: "940px" },
                  // maxWidth: { xs: "100%", sm: "95%", md: "1080px" },
                  flexDirection: "column",
                }}
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
                    // pb: 0.5,
                    pb: "20px",
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
                      bottom: "34px", // 👈 bottom ma fix karva
                      zIndex: 2,
                      // backgroundColor: "white",
                      borderRadius: "50%",
                      width: "32px",
                      height: "40px",
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
                        minHeight: "67px",
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

                      endAdornment: (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {/* 🎤 Voice Input Button */}
                          <IconButton
                            onClick={
                              isListening ? stopListening : startListening
                            }
                            sx={{
                              color: isListening ? "red" : "#10a37f",
                              mr: 0.5,
                            }}
                            title={
                              isListening
                                ? "Stop recording"
                                : "Start voice input"
                            }
                          >
                            {isListening ? (
                              <StopCircleIcon />
                            ) : (
                              <KeyboardVoiceIcon />
                            )}
                          </IconButton>

                          {/* 🛑 Stop Generating Button (for chatbot response) */}
                          {(isTypingResponse || isSending) && (
                            <Tooltip title="Stop generating">
                              <IconButton
                                onClick={() => {
                                  isStoppedRef.current = true;
                                  handleStopResponse();
                                }}
                                color="error"
                                sx={{ mr: 0.5 }}
                              >
                                <StopCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      ),

                      // endAdornment: (
                      //   <IconButton
                      //     onClick={isListening ? stopListening : startListening}
                      //     sx={{
                      //       color: isListening ? "red" : "#10a37f",
                      //       mr: 1,
                      //     }}
                      //     title={
                      //       isListening ? "Stop recording" : "Start voice input"
                      //     }
                      //   >
                      //     {isListening ? <StopCircleIcon /> : <KeyboardVoiceIcon />}
                      //   </IconButton>
                      // ),
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
                      onChange={(e) => {
                        setResponseLength(e.target.value);
                        lastSelectedResponseLength.current = e.target.value; // ✅ store last selected
                      }}
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

                    {/* 🔹 Stop icon appears when AI is typing a response */}
                    {/* {isTypingResponse && (
                        <IconButton
                          onClick={() => handleStop()}
                          color="error"
                          title="Stop Response"
                          sx={{
                            ml: 1,
                            bgcolor: "#ffe6e6",
                            "&:hover": { bgcolor: "#ffcccc" },
                          }}
                        >
                          <StopIcon />
                        </IconButton>
                      )} */}
                  </Box>
                </Box>

                {/* 👉 Tagline (Always Common) */}
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "14px" }}
                  >
                    How <strong>Wrds</strong> can help you today?
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : activeView === "search2" ? (
          <GrokSearchUI
            setGrokHistoryList={setGrokHistoryList}
            selectedGrokQuery={selectedGrokQuery}
            setSessionRemainingTokens={setSessionRemainingTokens}
          />
        ) : null}
      </Box>
      {/* </Box> */}

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
              sx={{
                display: "block",
                fontWeight: "medium",
                fontSize: "17px",
              }}
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
              sx={{
                display: "block",
                fontWeight: "medium",
                fontSize: "17px",
              }}
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
              sx={{
                display: "block",
                fontWeight: "medium",
                fontSize: "17px",
              }}
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
              sx={{
                display: "block",
                fontWeight: "medium",
                fontSize: "17px",
              }}
            >
              Remaining Tokens:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {sessionRemainingTokens}
            </Typography>
          </Box>

          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontWeight: "medium",
                fontSize: "17px",
              }}
            >
              Remaining Searches:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {Math.max(50 - (totalSearches || 0), 0)}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatUI;
