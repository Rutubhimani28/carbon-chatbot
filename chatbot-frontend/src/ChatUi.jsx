// -------------------------------------------------------------------------------------------------------------------

// import { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Avatar,
//   InputAdornment,
//   List,
//   ListItemText,
//   Divider,
//   Button,
//   Paper,
//   ListItemButton,
//   CircularProgress,
//   Skeleton,
//   MenuItem,
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import AddIcon from "@mui/icons-material/Add";
// import SendIcon from "@mui/icons-material/Send";
// import AutorenewIcon from "@mui/icons-material/Autorenew";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import CloseIcon from "@mui/icons-material/Close";
// import logo from "./assets/logo.png";
// import { Search } from "@mui/icons-material";
// import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
// import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
// import StopOutlinedIcon from "@mui/icons-material/StopOutlined";

// export default function ChatUI() {
//   const [input, setInput] = useState("");
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [selectedChatId, setSelectedChatId] = useState("");
//   const [sessionLoading, setSessionLoading] = useState(false);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [messageGroups, setMessageGroups] = useState([]);
//   const [isSending, setIsSending] = useState(false);
//   const [isTypingResponse, setIsTypingResponse] = useState(false);
//   const [isRegeneratingResponse, setIsRegeneratingResponse] = useState(false);
//   const [isRegenerating, setIsRegenerating] = useState(false);
//   const messagesEndRef = useRef(null);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const abortControllerRef = useRef(null);
//   const [isStopped, setIsStopped] = useState(false);
//   const isStoppedRef = useRef(false);
//   const [maxWords, setMaxWords] = useState(10);

//   useEffect(() => {
//     const lastSessionId = localStorage.getItem("lastChatSessionId");
//     if (lastSessionId && chats.length > 0) {
//       const lastSession = chats.find((chat) => chat.id === lastSessionId);
//       if (lastSession) {
//         setSelectedChatId(lastSessionId);
//         loadChatHistory(lastSession.sessionId);
//       }
//     }
//     setInitialLoad(false);
//   }, [chats]);

//   useEffect(() => {
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   const scrollToBottom = useCallback(() => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   }, []);

//   const currentTime = () =>
//     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   // Fetch chat history sessions - UPDATED API ENDPOINT
//   const fetchChatSessions = async () => {
//     setSessionLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:8080/api/ai/get_user_sessions",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: "chiraaag.korat@gmail.com" }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       // Adjust this based on the actual response structure from your new API
//       if (data.response && data.response.length > 0) {
//         const sessions = data.response.map((session) => ({
//           id: session.session_id,
//           name:
//             session.session_heading || `Chat ${session.session_id.slice(0, 8)}`,
//           sessionId: session.session_id,
//           createTime: session.create_time || new Date().toISOString(),
//         }));

//         setChats(sessions);

//         if (initialLoad) {
//           const lastSessionId = localStorage.getItem("lastChatSessionId");
//           if (lastSessionId && sessions.some((s) => s.id === lastSessionId)) {
//             setSelectedChatId(lastSessionId);
//             loadChatHistory(lastSessionId);
//           }
//         }
//       }
//       return [];
//     } catch (error) {
//       console.error("API Error:", error);
//       return [];
//     } finally {
//       setSessionLoading(false);
//     }
//   };

//   const getChatHistory = async (sessionId) => {
//     try {
//       const response = await fetch("http://localhost:8080/api/ai/history", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sessionId }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       return data.response || [];
//     } catch (error) {
//       console.error("API Error:", error);
//       return [];
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChatSessions();
//   }, []);

//   useEffect(() => {
//     if (selectedChatId && chats.length > 0) {
//       const selectedChat = chats.find((chat) => chat.id === selectedChatId);
//       if (selectedChat) {
//         loadChatHistory(selectedChat.sessionId);
//       }
//     }
//   }, [selectedChatId, chats]);

//   const loadChatHistory = async (sessionId) => {
//     setHistoryLoading(true);
//     const rawHistory = await getChatHistory(sessionId);

//     // Process the API response to match our UI structure
//     const processedGroups = [];

//     for (let i = 0; i < rawHistory.length; i++) {
//       const message = rawHistory[i];

//       if (message.role === "user") {
//         // Find the next model response
//         const modelResponse =
//           rawHistory[i + 1]?.role === "model" ? rawHistory[i + 1] : null;

//         if (modelResponse) {
//           processedGroups.push({
//             prompt: message.content,
//             responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
//             time: currentTime(),
//             currentSlide: 0,
//             isTyping: false,
//             isComplete: true,
//           });
//           i++; // Skip the model response in the next iteration
//         }
//       }
//     }

//     setMessageGroups([processedGroups.reverse()]);
//     setTimeout(scrollToBottom, 100);
//     setHistoryLoading(false);
//   };

//   const fetchChatbotResponse = async (text, currentSessionId) => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     const controller = new AbortController();
//     abortControllerRef.current = controller;

//     const payload = {
//       email: "chirag_korat@gmail.com",
//       create_time: new Date().toISOString(),
//       prompt: text,
//       sessionId: currentSessionId,
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

//       // Update session ID if this was a new session
//       if (data.sessionId && currentSessionId === "") {
//         setChats((prev) => {
//           const updated = [...prev];
//           const newChat = {
//             id: data.sessionId,
//             name: `Chat ${updated.length + 1}`,
//             sessionId: data.sessionId,
//             createTime: new Date().toISOString(),
//           };
//           updated.unshift(newChat);
//           setSelectedChatId(newChat.id);
//           return updated;
//         });
//       }

//       return {
//         response: data.response.replace(/\n\n/g, "<br/>"),
//         sessionId: data.sessionId,
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

//   // ... rest of the code remains the same (stopGeneration, handleSend, regenerateMessage, etc.)

//   const stopGeneration = () => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       abortControllerRef.current = null;
//     }

//     isStoppedRef.current = true;
//     setIsStopped(true);
//     setIsSending(false);
//     setIsTypingResponse(false);
//     setIsRegeneratingResponse(false);
//     setIsRegenerating(false);

//     let partialChat = null;

//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       const lastGroupIndex = chatGroups.length - 1;

//       if (lastGroupIndex >= 0 && chatGroups[lastGroupIndex].isTyping) {
//         const lastGroup = chatGroups[lastGroupIndex];
//         const partialGroup = {
//           ...lastGroup,
//           isTyping: false,
//           isComplete: false,
//           isBeingProcessed: false,
//           isStopped: true,
//           responses: [...lastGroup.responses],
//         };

//         chatGroups[lastGroupIndex] = partialGroup;
//         partialChat = partialGroup;
//       }

//       return updated;
//     });

//     setTimeout(() => {
//       if (!partialChat) return;

//       const sessionId = selectedChatId
//         ? chats.find((chat) => chat.id === selectedChatId)?.sessionId
//         : "";

//       if (sessionId) {
//         const existing = JSON.parse(localStorage.getItem(sessionId) || "[]");
//         const existingIndex = existing.findIndex(
//           (g) => g.prompt === partialChat?.prompt
//         );

//         if (existingIndex !== -1) {
//           existing[existingIndex] = {
//             ...existing[existingIndex],
//             responses: [
//               ...existing[existingIndex].responses,
//               partialChat.responses[partialChat.responses.length - 1],
//             ],
//             isComplete: false,
//             isStopped: true,
//           };
//         } else {
//           existing.push(partialChat);
//         }

//         localStorage.setItem(sessionId, JSON.stringify(existing));
//       }
//     }, 100);
//   };

//   const handleSend = async () => {
//     if (!input.trim() || isSending) return;

//     isStoppedRef.current = false;
//     const prompt = input;
//     setInput("");
//     setIsSending(true);
//     setIsTypingResponse(true);
//     setIsRegeneratingResponse(true);
//     setIsStopped(false);
//     setShowSidebar(false);
//     const currentSessionId = selectedChatId
//       ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//       : "";

//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       chatGroups.push({
//         prompt,
//         responses: ["Thinking..."],
//         time: currentTime(),
//         currentSlide: 0,
//         isTyping: true,
//         isComplete: true,
//       });
//       return updated;
//     });

//     try {
//       const result = await fetchChatbotResponse(prompt, currentSessionId);
//       if (isStoppedRef.current || !result) return;

//       const chars = result.response.split("");
//       let currentText = "";

//       for (let i = 0; i < chars.length; i++) {
//         if (isStoppedRef.current) break;

//         currentText += chars[i];

//         setMessageGroups((prev) => {
//           const updated = [...prev];
//           const chatGroups = updated[0] || [];
//           const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
//           if (groupIndex !== -1) {
//             chatGroups[groupIndex] = {
//               ...chatGroups[groupIndex],
//               responses: [currentText],
//               isTyping: !isStoppedRef.current,
//               isComplete: !isStoppedRef.current,
//             };
//           }
//           return updated;
//         });

//         await new Promise((resolve) => setTimeout(resolve, 25));
//       }
//     } catch (error) {
//       console.error("Failed to send message:", error);
//       setMessageGroups((prev) => {
//         const updated = [...prev];
//         const chatGroups = updated[0] || [];
//         const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
//         if (groupIndex !== -1) {
//           chatGroups[groupIndex] = {
//             ...chatGroups[groupIndex],
//             isTyping: false,
//             isComplete: false,
//             responses: ["Sorry, something went wrong."],
//           };
//         }
//         return updated;
//       });
//     } finally {
//       setIsSending(false);
//       setIsTypingResponse(false);
//       setIsRegeneratingResponse(false);
//       scrollToBottom();
//     }
//   };

//   const regenerateMessage = async (group) => {
//     if (isTypingResponse || isRegeneratingResponse) return;

//     isStoppedRef.current = false;
//     setIsTypingResponse(true);
//     setIsRegeneratingResponse(true);
//     setIsRegenerating(true);
//     setIsStopped(false);
//     const currentSessionId = selectedChatId
//       ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//       : "";

//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       const index = chatGroups.findIndex((g) => g.prompt === group.prompt);
//       if (index !== -1) {
//         const newResponses = [...chatGroups[index].responses, "Thinking..."];
//         chatGroups[index] = {
//           ...chatGroups[index],
//           responses: newResponses,
//           currentSlide: newResponses.length - 1,
//           isTyping: true,
//           isComplete: false,
//           isBeingProcessed: true,
//         };
//       }
//       return updated;
//     });

//     try {
//       const result = await fetchChatbotResponse(group.prompt, currentSessionId);

//       if (isStoppedRef.current || !result) return;

//       const chars = result.response.split("");
//       let currentText = "";
//       let charIndex = 0;

//       const typeCharacter = () => {
//         if (isStoppedRef.current) {
//           if (currentSessionId) {
//             const existing = JSON.parse(
//               localStorage.getItem(currentSessionId) || "[]"
//             );
//             const existingIndex = existing.findIndex(
//               (g) => g.prompt === group.prompt
//             );

//             if (existingIndex !== -1) {
//               existing[existingIndex] = {
//                 ...existing[existingIndex],
//                 responses: [...existing[existingIndex].responses, currentText],
//                 isComplete: false,
//                 isStopped: true,
//                 isBeingProcessed: false,
//               };
//             } else {
//               existing.push({
//                 prompt: group.prompt,
//                 responses: [currentText],
//                 time: currentTime(),
//                 currentSlide: 0,
//                 isTyping: false,
//                 isComplete: false,
//                 isStopped: true,
//                 isBeingProcessed: false,
//               });
//             }
//             localStorage.setItem(currentSessionId, JSON.stringify(existing));
//           }
//           return;
//         }

//         currentText += chars[charIndex];
//         charIndex++;

//         setMessageGroups((prev) => {
//           const updated = [...prev];
//           const chatGroups = updated[0] || [];
//           const index = chatGroups.findIndex((g) => g.prompt === group.prompt);
//           if (index !== -1) {
//             const currentGroup = chatGroups[index];
//             const newResponses = [...currentGroup.responses];
//             newResponses[currentGroup.currentSlide] = currentText;
//             chatGroups[index] = {
//               ...currentGroup,
//               responses: newResponses,
//               isBeingProcessed: true,
//             };
//             return updated;
//           }
//         });

//         if (charIndex < chars.length) {
//           setTimeout(typeCharacter, 25);
//         } else {
//           if (currentSessionId) {
//             const existing = JSON.parse(
//               localStorage.getItem(currentSessionId) || "[]"
//             );
//             const existingIndex = existing.findIndex(
//               (g) => g.prompt === group.prompt
//             );

//             if (existingIndex !== -1) {
//               existing[existingIndex] = {
//                 ...existing[existingIndex],
//                 responses: [...existing[existingIndex].responses, currentText],
//                 isComplete: true,
//                 isBeingProcessed: true,
//               };
//             } else {
//               existing.push({
//                 prompt: group.prompt,
//                 responses: [currentText],
//                 time: currentTime(),
//                 currentSlide: 0,
//                 isTyping: false,
//                 isComplete: true,
//                 isBeingProcessed: false,
//               });
//             }
//             localStorage.setItem(currentSessionId, JSON.stringify(existing));
//           }

//           setIsTypingResponse(false);
//           setIsRegeneratingResponse(false);
//           setIsStopped(false);

//           setMessageGroups((prev) => {
//             const updated = [...prev];
//             const chatGroups = updated[0] || [];
//             const index = chatGroups.findIndex(
//               (g) => g.prompt === group.prompt
//             );
//             if (index !== -1) {
//               chatGroups[index] = {
//                 ...chatGroups[index],
//                 isBeingProcessed: false,
//               };
//             }
//             return updated;
//           });
//         }
//       };

//       typeCharacter();
//     } catch (error) {
//       console.error("Failed to regenerate message:", error);
//     } finally {
//       setIsSending(false);
//       setIsTypingResponse(false);
//       setIsRegeneratingResponse(false);
//       setIsRegenerating(false);

//       setMessageGroups((prev) => {
//         const updated = [...prev];
//         const chatGroups = updated[0] || [];
//         const lastGroupIndex = chatGroups.length - 1;
//         if (lastGroupIndex >= 0) {
//           chatGroups[lastGroupIndex] = {
//             ...chatGroups[lastGroupIndex],
//             isBeingProcessed: false,
//           };
//         }
//         return updated;
//       });
//     }
//   };

//   const createNewChat = () => {
//     setSelectedChatId("");
//     localStorage.removeItem("lastChatSessionId");
//     setMessageGroups([[]]);
//     setShowSidebar(false);
//   };

//   const navigateResponse = (groupIndex, direction) => {
//     if (messageGroups[0]?.[groupIndex]?.isTyping || isRegenerating) return;
//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       if (chatGroups[groupIndex]) {
//         const group = chatGroups[groupIndex];
//         const newSlide =
//           direction === "prev"
//             ? Math.max(0, group.currentSlide - 1)
//             : Math.min(group.responses.length - 1, group.currentSlide + 1);

//         chatGroups[groupIndex] = {
//           ...group,
//           currentSlide: newSlide,
//         };
//       }
//       updated[0] = chatGroups;
//       return updated;
//     });
//   };

//   function formatChatTime(date) {
//     const now = new Date();
//     const timeOptions = {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     };
//     const timeStr = date.toLocaleTimeString("en-US", timeOptions);

//     if (date.toDateString() === now.toDateString()) {
//       return `Today  ${timeStr}`;
//     }

//     const yesterday = new Date(now);
//     yesterday.setDate(yesterday.getDate() - 1);
//     if (date.toDateString() === yesterday.toDateString()) {
//       return `Yesterday  ${timeStr}`;
//     }

//     const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
//     if (diffInDays <= 7) {
//       const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
//       const dateStr = date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//       });
//       return `${dayName}, ${dateStr},  ${timeStr}`;
//     }

//     const fullDate = date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//     return `${fullDate},  ${timeStr}`;
//   }

//   const filteredChats = chats.filter((chat) =>
//     chat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
//       {showSidebar && (
//         <Box
//           sx={{
//             width: 280,
//             bgcolor: "#f5f5f5",
//             zIndex: 1,
//             height: "61.1vh",
//             overflowY: "auto",
//             position: "absolute",
//             boxShadow: { xs: 3, md: 0 },
//           }}
//         >
//           <Box
//             sx={{
//               p: 2,
//               position: "sticky",
//               top: 0,
//               pb: 2,
//               borderBottom: "1px solid #e0e0e0",
//               zIndex: 2,
//               backgroundColor: "#f5f5f5",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                 <Avatar src={logo} sx={{ mr: 1 }} />
//                 <Typography className="text-xl font-medium text-gray-900">
//                   Chatbot{" "}
//                 </Typography>
//               </Box>
//               <IconButton
//                 onClick={() => setShowSidebar(false)}
//                 sx={{
//                   color: "text.secondary",
//                   "&:hover": {
//                     backgroundColor: "rgba(0, 0, 0, 0.04)",
//                   },
//                 }}
//               >
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", pt: 2 }}>
//               <Button
//                 fullWidth
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={createNewChat}
//                 sx={{ flexGrow: 1 }}
//               >
//                 New Chat
//               </Button>
//             </Box>
//             <Box
//               sx={{
//                 py: 2,
//                 pb: 0.1,
//               }}
//             >
//               <TextField
//                 fullWidth
//                 placeholder="Search chats..."
//                 variant="outlined"
//                 size="small"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 slotProps={{
//                   input: {
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <IconButton>
//                           <Search />
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: "5px",
//                     backgroundColor: "#fff",
//                     width: "248px",
//                     paddingLeft: 0,
//                   },
//                 }}
//               />
//             </Box>
//           </Box>
//           <Box sx={{ overflowY: "auto", height: "calc(100vh - 120px)", px: 1 }}>
//             {sessionLoading ? (
//               <div>
//                 {[...Array(7)].map((_, i) => (
//                   <Box key={i}>
//                     <Skeleton sx={{ width: "100%", p: 3 }} />
//                   </Box>
//                 ))}
//               </div>
//             ) : (
//               <List>
//                 {filteredChats
//                   ?.filter((item) => item?.name)
//                   .map((chat) => (
//                     <ListItemButton
//                       key={chat.id}
//                       selected={chat.id === selectedChatId}
//                       onClick={() => {
//                         setSelectedChatId(chat.id);
//                         localStorage.setItem("lastChatSessionId", chat.id);
//                         loadChatHistory(chat.sessionId);
//                         setShowSidebar(false);
//                       }}
//                       className={`cursor-pointer transition-colors ${
//                         chat.id === selectedChatId
//                           ? "bg-blue-50 border-blue-200"
//                           : "hover:bg-gray-50"
//                       }`}
//                       sx={{
//                         borderRadius: 1.5,
//                         my: 0.8,
//                         backgroundColor:
//                           chat.id === selectedChatId ? "#e3f2fd" : "#fff",
//                         border:
//                           chat.id === selectedChatId
//                             ? "1px solid #3067f6"
//                             : "1px solid #80808052",
//                         "&:hover": {
//                           backgroundColor:
//                             chat.id === selectedChatId
//                               ? "#e3f2fd"
//                               : "rgba(0, 0, 0, 0.04)",
//                         },
//                       }}
//                     >
//                       <ListItemText
//                         primary={chat.name.replace(/\b\w/g, (char) =>
//                           char.toUpperCase()
//                         )}
//                         secondary={formatChatTime(new Date(chat.createTime))}
//                       />
//                     </ListItemButton>
//                   ))}
//               </List>
//             )}
//           </Box>
//         </Box>
//       )}

//       <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             p: 2,
//             borderBottom: "1px solid #e0e0e0",
//           }}
//         >
//           <IconButton
//             onClick={() => {
//               setShowSidebar(!showSidebar);
//             }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Avatar src={logo} sx={{ ml: 1 }} />
//           <Box ml={1}>
//             <Typography fontWeight="bold">Chatbot</Typography>
//             <Typography variant="caption" color="text.secondary">
//               Always online · Ready to help
//             </Typography>
//           </Box>
//           <Box flexGrow={1} />
//           <Box
//             sx={{
//               width: 10,
//               height: 10,
//               bgcolor: "green",
//               borderRadius: "50%",
//               ml: "auto",
//               mr: 1,
//             }}
//           />
//           <Typography variant="caption">Online</Typography>
//         </Box>

//         <Box sx={{ height: "52vh", overflowY: "auto", p: 2 }}>
//           {historyLoading ? (
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 py: 8,
//                 height: "48.5vh",
//               }}
//             >
//               <Box sx={{ textAlign: "center" }}>
//                 <CircularProgress sx={{ mb: 2 }} />
//                 <Typography variant="body2" color="text.secondary">
//                   Loading chat history...
//                 </Typography>
//               </Box>
//             </Box>
//           ) : !selectedChatId && messageGroups[0]?.length === 0 ? (
//             <Box sx={{ textAlign: "center", py: 12 }}>
//               <Avatar
//                 sx={{
//                   width: 64,
//                   height: 64,
//                   mx: "auto",
//                   mb: 2,
//                   bgcolor: "#3dafe2",
//                   color: "#fff",
//                 }}
//               >
//                 <Box
//                   component="img"
//                   src={logo}
//                   sx={{ width: 32, height: 32 }}
//                 />
//               </Avatar>
//               <Typography variant="h6" sx={{ mb: 1 }}>
//                 Welcome to Fanisko HR Assist
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Start a conversation or select a previous chat from the sidebar.
//               </Typography>
//             </Box>
//           ) : (
//             <Box sx={{ spaceY: 6 }}>
//               {(messageGroups[0] || []).map((group, idx) => (
//                 <Box key={idx} mb={3}>
//                   <Box
//                     display="flex"
//                     justifyContent="flex-end"
//                     flexDirection={"column"}
//                     alignItems={"flex-end"}
//                     mb={1.5}
//                   >
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1,
//                         mr: 1,
//                       }}
//                     >
//                       <Typography variant="caption">You</Typography>
//                     </Box>
//                     <Paper
//                       sx={{
//                         p: 1.5,
//                         bgcolor: "#2F67F6",
//                         color: "#fff",
//                         borderRadius: 3,
//                         maxWidth: { xs: "80%", md: "70%" },
//                       }}
//                     >
//                       <Typography>{group.prompt}</Typography>
//                       <Typography variant="caption">{group.time}</Typography>
//                     </Paper>
//                   </Box>
//                   <Box>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         mb: 1,
//                         color: "text.secondary",
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 1,
//                         }}
//                       >
//                         <Box
//                           component="img"
//                           src={logo}
//                           sx={{ width: 16, height: 16 }}
//                         />
//                         <Typography variant="caption">
//                           Fanisko HR Assist
//                         </Typography>
//                       </Box>
//                     </Box>
//                     <Paper
//                       sx={{
//                         p: 1.5,
//                         bgcolor: "#f1f6fc",
//                         borderRadius: 3,
//                         maxWidth: { xs: "80%", md: "70%" },
//                       }}
//                     >
//                       <Box sx={{ mb: 2 }}>
//                         {group.isTyping &&
//                         [
//                           "Thinking...",
//                           "Analyzing...",
//                           "Generating...",
//                         ].includes(group.responses[group.currentSlide]) ? (
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                             }}
//                           >
//                             <Typography variant="body1">
//                               {group.responses[group.currentSlide]}
//                             </Typography>
//                           </Box>
//                         ) : (
//                           <div
//                             dangerouslySetInnerHTML={{
//                               __html: group.responses[group.currentSlide],
//                             }}
//                           />
//                         )}
//                       </Box>
//                       <Divider sx={{ my: 1 }} />
//                       <Box
//                         display="flex"
//                         justifyContent="space-between"
//                         alignItems={"flex-end"}
//                       >
//                         <Typography
//                           variant="caption"
//                           sx={{ opacity: 0.6, marginBottom: 0.5 }}
//                         >
//                           {group.time}
//                         </Typography>
//                         <Box sx={{ display: "flex", gap: 1 }}>
//                           {group.responses.length > 1 && (
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 1,
//                               }}
//                             >
//                               <IconButton
//                                 size="small"
//                                 onClick={() => navigateResponse(idx, "prev")}
//                                 disabled={
//                                   group.currentSlide <= 0 ||
//                                   group.isTyping ||
//                                   isRegenerating
//                                 }
//                               >
//                                 <ChevronLeftIcon fontSize="small" />
//                               </IconButton>
//                               <Typography variant="caption">
//                                 {group.currentSlide + 1}/
//                                 {group.responses.length}
//                               </Typography>
//                               <IconButton
//                                 size="small"
//                                 onClick={() => navigateResponse(idx, "next")}
//                                 disabled={
//                                   group.currentSlide >=
//                                     group.responses.length - 1 ||
//                                   group.isTyping ||
//                                   isRegenerating
//                                 }
//                               >
//                                 <ChevronRightIcon fontSize="small" />
//                               </IconButton>
//                             </Box>
//                           )}
//                           <Button
//                             size="small"
//                             startIcon={<AutorenewIcon fontSize="small" />}
//                             onClick={() => regenerateMessage(group)}
//                             disabled={
//                               isSending ||
//                               isTypingResponse ||
//                               isRegenerating ||
//                               isRegeneratingResponse
//                             }
//                             sx={{
//                               color: "text.secondary",
//                               "&:hover": { color: "#2F67F6" },
//                               minWidth: 0,
//                             }}
//                           ></Button>
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: "16px",
//                               alignItems: "center",
//                               color: "gray",
//                             }}
//                           >
//                             <ThumbUpAltOutlinedIcon
//                               sx={{ cursor: "pointer", fontSize: 20 }}
//                             />
//                             <ThumbDownAltOutlinedIcon
//                               sx={{ cursor: "pointer", fontSize: 20 }}
//                             />
//                             {group.isBeingProcessed && (
//                               <StopOutlinedIcon
//                                 sx={{
//                                   cursor: "pointer",
//                                   fontSize: 25,
//                                   color: group.isBeingProcessed
//                                     ? "inherit"
//                                     : "rgba(0, 0, 0, 0.26)",
//                                 }}
//                                 onClick={stopGeneration}
//                               />
//                             )}
//                           </Box>
//                         </Box>
//                       </Box>
//                     </Paper>
//                   </Box>
//                 </Box>
//               ))}
//             </Box>
//           )}
//           <div ref={messagesEndRef} />
//         </Box>

//         {(isSending || (isTypingResponse && !isRegeneratingResponse)) && (
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               mb: 1,
//             }}
//           >
//             <Button
//               variant="outlined"
//               size="small"
//               startIcon={<StopOutlinedIcon />}
//               onClick={stopGeneration}
//               sx={{
//                 color: "text.secondary",
//                 borderColor: "text.secondary",
//                 textTransform: "none",
//               }}
//             >
//               Stop Response
//             </Button>
//           </Box>
//         )}

//         <Box
//           sx={{
//             p: 2,
//             borderTop: "1px solid #e0e0e0",
//             bgcolor: "#fafafa",
//             pb: 0.5,
//           }}
//         >
//           <TextField
//             fullWidth
//             placeholder="Ask me..."
//             variant="outlined"
//             size="small"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSend();
//               }
//             }}
//             disabled={
//               isRegenerating ||
//               isSending ||
//               isTypingResponse ||
//               isRegeneratingResponse
//             }
//             slotProps={{
//               input: {
//                 endAdornment: (
//                   <InputAdornment position="end" sx={{ gap: 1 }}>
//                     <TextField
//                       select
//                       size="small"
//                       value={maxWords}
//                       onChange={(e) => setMaxWords(Number(e.target.value))}
//                       sx={{ width: 70 }}
//                       SelectProps={{
//                         MenuProps: {
//                           disablePortal: true,
//                           PaperProps: {
//                             style: {
//                               maxHeight: 200,
//                             },
//                           },
//                         },
//                       }}
//                     >
//                       {[5, 10, 15, 20, 25, 50].map((num) => (
//                         <MenuItem key={num} value={num}>
//                           {num}
//                         </MenuItem>
//                       ))}
//                     </TextField>

//                     <IconButton
//                       onClick={() => handleSend()}
//                       disabled={
//                         !input.trim() ||
//                         isSending ||
//                         isTypingResponse ||
//                         isRegenerating
//                       }
//                       sx={{
//                         "&:disabled": {
//                           opacity: 0.5,
//                           cursor: "not-allowed",
//                         },
//                       }}
//                     >
//                       <SendIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               },
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "25px",
//                 backgroundColor: "#fff",
//               },
//               "& .Mui-disabled": {
//                 opacity: 0.5,
//               },
//             }}
//             multiline
//             maxRows={4}
//           />
//         </Box>

//         <Box textAlign="center" p={1}>
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{ fontSize: "11px" }}
//           >
//             This Fanisko HR Assist can help with general HR information. For
//             personal matters, contact HR.
//           </Typography>
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// -------------------------------------------------------------------------------------------------------------------

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Avatar,
//   InputAdornment,
//   List,
//   ListItemText,
//   Divider,
//   Button,
//   Paper,
//   ListItemButton,
//   CircularProgress,
//   Skeleton,
//   MenuItem,
// } from "@mui/material";
// import {
//   Menu as MenuIcon,
//   Add as AddIcon,
//   Send as SendIcon,
//   Autorenew as AutorenewIcon,
//   ChevronLeft as ChevronLeftIcon,
//   ChevronRight as ChevronRightIcon,
//   Close as CloseIcon,
//   Search as SearchIcon,
//   ThumbUpAltOutlined as ThumbUpAltOutlinedIcon,
//   ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
//   StopOutlined as StopOutlinedIcon,
// } from "@mui/icons-material";

// // Mock logo - replace with your actual logo import
// const Logo = () => (
//   <Avatar sx={{ bgcolor: "#2F67F6", width: 32, height: 32 }}>
//     <Typography variant="body2" sx={{ color: "white" }}>
//       AI
//     </Typography>
//   </Avatar>
// );

// const ChatUI = () => {
//   const [input, setInput] = useState("");
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [selectedChatId, setSelectedChatId] = useState("");
//   const [sessionLoading, setSessionLoading] = useState(false);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [messageGroups, setMessageGroups] = useState([]);
//   const [isSending, setIsSending] = useState(false);
//   const [isTypingResponse, setIsTypingResponse] = useState(false);
//   const [isRegeneratingResponse, setIsRegeneratingResponse] = useState(false);
//   const [isRegenerating, setIsRegenerating] = useState(false);
//   const messagesEndRef = useRef(null);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const abortControllerRef = useRef(null);
//   const [isStopped, setIsStopped] = useState(false);
//   const isStoppedRef = useRef(false);
//   const [maxWords, setMaxWords] = useState(10);

//   useEffect(() => {
//     const lastSessionId = localStorage.getItem("lastChatSessionId");
//     if (lastSessionId && chats.length > 0) {
//       const lastSession = chats.find((chat) => chat.id === lastSessionId);
//       if (lastSession) {
//         setSelectedChatId(lastSessionId);
//         loadChatHistory(lastSession.sessionId);
//       }
//     }
//     setInitialLoad(false);
//   }, [chats]);

//   useEffect(() => {
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   const scrollToBottom = useCallback(() => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   }, []);

//   const currentTime = () =>
//     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   // Fetch chat history sessions from local API
//   const fetchChatSessions = async () => {
//     setSessionLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:8080/api/ai/get_user_sessions",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: "chiraaag.korat@gmail.com" }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       // Adjust this based on the actual response structure from your API
//       if (data.response && data.response.length > 0) {
//         const sessions = data.response.map((session) => ({
//           id: session.session_id,
//           name:
//             session.session_heading || `Chat ${session.session_id.slice(0, 8)}`,
//           sessionId: session.session_id,
//           createTime: session.create_time || new Date().toISOString(),
//         }));

//         setChats(sessions);

//         if (initialLoad) {
//           const lastSessionId = localStorage.getItem("lastChatSessionId");
//           if (lastSessionId && sessions.some((s) => s.id === lastSessionId)) {
//             setSelectedChatId(lastSessionId);
//             loadChatHistory(lastSessionId);
//           }
//         }
//       }
//       return [];
//     } catch (error) {
//       console.error("API Error:", error);
//       return [];
//     } finally {
//       setSessionLoading(false);
//     }
//   };

//   const getChatHistory = async (sessionId) => {
//     try {
//       const response = await fetch("http://localhost:8080/api/ai/history", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sessionId }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       return data.response || [];
//     } catch (error) {
//       console.error("API Error:", error);
//       return [];
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChatSessions();
//   }, []);

//   useEffect(() => {
//     if (selectedChatId && chats.length > 0) {
//       const selectedChat = chats.find((chat) => chat.id === selectedChatId);
//       if (selectedChat) {
//         loadChatHistory(selectedChat.sessionId);
//       }
//     }
//   }, [selectedChatId, chats]);

//   const loadChatHistory = async (sessionId) => {
//     setHistoryLoading(true);
//     const rawHistory = await getChatHistory(sessionId);

//     // Process the API response to match our UI structure
//     const processedGroups = [];

//     for (let i = 0; i < rawHistory.length; i++) {
//       const message = rawHistory[i];

//       if (message.role === "user") {
//         // Find the next model response
//         const modelResponse =
//           rawHistory[i + 1]?.role === "model" ? rawHistory[i + 1] : null;

//         if (modelResponse) {
//           processedGroups.push({
//             prompt: message.content,
//             responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
//             time: currentTime(),
//             currentSlide: 0,
//             isTyping: false,
//             isComplete: true,
//           });
//           i++; // Skip the model response in the next iteration
//         }
//       }
//     }

//     setMessageGroups([processedGroups.reverse()]);
//     setTimeout(scrollToBottom, 100);
//     setHistoryLoading(false);
//   };

//   const fetchChatbotResponse = async (text, currentSessionId) => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     const controller = new AbortController();
//     abortControllerRef.current = controller;

//     const payload = {
//       email: "chiraaag.korat@gmail.com",
//       create_time: new Date().toISOString(),
//       prompt: text,
//       sessionId: currentSessionId,
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

//       // Update session ID if this was a new session
//       if (data.sessionId && currentSessionId === "") {
//         setChats((prev) => {
//           const updated = [...prev];
//           const newChat = {
//             id: data.sessionId,
//             name: `Chat ${updated.length + 1}`,
//             sessionId: data.sessionId,
//             createTime: new Date().toISOString(),
//           };
//           updated.unshift(newChat);
//           setSelectedChatId(newChat.id);
//           return updated;
//         });
//       }

//       return {
//         response: data.response.replace(/\n\n/g, "<br/>"),
//         sessionId: data.sessionId,
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

//   const stopGeneration = () => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       abortControllerRef.current = null;
//     }

//     isStoppedRef.current = true;
//     setIsStopped(true);
//     setIsSending(false);
//     setIsTypingResponse(false);
//     setIsRegeneratingResponse(false);
//     setIsRegenerating(false);

//     let partialChat = null;

//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       const lastGroupIndex = chatGroups.length - 1;

//       if (lastGroupIndex >= 0 && chatGroups[lastGroupIndex].isTyping) {
//         const lastGroup = chatGroups[lastGroupIndex];
//         const partialGroup = {
//           ...lastGroup,
//           isTyping: false,
//           isComplete: false,
//           isBeingProcessed: false,
//           isStopped: true,
//           responses: [...lastGroup.responses],
//         };

//         chatGroups[lastGroupIndex] = partialGroup;
//         partialChat = partialGroup;
//       }

//       return updated;
//     });

//     setTimeout(() => {
//       if (!partialChat) return;

//       const sessionId = selectedChatId
//         ? chats.find((chat) => chat.id === selectedChatId)?.sessionId
//         : "";

//       if (sessionId) {
//         const existing = JSON.parse(localStorage.getItem(sessionId) || "[]");
//         const existingIndex = existing.findIndex(
//           (g) => g.prompt === partialChat?.prompt
//         );

//         if (existingIndex !== -1) {
//           existing[existingIndex] = {
//             ...existing[existingIndex],
//             responses: [
//               ...existing[existingIndex].responses,
//               partialChat.responses[partialChat.responses.length - 1],
//             ],
//             isComplete: false,
//             isStopped: true,
//           };
//         } else {
//           existing.push(partialChat);
//         }

//         localStorage.setItem(sessionId, JSON.stringify(existing));
//       }
//     }, 100);
//   };

//   const handleSend = async () => {
//     if (!input.trim() || isSending) return;

//     isStoppedRef.current = false;
//     const prompt = input;
//     setInput("");
//     setIsSending(true);
//     setIsTypingResponse(true);
//     setIsRegeneratingResponse(true);
//     setIsStopped(false);
//     setShowSidebar(false);
//     const currentSessionId = selectedChatId
//       ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//       : "";

//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       chatGroups.push({
//         prompt,
//         responses: ["Thinking..."],
//         time: currentTime(),
//         currentSlide: 0,
//         isTyping: true,
//         isComplete: true,
//       });
//       return updated;
//     });

//     try {
//       const result = await fetchChatbotResponse(prompt, currentSessionId);
//       if (isStoppedRef.current || !result) return;

//       const chars = result.response.split("");
//       let currentText = "";

//       for (let i = 0; i < chars.length; i++) {
//         if (isStoppedRef.current) break;

//         currentText += chars[i];

//         setMessageGroups((prev) => {
//           const updated = [...prev];
//           const chatGroups = updated[0] || [];
//           const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
//           if (groupIndex !== -1) {
//             chatGroups[groupIndex] = {
//               ...chatGroups[groupIndex],
//               responses: [currentText],
//               isTyping: !isStoppedRef.current,
//               isComplete: !isStoppedRef.current,
//             };
//           }
//           return updated;
//         });

//         await new Promise((resolve) => setTimeout(resolve, 25));
//       }
//     } catch (error) {
//       console.error("Failed to send message:", error);
//       setMessageGroups((prev) => {
//         const updated = [...prev];
//         const chatGroups = updated[0] || [];
//         const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
//         if (groupIndex !== -1) {
//           chatGroups[groupIndex] = {
//             ...chatGroups[groupIndex],
//             isTyping: false,
//             isComplete: false,
//             responses: ["Sorry, something went wrong."],
//           };
//         }
//         return updated;
//       });
//     } finally {
//       setIsSending(false);
//       setIsTypingResponse(false);
//       setIsRegeneratingResponse(false);
//       scrollToBottom();
//     }
//   };

//   const regenerateMessage = async (group) => {
//     if (isTypingResponse || isRegeneratingResponse) return;

//     isStoppedRef.current = false;
//     setIsTypingResponse(true);
//     setIsRegeneratingResponse(true);
//     setIsRegenerating(true);
//     setIsStopped(false);
//     const currentSessionId = selectedChatId
//       ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//       : "";

//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       const index = chatGroups.findIndex((g) => g.prompt === group.prompt);
//       if (index !== -1) {
//         const newResponses = [...chatGroups[index].responses, "Thinking..."];
//         chatGroups[index] = {
//           ...chatGroups[index],
//           responses: newResponses,
//           currentSlide: newResponses.length - 1,
//           isTyping: true,
//           isComplete: false,
//           isBeingProcessed: true,
//         };
//       }
//       return updated;
//     });

//     try {
//       const result = await fetchChatbotResponse(group.prompt, currentSessionId);

//       if (isStoppedRef.current || !result) return;

//       const chars = result.response.split("");
//       let currentText = "";
//       let charIndex = 0;

//       const typeCharacter = () => {
//         if (isStoppedRef.current) {
//           if (currentSessionId) {
//             const existing = JSON.parse(
//               localStorage.getItem(currentSessionId) || "[]"
//             );
//             const existingIndex = existing.findIndex(
//               (g) => g.prompt === group.prompt
//             );

//             if (existingIndex !== -1) {
//               existing[existingIndex] = {
//                 ...existing[existingIndex],
//                 responses: [...existing[existingIndex].responses, currentText],
//                 isComplete: false,
//                 isStopped: true,
//                 isBeingProcessed: false,
//               };
//             } else {
//               existing.push({
//                 prompt: group.prompt,
//                 responses: [currentText],
//                 time: currentTime(),
//                 currentSlide: 0,
//                 isTyping: false,
//                 isComplete: false,
//                 isStopped: true,
//                 isBeingProcessed: false,
//               });
//             }
//             localStorage.setItem(currentSessionId, JSON.stringify(existing));
//           }
//           return;
//         }

//         currentText += chars[charIndex];
//         charIndex++;

//         setMessageGroups((prev) => {
//           const updated = [...prev];
//           const chatGroups = updated[0] || [];
//           const index = chatGroups.findIndex((g) => g.prompt === group.prompt);
//           if (index !== -1) {
//             const currentGroup = chatGroups[index];
//             const newResponses = [...currentGroup.responses];
//             newResponses[currentGroup.currentSlide] = currentText;
//             chatGroups[index] = {
//               ...currentGroup,
//               responses: newResponses,
//               isBeingProcessed: true,
//             };
//             return updated;
//           }
//         });

//         if (charIndex < chars.length) {
//           setTimeout(typeCharacter, 25);
//         } else {
//           if (currentSessionId) {
//             const existing = JSON.parse(
//               localStorage.getItem(currentSessionId) || "[]"
//             );
//             const existingIndex = existing.findIndex(
//               (g) => g.prompt === group.prompt
//             );

//             if (existingIndex !== -1) {
//               existing[existingIndex] = {
//                 ...existing[existingIndex],
//                 responses: [...existing[existingIndex].responses, currentText],
//                 isComplete: true,
//                 isBeingProcessed: true,
//               };
//             } else {
//               existing.push({
//                 prompt: group.prompt,
//                 responses: [currentText],
//                 time: currentTime(),
//                 currentSlide: 0,
//                 isTyping: false,
//                 isComplete: true,
//                 isBeingProcessed: false,
//               });
//             }
//             localStorage.setItem(currentSessionId, JSON.stringify(existing));
//           }

//           setIsTypingResponse(false);
//           setIsRegeneratingResponse(false);
//           setIsStopped(false);

//           setMessageGroups((prev) => {
//             const updated = [...prev];
//             const chatGroups = updated[0] || [];
//             const index = chatGroups.findIndex(
//               (g) => g.prompt === group.prompt
//             );
//             if (index !== -1) {
//               chatGroups[index] = {
//                 ...chatGroups[index],
//                 isBeingProcessed: false,
//               };
//             }
//             return updated;
//           });
//         }
//       };

//       typeCharacter();
//     } catch (error) {
//       console.error("Failed to regenerate message:", error);
//     } finally {
//       setIsSending(false);
//       setIsTypingResponse(false);
//       setIsRegeneratingResponse(false);
//       setIsRegenerating(false);

//       setMessageGroups((prev) => {
//         const updated = [...prev];
//         const chatGroups = updated[0] || [];
//         const lastGroupIndex = chatGroups.length - 1;
//         if (lastGroupIndex >= 0) {
//           chatGroups[lastGroupIndex] = {
//             ...chatGroups[lastGroupIndex],
//             isBeingProcessed: false,
//           };
//         }
//         return updated;
//       });
//     }
//   };

//   const createNewChat = () => {
//     setSelectedChatId("");
//     localStorage.removeItem("lastChatSessionId");
//     setMessageGroups([[]]);
//     setShowSidebar(false);
//   };

//   const navigateResponse = (groupIndex, direction) => {
//     if (messageGroups[0]?.[groupIndex]?.isTyping || isRegenerating) return;
//     setMessageGroups((prev) => {
//       const updated = [...prev];
//       const chatGroups = updated[0] || [];
//       if (chatGroups[groupIndex]) {
//         const group = chatGroups[groupIndex];
//         const newSlide =
//           direction === "prev"
//             ? Math.max(0, group.currentSlide - 1)
//             : Math.min(group.responses.length - 1, group.currentSlide + 1);

//         chatGroups[groupIndex] = {
//           ...group,
//           currentSlide: newSlide,
//         };
//       }
//       updated[0] = chatGroups;
//       return updated;
//     });
//   };

//   function formatChatTime(date) {
//     const now = new Date();
//     const timeOptions = {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     };
//     const timeStr = date.toLocaleTimeString("en-US", timeOptions);

//     if (date.toDateString() === now.toDateString()) {
//       return `Today  ${timeStr}`;
//     }

//     const yesterday = new Date(now);
//     yesterday.setDate(yesterday.getDate() - 1);
//     if (date.toDateString() === yesterday.toDateString()) {
//       return `Yesterday  ${timeStr}`;
//     }

//     const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
//     if (diffInDays <= 7) {
//       const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
//       const dateStr = date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//       });
//       return `${dayName}, ${dateStr},  ${timeStr}`;
//     }

//     const fullDate = date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//     return `${fullDate},  ${timeStr}`;
//   }

//   const filteredChats = chats.filter((chat) =>
//     chat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
//       {showSidebar && (
//         <Box
//           sx={{
//             width: 280,
//             bgcolor: "#f5f5f5",
//             zIndex: 1,
//             height: "61.1vh",
//             overflowY: "auto",
//             position: "absolute",
//             boxShadow: { xs: 3, md: 0 },
//           }}
//         >
//           <Box
//             sx={{
//               p: 2,
//               position: "sticky",
//               top: 0,
//               pb: 2,
//               borderBottom: "1px solid #e0e0e0",
//               zIndex: 2,
//               backgroundColor: "#f5f5f5",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                 <Logo />
//                 <Typography className="text-xl font-medium text-gray-900">
//                   Chatbot{" "}
//                 </Typography>
//               </Box>
//               <IconButton
//                 onClick={() => setShowSidebar(false)}
//                 sx={{
//                   color: "text.secondary",
//                   "&:hover": {
//                     backgroundColor: "rgba(0, 0, 0, 0.04)",
//                   },
//                 }}
//               >
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", pt: 2 }}>
//               <Button
//                 fullWidth
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={createNewChat}
//                 sx={{ flexGrow: 1 }}
//               >
//                 New Chat
//               </Button>
//             </Box>
//             <Box
//               sx={{
//                 py: 2,
//                 pb: 0.1,
//               }}
//             >
//               <TextField
//                 fullWidth
//                 placeholder="Search chats..."
//                 variant="outlined"
//                 size="small"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 slotProps={{
//                   input: {
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <IconButton>
//                           <SearchIcon />
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: "5px",
//                     backgroundColor: "#fff",
//                     width: "248px",
//                     paddingLeft: 0,
//                   },
//                 }}
//               />
//             </Box>
//           </Box>
//           <Box sx={{ overflowY: "auto", height: "calc(100vh - 120px)", px: 1 }}>
//             {sessionLoading ? (
//               <div>
//                 {[...Array(7)].map((_, i) => (
//                   <Box key={i}>
//                     <Skeleton sx={{ width: "100%", p: 3 }} />
//                   </Box>
//                 ))}
//               </div>
//             ) : (
//               <List>
//                 {filteredChats
//                   ?.filter((item) => item?.name)
//                   .map((chat) => (
//                     <ListItemButton
//                       key={chat.id}
//                       selected={chat.id === selectedChatId}
//                       onClick={() => {
//                         setSelectedChatId(chat.id);
//                         localStorage.setItem("lastChatSessionId", chat.id);
//                         loadChatHistory(chat.sessionId);
//                         setShowSidebar(false);
//                       }}
//                       className={`cursor-pointer transition-colors ${
//                         chat.id === selectedChatId
//                           ? "bg-blue-50 border-blue-200"
//                           : "hover:bg-gray-50"
//                       }`}
//                       sx={{
//                         borderRadius: 1.5,
//                         my: 0.8,
//                         backgroundColor:
//                           chat.id === selectedChatId ? "#e3f2fd" : "#fff",
//                         border:
//                           chat.id === selectedChatId
//                             ? "1px solid #3067f6"
//                             : "1px solid #80808052",
//                         "&:hover": {
//                           backgroundColor:
//                             chat.id === selectedChatId
//                               ? "#e3f2fd"
//                               : "rgba(0, 0, 0, 0.04)",
//                         },
//                       }}
//                     >
//                       <ListItemText
//                         primary={chat.name.replace(/\b\w/g, (char) =>
//                           char.toUpperCase()
//                         )}
//                         secondary={formatChatTime(new Date(chat.createTime))}
//                       />
//                     </ListItemButton>
//                   ))}
//               </List>
//             )}
//           </Box>
//         </Box>
//       )}

//       <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             p: 2,
//             borderBottom: "1px solid #e0e0e0",
//           }}
//         >
//           <IconButton
//             onClick={() => {
//               setShowSidebar(!showSidebar);
//             }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Logo />
//           <Box ml={1}>
//             <Typography fontWeight="bold">Chatbot</Typography>
//             <Typography variant="caption" color="text.secondary">
//               Always online · Ready to help
//             </Typography>
//           </Box>
//           <Box flexGrow={1} />
//           <Box
//             sx={{
//               width: 10,
//               height: 10,
//               bgcolor: "green",
//               borderRadius: "50%",
//               ml: "auto",
//               mr: 1,
//             }}
//           />
//           <Typography variant="caption">Online</Typography>
//         </Box>

//         <Box sx={{ height: "52vh", overflowY: "auto", p: 2 }}>
//           {historyLoading ? (
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 py: 8,
//                 height: "48.5vh",
//               }}
//             >
//               <Box sx={{ textAlign: "center" }}>
//                 <CircularProgress sx={{ mb: 2 }} />
//                 <Typography variant="body2" color="text.secondary">
//                   Loading chat history...
//                 </Typography>
//               </Box>
//             </Box>
//           ) : !selectedChatId && messageGroups[0]?.length === 0 ? (
//             <Box sx={{ textAlign: "center", py: 12 }}>
//               <Avatar
//                 sx={{
//                   width: 64,
//                   height: 64,
//                   mx: "auto",
//                   mb: 2,
//                   bgcolor: "#3dafe2",
//                   color: "#fff",
//                 }}
//               >
//                 <Logo />
//               </Avatar>
//               <Typography variant="h6" sx={{ mb: 1 }}>
//                 Welcome to AI Assistant
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Start a conversation or select a previous chat from the sidebar.
//               </Typography>
//             </Box>
//           ) : (
//             <Box sx={{ spaceY: 6 }}>
//               {(messageGroups[0] || []).map((group, idx) => (
//                 <Box key={idx} mb={3}>
//                   <Box
//                     display="flex"
//                     justifyContent="flex-end"
//                     flexDirection={"column"}
//                     alignItems={"flex-end"}
//                     mb={1.5}
//                   >
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1,
//                         mr: 1,
//                       }}
//                     >
//                       <Typography variant="caption">You</Typography>
//                     </Box>
//                     <Paper
//                       sx={{
//                         p: 1.5,
//                         bgcolor: "#2F67F6",
//                         color: "#fff",
//                         borderRadius: 3,
//                         maxWidth: { xs: "80%", md: "70%" },
//                       }}
//                     >
//                       <Typography>{group.prompt}</Typography>
//                       <Typography variant="caption">{group.time}</Typography>
//                     </Paper>
//                   </Box>
//                   <Box>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         mb: 1,
//                         color: "text.secondary",
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 1,
//                         }}
//                       >
//                         <Logo />
//                         <Typography variant="caption">AI Assistant</Typography>
//                       </Box>
//                     </Box>
//                     <Paper
//                       sx={{
//                         p: 1.5,
//                         bgcolor: "#f1f6fc",
//                         borderRadius: 3,
//                         maxWidth: { xs: "80%", md: "70%" },
//                       }}
//                     >
//                       <Box sx={{ mb: 2 }}>
//                         {group.isTyping &&
//                         [
//                           "Thinking...",
//                           "Analyzing...",
//                           "Generating...",
//                         ].includes(group.responses[group.currentSlide]) ? (
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                             }}
//                           >
//                             <Typography variant="body1">
//                               {group.responses[group.currentSlide]}
//                             </Typography>
//                           </Box>
//                         ) : (
//                           <div
//                             dangerouslySetInnerHTML={{
//                               __html: group.responses[group.currentSlide],
//                             }}
//                           />
//                         )}
//                       </Box>
//                       <Divider sx={{ my: 1 }} />
//                       <Box
//                         display="flex"
//                         justifyContent="space-between"
//                         alignItems={"flex-end"}
//                       >
//                         <Typography
//                           variant="caption"
//                           sx={{ opacity: 0.6, marginBottom: 0.5 }}
//                         >
//                           {group.time}
//                         </Typography>
//                         <Box sx={{ display: "flex", gap: 1 }}>
//                           {group.responses.length > 1 && (
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 1,
//                               }}
//                             >
//                               <IconButton
//                                 size="small"
//                                 onClick={() => navigateResponse(idx, "prev")}
//                                 disabled={
//                                   group.currentSlide <= 0 ||
//                                   group.isTyping ||
//                                   isRegenerating
//                                 }
//                               >
//                                 <ChevronLeftIcon fontSize="small" />
//                               </IconButton>
//                               <Typography variant="caption">
//                                 {group.currentSlide + 1}/
//                                 {group.responses.length}
//                               </Typography>
//                               <IconButton
//                                 size="small"
//                                 onClick={() => navigateResponse(idx, "next")}
//                                 disabled={
//                                   group.currentSlide >=
//                                     group.responses.length - 1 ||
//                                   group.isTyping ||
//                                   isRegenerating
//                                 }
//                               >
//                                 <ChevronRightIcon fontSize="small" />
//                               </IconButton>
//                             </Box>
//                           )}
//                           <Button
//                             size="small"
//                             startIcon={<AutorenewIcon fontSize="small" />}
//                             onClick={() => regenerateMessage(group)}
//                             disabled={
//                               isSending ||
//                               isTypingResponse ||
//                               isRegenerating ||
//                               isRegeneratingResponse
//                             }
//                             sx={{
//                               color: "text.secondary",
//                               "&:hover": { color: "#2F67F6" },
//                               minWidth: 0,
//                             }}
//                           ></Button>
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: "16px",
//                               alignItems: "center",
//                               color: "gray",
//                             }}
//                           >
//                             <ThumbUpAltOutlinedIcon
//                               sx={{ cursor: "pointer", fontSize: 20 }}
//                             />
//                             <ThumbDownAltOutlinedIcon
//                               sx={{ cursor: "pointer", fontSize: 20 }}
//                             />
//                             {group.isBeingProcessed && (
//                               <StopOutlinedIcon
//                                 sx={{
//                                   cursor: "pointer",
//                                   fontSize: 25,
//                                   color: group.isBeingProcessed
//                                     ? "inherit"
//                                     : "rgba(0, 0, 0, 0.26)",
//                                 }}
//                                 onClick={stopGeneration}
//                               />
//                             )}
//                           </Box>
//                         </Box>
//                       </Box>
//                     </Paper>
//                   </Box>
//                 </Box>
//               ))}
//             </Box>
//           )}
//           <div ref={messagesEndRef} />
//         </Box>

//         {(isSending || (isTypingResponse && !isRegeneratingResponse)) && (
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               mb: 1,
//             }}
//           >
//             <Button
//               variant="outlined"
//               size="small"
//               startIcon={<StopOutlinedIcon />}
//               onClick={stopGeneration}
//               sx={{
//                 color: "text.secondary",
//                 borderColor: "text.secondary",
//                 textTransform: "none",
//               }}
//             >
//               Stop Response
//             </Button>
//           </Box>
//         )}

//         <Box
//           sx={{
//             p: 2,
//             borderTop: "1px solid #e0e0e0",
//             bgcolor: "#fafafa",
//             pb: 0.5,
//           }}
//         >
//           <TextField
//             fullWidth
//             placeholder="Ask me..."
//             variant="outlined"
//             size="small"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSend();
//               }
//             }}
//             disabled={
//               isRegenerating ||
//               isSending ||
//               isTypingResponse ||
//               isRegeneratingResponse
//             }
//             slotProps={{
//               input: {
//                 endAdornment: (
//                   <InputAdornment position="end" sx={{ gap: 1 }}>
//                     <TextField
//                       select
//                       size="small"
//                       value={maxWords}
//                       onChange={(e) => setMaxWords(Number(e.target.value))}
//                       sx={{ width: 70 }}
//                       SelectProps={{
//                         MenuProps: {
//                           disablePortal: true,
//                           PaperProps: {
//                             style: {
//                               maxHeight: 200,
//                             },
//                           },
//                         },
//                       }}
//                     >
//                       {[5, 10, 15, 20, 25, 50].map((num) => (
//                         <MenuItem key={num} value={num}>
//                           {num}
//                         </MenuItem>
//                       ))}
//                     </TextField>

//                     <IconButton
//                       onClick={() => handleSend()}
//                       disabled={
//                         !input.trim() ||
//                         isSending ||
//                         isTypingResponse ||
//                         isRegenerating
//                       }
//                       sx={{
//                         "&:disabled": {
//                           opacity: 0.5,
//                           cursor: "not-allowed",
//                         },
//                       }}
//                     >
//                       <SendIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               },
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "25px",
//                 backgroundColor: "#fff",
//               },
//               "& .Mui-disabled": {
//                 opacity: 0.5,
//               },
//             }}
//             multiline
//             maxRows={4}
//           />
//         </Box>

//         <Box textAlign="center" p={1}>
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{ fontSize: "11px" }}
//           >
//             This AI Assistant can help with general information.
//           </Typography>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default ChatUI;

// -----------------------------------------------------------------------------------------------------------------------

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  InputAdornment,
  List,
  ListItemText,
  Divider,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  ListItemButton,
  CircularProgress,
  Skeleton,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Send as SendIcon,
  Autorenew as AutorenewIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ThumbUpAltOutlined as ThumbUpAltOutlinedIcon,
  ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
  StopOutlined as StopOutlinedIcon,
} from "@mui/icons-material";
import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";

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
  const [showSidebar, setShowSidebar] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messageGroups, setMessageGroups] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const [isRegeneratingResponse, setIsRegeneratingResponse] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const abortControllerRef = useRef(null);
  const [isStopped, setIsStopped] = useState(false);
  const isStoppedRef = useRef(false);
  const [maxWords, setMaxWords] = useState(10);
  const [skipHistoryLoad, setSkipHistoryLoad] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedBot, setSelectedBot] = useState("gpt-3.5");

  // Add this function to generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    const lastSessionId = localStorage.getItem("lastChatSessionId");
    if (lastSessionId && chats.length > 0) {
      const lastSession = chats.find((chat) => chat.id === lastSessionId);
      if (lastSession) {
        setSelectedChatId(lastSessionId);
        loadChatHistory(lastSession.sessionId);
      }
    }
    setInitialLoad(false);
  }, [chats]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // const scrollToBottom = useCallback(() => {
  //   setTimeout(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 100);
  // }, []);
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const currentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fetchChatSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/ai/get_user_sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "chiraaag.korat@gmail.com" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Adjust this based on the actual response structure from your API
      if (data.response && data.response.length > 0) {
        // Check if the response structure matches your original API
        let sessions = [];

        // Try different response structures
        if (data.response[0] && data.response[0].user_sessions) {
          // Original structure from testcohere.fanisko.com
          sessions = data.response[0].user_sessions.map((session) => ({
            id: session.session_id,
            name:
              session.session_heading ||
              `Chat ${session.session_id.slice(0, 8)}`,
            sessionId: session.session_id,
            createTime: session.create_time || new Date().toISOString(),
          }));
        } else {
          // New structure from local API
          sessions = data.response.map((session) => ({
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
          }));
        }

        setChats(sessions);

        if (initialLoad) {
          const lastSessionId = localStorage.getItem("lastChatSessionId");
          if (lastSessionId && sessions.some((s) => s.id === lastSessionId)) {
            setSelectedChatId(lastSessionId);
            loadChatHistory(lastSessionId);
          }
        }
      }
      return [];
    } catch (error) {
      console.error("API Error:", error);
      return [];
    } finally {
      setSessionLoading(false);
    }
  };

  const getChatHistory = async (sessionId) => {
    try {
      const response = await fetch("http://localhost:8080/api/ai/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email: "chiraaag.korat@gmail.com" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

  useEffect(() => {
    fetchChatSessions();
  }, []);

  // useEffect(() => {
  //   if (selectedChatId && chats.length > 0) {
  //     const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  //     if (selectedChat) {
  //       loadChatHistory(selectedChat.sessionId);
  //     }
  //   }
  // }, [selectedChatId, chats]);

  // Modify the useEffect that loads chat history
  useEffect(() => {
    if (skipHistoryLoad) {
      setSkipHistoryLoad(false);
      return;
    }

    if (selectedChatId && chats.length > 0) {
      const selectedChat = chats.find((chat) => chat.id === selectedChatId);
      if (selectedChat && selectedChat.sessionId) {
        loadChatHistory(selectedChat.sessionId);
      } else {
        // This is a new chat with no session ID yet
        setMessageGroups([[]]);
      }
    }
  }, [selectedChatId, chats, skipHistoryLoad]);

  const loadChatHistory = async (sessionId) => {
    if (!sessionId) {
      setMessageGroups([[]]); // koi history nathi
      return;
    }
    setHistoryLoading(true);
    const rawHistory = await getChatHistory(sessionId);

    // Process the API response to match our UI structure
    const processedGroups = [];

    for (let i = 0; i < rawHistory.length; i++) {
      const message = rawHistory[i];

      if (message.role === "user") {
        // Find the next model response
        const modelResponse =
          rawHistory[i + 1]?.role === "model" ? rawHistory[i + 1] : null;

        if (modelResponse) {
          processedGroups.push({
            prompt: message.content,
            responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
            time: currentTime(),
            currentSlide: 0,
            isTyping: false,
            isComplete: true,
          });
          i++; // Skip the model response in the next iteration
        }
      }
    }

    setMessageGroups([processedGroups]);
    // setTimeout(scrollToBottom, 100);
    setHistoryLoading(false);
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  };

  const fetchChatbotResponse = async (text, currentSessionId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const payload = {
      email: "chiraaag.korat@gmail.com",
      create_time: new Date().toISOString(),
      prompt: text,
      sessionId: currentSessionId || "", // Send blank if no session ID
      maxWords: maxWords,
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

      return {
        response: data.response.replace(/\n\n/g, "<br/>"),
        sessionId: data.sessionId, // This will be the new session ID from the server
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }
      console.error(err);
      return {
        response: "Sorry, something went wrong.",
        sessionId: currentSessionId,
      };
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isStoppedRef.current = true;
    setIsStopped(true);
    setIsSending(false);
    setIsTypingResponse(false);
    setIsRegeneratingResponse(false);
    setIsRegenerating(false);

    let partialChat = null;

    setMessageGroups((prev) => {
      const updated = [...prev];
      const chatGroups = updated[0] || [];
      const lastGroupIndex = chatGroups.length - 1;

      if (lastGroupIndex >= 0 && chatGroups[lastGroupIndex].isTyping) {
        const lastGroup = chatGroups[lastGroupIndex];
        const partialGroup = {
          ...lastGroup,
          isTyping: false,
          isComplete: false,
          isBeingProcessed: false,
          isStopped: true,
          responses: [...lastGroup.responses],
        };

        chatGroups[lastGroupIndex] = partialGroup;
        partialChat = partialGroup;
      }

      return updated;
    });

    setTimeout(() => {
      if (!partialChat) return;

      const sessionId = selectedChatId
        ? chats.find((chat) => chat.id === selectedChatId)?.sessionId
        : "";

      if (sessionId) {
        const existing = JSON.parse(localStorage.getItem(sessionId) || "[]");
        const existingIndex = existing.findIndex(
          (g) => g.prompt === partialChat?.prompt
        );

        if (existingIndex !== -1) {
          existing[existingIndex] = {
            ...existing[existingIndex],
            responses: [
              ...existing[existingIndex].responses,
              partialChat.responses[partialChat.responses.length - 1],
            ],
            isComplete: false,
            isStopped: true,
          };
        } else {
          existing.push(partialChat);
        }

        localStorage.setItem(sessionId, JSON.stringify(existing));
      }
    }, 100);
  };

  // const handleSend = async () => {
  //   if (!input.trim() || isSending) return;

  //   isStoppedRef.current = false;
  //   const prompt = input;
  //   setInput("");
  //   setIsSending(true);
  //   setIsTypingResponse(true);
  //   setIsRegeneratingResponse(true);
  //   setIsStopped(false);
  //   setShowSidebar(false);

  //   let currentSessionId = selectedChatId
  //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
  //     : "";

  //   // If no session ID exists, create a new one
  //   if (!currentSessionId) {
  //     currentSessionId = generateSessionId();

  //     // Create a new chat session
  //     const newChat = {
  //       id: currentSessionId,
  //       name: `Chat ${chats.length + 1}`,
  //       sessionId: currentSessionId,
  //       createTime: new Date().toISOString(),
  //     };

  //     setChats((prev) => [newChat, ...prev]);
  //     setSelectedChatId(currentSessionId);
  //     localStorage.setItem("lastChatSessionId", currentSessionId);
  //   }

  //   setMessageGroups((prev) => {
  //     const updated = [...prev];
  //     const chatGroups = updated[0] || [];
  //     chatGroups.push({
  //       prompt,
  //       responses: ["Thinking..."],
  //       time: currentTime(),
  //       currentSlide: 0,
  //       isTyping: true,
  //       isComplete: true,
  //     });
  //     return updated;
  //   });

  //   try {
  //     const result = await fetchChatbotResponse(prompt, currentSessionId);
  //     if (isStoppedRef.current || !result) return;

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

  //       await new Promise((resolve) => setTimeout(resolve, 25));
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
  //         };
  //       }
  //       return updated;
  //     });
  //   } finally {
  //     setIsSending(false);
  //     setIsTypingResponse(false);
  //     setIsRegeneratingResponse(false);
  //     scrollToBottom();
  //   }
  // };
  // Modify the handleSend function to update the session ID after first response

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    isStoppedRef.current = false;
    const prompt = input;
    setInput("");
    setIsSending(true);
    setIsTypingResponse(true);
    setIsRegeneratingResponse(true);
    setIsStopped(false);
    setShowSidebar(false);

    let currentSessionId = selectedChatId
      ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
      : "";

    // Add new message group
    setMessageGroups((prev) => {
      const updated = [...prev];
      const chatGroups = updated[0] || [];
      chatGroups.push({
        prompt,
        responses: ["Thinking..."],
        time: currentTime(),
        currentSlide: 0,
        isTyping: true,
        isComplete: true,
      });
      return updated;
    });

    try {
      const result = await fetchChatbotResponse(prompt, currentSessionId);
      if (isStoppedRef.current || !result) return;

      // If this was a new chat with no session ID, update it with the one from the response
      if (!currentSessionId && result.sessionId) {
        setChats((prev) => {
          const updatedChats = [...prev];
          const chatIndex = updatedChats.findIndex(
            (chat) => chat.id === selectedChatId
          );
          if (chatIndex !== -1) {
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              sessionId: result.sessionId,
            };
          }
          return updatedChats;
        });

        // Update the selected chat's session ID
        currentSessionId = result.sessionId;
      }

      // Type out response character by character
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
            };
          }
          return updated;
        });

        await new Promise((resolve) => setTimeout(resolve, 25));
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
          };
        }
        return updated;
      });
    } finally {
      setIsSending(false);
      setIsTypingResponse(false);
      setIsRegeneratingResponse(false);
      scrollToBottom();
    }
  };

  const regenerateMessage = async (group) => {
    if (isTypingResponse || isRegeneratingResponse) return;

    isStoppedRef.current = false;
    setIsTypingResponse(true);
    setIsRegeneratingResponse(true);
    setIsRegenerating(true);
    setIsStopped(false);
    const currentSessionId = selectedChatId
      ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
      : "";

    setMessageGroups((prev) => {
      const updated = [...prev];
      const chatGroups = updated[0] || [];
      const index = chatGroups.findIndex((g) => g.prompt === group.prompt);
      if (index !== -1) {
        const newResponses = [...chatGroups[index].responses, "Thinking..."];
        chatGroups[index] = {
          ...chatGroups[index],
          responses: newResponses,
          currentSlide: newResponses.length - 1,
          isTyping: true,
          isComplete: false,
          isBeingProcessed: true,
        };
      }
      return updated;
    });

    try {
      const result = await fetchChatbotResponse(group.prompt, currentSessionId);

      if (isStoppedRef.current || !result) return;

      const chars = result.response.split("");
      let currentText = "";
      let charIndex = 0;

      const typeCharacter = () => {
        if (isStoppedRef.current) {
          if (currentSessionId) {
            const existing = JSON.parse(
              localStorage.getItem(currentSessionId) || "[]"
            );
            const existingIndex = existing.findIndex(
              (g) => g.prompt === group.prompt
            );

            if (existingIndex !== -1) {
              existing[existingIndex] = {
                ...existing[existingIndex],
                responses: [...existing[existingIndex].responses, currentText],
                isComplete: false,
                isStopped: true,
                isBeingProcessed: false,
              };
            } else {
              existing.push({
                prompt: group.prompt,
                responses: [currentText],
                time: currentTime(),
                currentSlide: 0,
                isTyping: false,
                isComplete: false,
                isStopped: true,
                isBeingProcessed: false,
              });
            }
            localStorage.setItem(currentSessionId, JSON.stringify(existing));
          }
          return;
        }

        currentText += chars[charIndex];
        charIndex++;

        setMessageGroups((prev) => {
          const updated = [...prev];
          const chatGroups = updated[0] || [];
          const index = chatGroups.findIndex((g) => g.prompt === group.prompt);
          if (index !== -1) {
            const currentGroup = chatGroups[index];
            const newResponses = [...currentGroup.responses];
            newResponses[currentGroup.currentSlide] = currentText;
            chatGroups[index] = {
              ...currentGroup,
              responses: newResponses,
              isBeingProcessed: true,
            };
            return updated;
          }
        });

        if (charIndex < chars.length) {
          setTimeout(typeCharacter, 25);
        } else {
          if (currentSessionId) {
            const existing = JSON.parse(
              localStorage.getItem(currentSessionId) || "[]"
            );
            const existingIndex = existing.findIndex(
              (g) => g.prompt === group.prompt
            );

            if (existingIndex !== -1) {
              existing[existingIndex] = {
                ...existing[existingIndex],
                responses: [...existing[existingIndex].responses, currentText],
                isComplete: true,
                isBeingProcessed: true,
              };
            } else {
              existing.push({
                prompt: group.prompt,
                responses: [currentText],
                time: currentTime(),
                currentSlide: 0,
                isTyping: false,
                isComplete: true,
                isBeingProcessed: false,
              });
            }
            localStorage.setItem(currentSessionId, JSON.stringify(existing));
          }

          setIsTypingResponse(false);
          setIsRegeneratingResponse(false);
          setIsStopped(false);

          setMessageGroups((prev) => {
            const updated = [...prev];
            const chatGroups = updated[0] || [];
            const index = chatGroups.findIndex(
              (g) => g.prompt === group.prompt
            );
            if (index !== -1) {
              chatGroups[index] = {
                ...chatGroups[index],
                isBeingProcessed: false,
              };
            }
            return updated;
          });
        }
      };

      typeCharacter();
    } catch (error) {
      console.error("Failed to regenerate message:", error);
    } finally {
      setIsSending(false);
      setIsTypingResponse(false);
      setIsRegeneratingResponse(false);
      setIsRegenerating(false);

      setMessageGroups((prev) => {
        const updated = [...prev];
        const chatGroups = updated[0] || [];
        const lastGroupIndex = chatGroups.length - 1;
        if (lastGroupIndex >= 0) {
          chatGroups[lastGroupIndex] = {
            ...chatGroups[lastGroupIndex],
            isBeingProcessed: false,
          };
        }
        return updated;
      });
    }
  };

  // const createNewChat = () => {
  //   const newSessionId = generateSessionId();
  //   const newChat = {
  //     id: newSessionId,
  //     name: `Chat ${chats.length + 1}`,
  //     sessionId: newSessionId,
  //     createTime: new Date().toISOString(),
  //   };

  //   setChats((prev) => [newChat, ...prev]);
  //   setSelectedChatId(newSessionId);
  //   localStorage.setItem("lastChatSessionId", newSessionId);
  //   setMessageGroups([[]]);
  //   setShowSidebar(false);
  // };

  const createNewChat = () => {
    const newChat = {
      id: `temp_${Date.now()}`, // temporary ID for UI
      name: `Chat ${chats.length + 1}`,
      sessionId: "", // blank session ID
      createTime: new Date().toISOString(),
    };

    setChats((prev) => [newChat, ...prev]);
    setSkipHistoryLoad(true); // prevent history load
    setSelectedChatId(newChat.id);
    localStorage.setItem("lastChatSessionId", newChat.id);
    setMessageGroups([[]]); // reset messages
    setShowSidebar(false);
  };

  const navigateResponse = (groupIndex, direction) => {
    if (messageGroups[0]?.[groupIndex]?.isTyping || isRegenerating) return;
    setMessageGroups((prev) => {
      const updated = [...prev];
      const chatGroups = updated[0] || [];
      if (chatGroups[groupIndex]) {
        const group = chatGroups[groupIndex];
        const newSlide =
          direction === "prev"
            ? Math.max(0, group.currentSlide - 1)
            : Math.min(group.responses.length - 1, group.currentSlide + 1);

        chatGroups[groupIndex] = {
          ...group,
          currentSlide: newSlide,
        };
      }
      updated[0] = chatGroups;
      return updated;
    });
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
      {/* {showSidebar && ( */}
      <Box
        sx={{
          width: isCollapsed ? 60 : 290,
          bgcolor: "#f5f5f5",
          height: "100vh",
          // overflowY: "auto",
          flexShrink: 0,
          transition: "width 0.3s ease",
          boxShadow: { xs: 3, md: 0 },
          display: "flex",
          flexDirection: "column",
          alignItems: isCollapsed ? "center" : "flex-start",
        }}
      >
        {/* Sidebar Header */}

        {/* Sidebar Body */}
        {isCollapsed ? (
          // Collapsed Mode: only icons
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
            <MenuIcon
              style={{ cursor: "pointer" }}
              // onClick={() => setShowSidebar(false)}
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
                  // px: 1,
                  pt: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton>
                    <MenuIcon />
                  </IconButton>
                  <Typography className="text-xl font-medium text-gray-900">
                    Chatbot
                  </Typography>
                </Box>
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
                  onClick={createNewChat}
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
                  // fullWidth
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
                px: 1,
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
                          setShowSidebar(false);
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
            {/* </Box> */}
          </>
        )}
      </Box>
      {/* )} */}
   
   <Box
        sx={{
          // width: 220, // 🔹 FIXED WIDTH → chatbot vy nathi jay
          // display: "flex",
          // alignItems: "center",
          // justifyContent: "center",
          // borderRight: "1px solid #e0e0e0",
          mt:3,
          // bgcolor: "#fafafa",
          ml:2,
          flexShrink: 0, // 🔹 prevent shrinking
        }}
      >
        <FormControl fullWidth size="small">
          {/* <InputLabel id="bot-select-label">Chatbot</InputLabel> */}
          <Select
            labelId="bot-select-label"
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: "5px" }}
          >
            <MenuItem value="gpt-3.5">OpenAI GPT-3.5</MenuItem>
            <MenuItem value="gpt-4">OpenAI GPT-4</MenuItem>
            <MenuItem value="assistant-x">Assistant X</MenuItem>
            <MenuItem value="custom-ai">Custom AI Bot</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          // px:50,
          width: "100%", //   full responsive width
          maxWidth: "900px", //   optional: max limit
          mx: "auto", //   center align if maxWidth set
          px: { xs: 6, sm: 8, md: 10, lg: 12 }, //   responsive padding
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            height: "64px",
          }}
        >
          {/* <IconButton
            onClick={() => {
              setShowSidebar(!showSidebar);
            }}
          >
            <MenuIcon />
          </IconButton> */}
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
        </Box>

        <Box
          sx={{
            height: "78vh",
            // overflowY: "auto",
            p: 2,
            display: "flex",
            // flexDirection: "column",
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
          ) : messageGroups[0]?.length === 0 ? ( // ADD THIS NEW CONDITION
            <Box sx={{ textAlign: "center", py: 12, color: "text.secondary" }}>
              <Avatar
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
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Welcome to the AI Chatbot!
              </Typography>
              <Typography variant="body2">
                Start a conversation by typing a message below.
              </Typography>
            </Box>
          ) : (
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
                      }}
                    >
                      <Typography variant="caption">You</Typography>
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
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        color: "text.secondary",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Logo />
                        <Typography variant="caption">AI Assistant</Typography>
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
                        alignItems={"flex-end"}
                      >
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.6, marginBottom: 0.5 }}
                        >
                          {group.time}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {group.responses.length > 1 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => navigateResponse(idx, "prev")}
                                disabled={
                                  group.currentSlide <= 0 ||
                                  group.isTyping ||
                                  isRegenerating
                                }
                              >
                                <ChevronLeftIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="caption">
                                {group.currentSlide + 1}/
                                {group.responses.length}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => navigateResponse(idx, "next")}
                                disabled={
                                  group.currentSlide >=
                                    group.responses.length - 1 ||
                                  group.isTyping ||
                                  isRegenerating
                                }
                              >
                                <ChevronRightIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                          <Button
                            size="small"
                            startIcon={<AutorenewIcon fontSize="small" />}
                            onClick={() => regenerateMessage(group)}
                            disabled={
                              isSending ||
                              isTypingResponse ||
                              isRegenerating ||
                              isRegeneratingResponse
                            }
                            sx={{
                              color: "text.secondary",
                              "&:hover": { color: "#2F67F6" },
                              minWidth: 0,
                            }}
                          ></Button>
                          <Box
                            sx={{
                              display: "flex",
                              gap: "16px",
                              alignItems: "center",
                              color: "gray",
                            }}
                          >
                            <ThumbUpAltOutlinedIcon
                              sx={{ cursor: "pointer", fontSize: 20 }}
                            />
                            <ThumbDownAltOutlinedIcon
                              sx={{ cursor: "pointer", fontSize: 20 }}
                            />
                            {group.isBeingProcessed && (
                              <StopOutlinedIcon
                                sx={{
                                  cursor: "pointer",
                                  fontSize: 25,
                                  color: group.isBeingProcessed
                                    ? "inherit"
                                    : "rgba(0, 0, 0, 0.26)",
                                }}
                                onClick={stopGeneration}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {(isSending || (isTypingResponse && !isRegeneratingResponse)) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<StopOutlinedIcon />}
              onClick={stopGeneration}
              sx={{
                color: "text.secondary",
                borderColor: "text.secondary",
                textTransform: "none",
              }}
            >
              Stop Response
            </Button>
          </Box>
        )}

        <Box
          sx={{
            height: "50px",
            p: 2,
            borderTop: "1px solid #e0e0e0",
            bgcolor: "#fafafa",
            pb: 0.5,
          }}
        >
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
            disabled={
              isRegenerating ||
              isSending ||
              isTypingResponse ||
              isRegeneratingResponse
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 1 }}>
                    <TextField
                      select
                      size="small"
                      value={maxWords}
                      onChange={(e) => setMaxWords(Number(e.target.value))}
                      sx={{ width: 70 }}
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
                      disabled={
                        !input.trim() ||
                        isSending ||
                        isTypingResponse ||
                        isRegenerating
                      }
                      sx={{
                        "&:disabled": {
                          opacity: 0.5,
                          cursor: "not-allowed",
                        },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
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
        </Box>

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

         
    </Box>
  );
};

export default ChatUI;
