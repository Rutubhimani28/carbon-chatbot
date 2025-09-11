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
//   FormControl,
//   InputLabel,
//   Select,
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
// import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";

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
//   const [showSidebar, setShowSidebar] = useState(true);
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
//   const [skipHistoryLoad, setSkipHistoryLoad] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [selectedBot, setSelectedBot] = useState("gpt-3.5");

//   // Add this function to generate a unique session ID
//   const generateSessionId = () => {
//     return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

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

//   // const scrollToBottom = useCallback(() => {
//   //   setTimeout(() => {
//   //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   //   }, 100);
//   // }, []);
//   const scrollToBottom = useCallback(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, []);

//   const currentTime = () =>
//     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
//       console.log("API Response:", data);

//       // Adjust this based on the actual response structure from your API
//       if (data.response && data.response.length > 0) {
//         // Check if the response structure matches your original API
//         let sessions = [];

//         // Try different response structures
//         if (data.response[0] && data.response[0].user_sessions) {
//           // Original structure from testcohere.fanisko.com
//           sessions = data.response[0].user_sessions.map((session) => ({
//             id: session.session_id,
//             name:
//               session.session_heading ||
//               `Chat ${session.session_id.slice(0, 8)}`,
//             sessionId: session.session_id,
//             createTime: session.create_time || new Date().toISOString(),
//           }));
//         } else {
//           // New structure from local API
//           sessions = data.response.map((session) => ({
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
//           }));
//         }

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
//         body: JSON.stringify({ sessionId, email: "chiraaag.korat@gmail.com" }),
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

//   // useEffect(() => {
//   //   if (!historyLoading && messageGroups.length > 0) {
//   //     scrollToBottom();
//   //   }
//   // }, [historyLoading, messageGroups, scrollToBottom]);
//   useEffect(() => {
//     if (!historyLoading && messageGroups.length > 0) {
//       scrollToBottom();
//     }
//   }, [historyLoading, messageGroups, scrollToBottom]);

//   useEffect(() => {
//     fetchChatSessions();
//   }, []);

//   // useEffect(() => {
//   //   if (selectedChatId && chats.length > 0) {
//   //     const selectedChat = chats.find((chat) => chat.id === selectedChatId);
//   //     if (selectedChat) {
//   //       loadChatHistory(selectedChat.sessionId);
//   //     }
//   //   }
//   // }, [selectedChatId, chats]);

//   // Modify the useEffect that loads chat history
//   useEffect(() => {
//     if (skipHistoryLoad) {
//       setSkipHistoryLoad(false);
//       return;
//     }

//     if (selectedChatId && chats.length > 0) {
//       const selectedChat = chats.find((chat) => chat.id === selectedChatId);
//       if (selectedChat && selectedChat.sessionId) {
//         loadChatHistory(selectedChat.sessionId);
//       } else {
//         // This is a new chat with no session ID yet
//         setMessageGroups([[]]);
//       }
//     }
//   }, [selectedChatId, chats, skipHistoryLoad]);

// // const loadChatHistory = async (sessionId) => {
// //   if (!sessionId) {
// //     setMessageGroups([[]]); // koi history nathi
// //     return;
// //   }
// //   setHistoryLoading(true);
// //   const rawHistory = await getChatHistory(sessionId);

// //   // Process the API response to match our UI structure
// //   const processedGroups = [];

// //   // Group messages by prompt and collect all responses
// //   const promptGroups = {};

// //   for (let i = 0; i < rawHistory.length; i++) {
// //     const message = rawHistory[i];

// //     if (message.role === "user") {
// //       // Find the next model response
// //       const modelResponse =
// //         rawHistory[i + 1]?.role === "model" ? rawHistory[i + 1] : null;

// //       if (modelResponse) {
// //         const prompt = message.content;

// //         // If we already have this prompt, add the response to the existing group
// //         if (promptGroups[prompt]) {
// //           promptGroups[prompt].responses.push(modelResponse.content.replace(/\n\n/g, "<br/>"));
// //         } else {
// //           // Create a new group for this prompt
// //           promptGroups[prompt] = {
// //             prompt: prompt,
// //             responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
// //             time: currentTime(),
// //             currentSlide: 0,
// //             isTyping: false,
// //             isComplete: true,
// //           };
// //         }

// //         i++; // Skip the model response in the next iteration
// //       }
// //     }
// //   }

// //   // Convert the grouped object to an array
// //   for (const prompt in promptGroups) {
// //     processedGroups.push(promptGroups[prompt]);
// //   }

// //   setMessageGroups([processedGroups]);
// //   setHistoryLoading(false);
// //   setTimeout(() => {
// //     scrollToBottom();
// //   }, 200);
// // };
// const loadChatHistory = async (sessionId) => {
//   if (!sessionId) {
//     setMessageGroups([[]]); // koi history nathi
//     return;
//   }
//   setHistoryLoading(true);

//   // First check if we have any history in localStorage
//   const localHistory = JSON.parse(localStorage.getItem(sessionId) || "[]");

//   if (localHistory.length > 0) {
//     // Use localStorage history if available
//     setMessageGroups([localHistory]);
//     setHistoryLoading(false);
//     setTimeout(() => {
//       scrollToBottom();
//     }, 200);
//     return;
//   }

//   // If no localStorage history, get from API
//   const rawHistory = await getChatHistory(sessionId);

//   // Process the API response to match our UI structure
//   const processedGroups = [];

//   for (let i = 0; i < rawHistory.length; i++) {
//     const message = rawHistory[i];

//     if (message.role === "user") {
//       // Find the next model response
//       const modelResponse =
//         rawHistory[i + 1]?.role === "model" ? rawHistory[i + 1] : null;

//       if (modelResponse) {
//         processedGroups.push({
//           prompt: message.content,
//           responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
//           time: currentTime(),
//           currentSlide: 0,
//           isTyping: false,
//           isComplete: true,
//         });
//         i++; // Skip the model response in the next iteration
//       }
//     }
//   }

//   setMessageGroups([processedGroups]);
//   setHistoryLoading(false);
//   setTimeout(() => {
//     scrollToBottom();
//   }, 200);
// };

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

//       return {
//         response: data.response.replace(/\n\n/g, "<br/>"),
//         sessionId: data.sessionId, // This will be the new session ID from the server
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

//   // const handleSend = async () => {
//   //   if (!input.trim() || isSending) return;

//   //   isStoppedRef.current = false;
//   //   const prompt = input;
//   //   setInput("");
//   //   setIsSending(true);
//   //   setIsTypingResponse(true);
//   //   setIsRegeneratingResponse(true);
//   //   setIsStopped(false);
//   //   setShowSidebar(false);

//   //   let currentSessionId = selectedChatId
//   //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//   //     : "";

//   //   // If no session ID exists, create a new one
//   //   if (!currentSessionId) {
//   //     currentSessionId = generateSessionId();

//   //     // Create a new chat session
//   //     const newChat = {
//   //       id: currentSessionId,
//   //       name: `Chat ${chats.length + 1}`,
//   //       sessionId: currentSessionId,
//   //       createTime: new Date().toISOString(),
//   //     };

//   //     setChats((prev) => [newChat, ...prev]);
//   //     setSelectedChatId(currentSessionId);
//   //     localStorage.setItem("lastChatSessionId", currentSessionId);
//   //   }

//   //   setMessageGroups((prev) => {
//   //     const updated = [...prev];
//   //     const chatGroups = updated[0] || [];
//   //     chatGroups.push({
//   //       prompt,
//   //       responses: ["Thinking..."],
//   //       time: currentTime(),
//   //       currentSlide: 0,
//   //       isTyping: true,
//   //       isComplete: true,
//   //     });
//   //     return updated;
//   //   });

//   //   try {
//   //     const result = await fetchChatbotResponse(prompt, currentSessionId);
//   //     if (isStoppedRef.current || !result) return;

//   //     const chars = result.response.split("");
//   //     let currentText = "";

//   //     for (let i = 0; i < chars.length; i++) {
//   //       if (isStoppedRef.current) break;

//   //       currentText += chars[i];

//   //       setMessageGroups((prev) => {
//   //         const updated = [...prev];
//   //         const chatGroups = updated[0] || [];
//   //         const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
//   //         if (groupIndex !== -1) {
//   //           chatGroups[groupIndex] = {
//   //             ...chatGroups[groupIndex],
//   //             responses: [currentText],
//   //             isTyping: !isStoppedRef.current,
//   //             isComplete: !isStoppedRef.current,
//   //           };
//   //         }
//   //         return updated;
//   //       });

//   //       await new Promise((resolve) => setTimeout(resolve, 25));
//   //     }
//   //   } catch (error) {
//   //     console.error("Failed to send message:", error);
//   //     setMessageGroups((prev) => {
//   //       const updated = [...prev];
//   //       const chatGroups = updated[0] || [];
//   //       const groupIndex = chatGroups.findIndex((g) => g.prompt === prompt);
//   //       if (groupIndex !== -1) {
//   //         chatGroups[groupIndex] = {
//   //           ...chatGroups[groupIndex],
//   //           isTyping: false,
//   //           isComplete: false,
//   //           responses: ["Sorry, something went wrong."],
//   //         };
//   //       }
//   //       return updated;
//   //     });
//   //   } finally {
//   //     setIsSending(false);
//   //     setIsTypingResponse(false);
//   //     setIsRegeneratingResponse(false);
//   //     scrollToBottom();
//   //   }
//   // };
//   // Modify the handleSend function to update the session ID after first response

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

//     let currentSessionId = selectedChatId
//       ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//       : "";

//     // Add new message group
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

//       // If this was a new chat with no session ID, update it with the one from the response
//       if (!currentSessionId && result.sessionId) {
//         setChats((prev) => {
//           const updatedChats = [...prev];
//           const chatIndex = updatedChats.findIndex(
//             (chat) => chat.id === selectedChatId
//           );
//           if (chatIndex !== -1) {
//             updatedChats[chatIndex] = {
//               ...updatedChats[chatIndex],
//               sessionId: result.sessionId,
//             };
//           }
//           return updatedChats;
//         });

//         // Update the selected chat's session ID
//         currentSessionId = result.sessionId;
//       }

//       // Type out response character by character
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

//   // const createNewChat = () => {
//   //   const newSessionId = generateSessionId();
//   //   const newChat = {
//   //     id: newSessionId,
//   //     name: `Chat ${chats.length + 1}`,
//   //     sessionId: newSessionId,
//   //     createTime: new Date().toISOString(),
//   //   };

//   //   setChats((prev) => [newChat, ...prev]);
//   //   setSelectedChatId(newSessionId);
//   //   localStorage.setItem("lastChatSessionId", newSessionId);
//   //   setMessageGroups([[]]);
//   //   setShowSidebar(false);
//   // };

//   const createNewChat = () => {
//     const newChat = {
//       id: `temp_${Date.now()}`, // temporary ID for UI
//       name: `Chat ${chats.length + 1}`,
//       sessionId: "", // blank session ID
//       createTime: new Date().toISOString(),
//     };

//     setChats((prev) => [newChat, ...prev]);
//     setSkipHistoryLoad(true); // prevent history load
//     setSelectedChatId(newChat.id);
//     localStorage.setItem("lastChatSessionId", newChat.id);
//     setMessageGroups([[]]); // reset messages
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
//     <Box
//       sx={{
//         display: "flex",
//         height: "98.2vh",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* Sidebar */}
//       {/* {showSidebar && ( */}
//       <Box
//         sx={{
//           width: isCollapsed ? 60 : 290,
//           bgcolor: "#f5f5f5",
//           height: "100vh",
//           // overflowY: "auto",
//           flexShrink: 0,
//           transition: "width 0.3s ease",
//           boxShadow: { xs: 3, md: 0 },
//           display: "flex",
//           flexDirection: "column",
//           alignItems: isCollapsed ? "center" : "flex-start",
//         }}
//       >
//         {/* Sidebar Header */}

//         {/* Sidebar Body */}
//         {isCollapsed ? (
//           // Collapsed Mode: only icons
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
//             <MenuIcon
//               style={{ cursor: "pointer" }}
//               // onClick={() => setShowSidebar(false)}
//               onClick={() => setIsCollapsed(false)}
//             />
//             <AddIcon onClick={createNewChat} style={{ cursor: "pointer" }} />
//             <SearchIcon style={{ cursor: "pointer" }} />
//           </Box>
//         ) : (
//           <>
//             {/* 🔹 Fixed Header Section */}
//             <Box
//               sx={{
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 2,
//                 bgcolor: "#f5f5f5",
//                 borderBottom: "1px solid #e0e0e0",
//                 pb: 1,
//               }}
//             >
//               {/* Header */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   gap: 1,
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   // px: 1,
//                   pt: 1,
//                 }}
//               >
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <IconButton>
//                     <MenuIcon />
//                   </IconButton>
//                   <Typography className="text-xl font-medium text-gray-900">
//                     Chatbot
//                   </Typography>
//                 </Box>
//                 <IconButton onClick={() => setIsCollapsed(true)}>
//                   <FeaturedPlayListOutlinedIcon />
//                 </IconButton>
//               </Box>

//               {/* New Chat */}
//               <Box
//                 sx={{ display: "flex", alignItems: "center", pt: 1, pl: 1 }}
//                 onClick={createNewChat}
//               >
//                 <AddIcon />
//                 <Button
//                   fullWidth
//                   // onClick={createNewChat}
//                   sx={{
//                     justifyContent: "flex-start",
//                     color: "black",
//                     textTransform: "none",
//                     "&:hover": { bgcolor: "#f5f5f5", color: "black" },
//                   }}
//                 >
//                   New Chat
//                 </Button>
//               </Box>

//               {/* Search */}
//               <Box
//                 sx={{
//                   py: 2,
//                   pb: 0.5,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 0.5,
//                   pl: 1,
//                 }}
//               >
//                 <SearchIcon />
//                 <TextField
//                   // fullWidth
//                   placeholder="Search chats..."
//                   variant="outlined"
//                   size="small"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "5px",
//                       backgroundColor: "#fff",
//                       width: "248px",
//                     },
//                   }}
//                 />
//               </Box>
//             </Box>

//             {/* sidebar chat list */}
//             <Box
//               sx={{
//                 overflowY: "auto",
//                 height: "calc(100vh - 120px)",
//                 px: 1,
//                 mt: 2,
//                 width: "100%",
//               }}
//             >
//               {sessionLoading ? (
//                 <div>
//                   {[...Array(7)].map((_, i) => (
//                     <Box key={i}>
//                       <Skeleton sx={{ width: "100%", p: 3 }} />
//                     </Box>
//                   ))}
//                 </div>
//               ) : (
//                 <List>
//                   {filteredChats
//                     ?.filter((item) => item?.name)
//                     .map((chat) => (
//                       <ListItemButton
//                         key={chat.id}
//                         selected={chat.id === selectedChatId}
//                         onClick={() => {
//                           setSelectedChatId(chat.id);
//                           localStorage.setItem("lastChatSessionId", chat.id);
//                           loadChatHistory(chat.sessionId);
//                           setShowSidebar(false);
//                         }}
//                         className={`cursor-pointer transition-colors ${
//                           chat.id === selectedChatId
//                             ? "bg-blue-50 border-blue-200"
//                             : "hover:bg-gray-50"
//                         }`}
//                         sx={{
//                           borderRadius: 1.5,
//                           my: 0.8,
//                           backgroundColor:
//                             chat.id === selectedChatId ? "#e3f2fd" : "#fff",
//                           border:
//                             chat.id === selectedChatId
//                               ? "1px solid #3067f6"
//                               : "1px solid #80808052",
//                           "&:hover": {
//                             backgroundColor:
//                               chat.id === selectedChatId
//                                 ? "#e3f2fd"
//                                 : "rgba(0, 0, 0, 0.04)",
//                           },
//                         }}
//                       >
//                         <ListItemText
//                           primary={chat.name.replace(/\b\w/g, (char) =>
//                             char.toUpperCase()
//                           )}
//                           secondary={formatChatTime(new Date(chat.createTime))}
//                         />
//                       </ListItemButton>
//                     ))}
//                 </List>
//               )}
//             </Box>
//             {/* </Box> */}
//           </>
//         )}
//       </Box>
//       {/* )} */}

//       <Box
//         sx={{
//           mt: 3,
//           // bgcolor: "#fafafa",
//           ml: 2,
//           flexShrink: 0, // 🔹 prevent shrinking
//         }}
//       >
//         <FormControl fullWidth size="small">
//           {/* <InputLabel id="bot-select-label">Chatbot</InputLabel> */}
//           <Select
//             labelId="bot-select-label"
//             value={selectedBot}
//             onChange={(e) => setSelectedBot(e.target.value)}
//             sx={{ bgcolor: "#fff", borderRadius: "5px" }}
//           >
//             <MenuItem value="gpt-3.5">OpenAI GPT-3.5</MenuItem>
//             <MenuItem value="gpt-4">OpenAI GPT-4</MenuItem>
//             <MenuItem value="assistant-x">Assistant X</MenuItem>
//             <MenuItem value="custom-ai">Custom AI Bot</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//       <Box
//         sx={{
//           flexGrow: 1,
//           display: "flex",
//           flexDirection: "column",
//           transition: "all 0.3s ease",
//           // px:50,
//           width: "100%", //   full responsive width
//           maxWidth: "900px", //   optional: max limit
//           mx: "auto", //   center align if maxWidth set
//           px: { xs: 6, sm: 8, md: 10, lg: 12 }, //   responsive padding
//           height: "100vh",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             p: 2,
//             borderBottom: "1px solid #e0e0e0",
//             height: "64px",
//           }}
//         >
//           {/* <IconButton
//             onClick={() => {
//               setShowSidebar(!showSidebar);
//             }}
//           >
//             <MenuIcon />
//           </IconButton> */}
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

//         <Box
//           sx={{
//             height: "78vh",
//             // overflowY: "auto",
//             p: 2,
//             display: "flex",
//             flexDirection: "column",
//             flexGrow: 1,
//             overflow: "auto",
//           }}
//         >
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
//           ) : messageGroups[0]?.length === 0 ? ( // ADD THIS NEW CONDITION
//             <Box sx={{ textAlign: "center", py: 12, color: "text.secondary" }}>
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
//                 Welcome to the AI Chatbot!
//               </Typography>
//               <Typography variant="body2">
//                 Start a conversation by typing a message below.
//               </Typography>
//             </Box>
//           ) : (
//             <Box sx={{ spaceY: 6, width: "100%" }}>
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
//               <div ref={messagesEndRef} />
//             </Box>
//           )}
//           {/* <div ref={messagesEndRef} /> */}
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
//             height: "50px",
//             p: 2,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             borderTop: "1px solid #e0e0e0",
//             bgcolor: "#fafafa",
//             pb: 0.5,
//           }}
//         >
//           {/* Main Input */}
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

//           <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
//             {/* Round Dropdown */}
//             <TextField
//               select
//               size="small"
//               value={maxWords}
//               onChange={(e) => setMaxWords(Number(e.target.value))}
//               sx={{
//                 width: 80,
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "25px", // round box
//                   backgroundColor: "#fff",
//                   textAlign: "center",
//                 },
//               }}
//               SelectProps={{
//                 MenuProps: {
//                   disablePortal: true,
//                   PaperProps: {
//                     style: {
//                       maxHeight: 200,
//                     },
//                   },
//                 },
//               }}
//             >
//               {[5, 10, 15, 20, 25, 50].map((num) => (
//                 <MenuItem key={num} value={num}>
//                   {num}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <IconButton
//               onClick={() => handleSend()}
//               disabled={
//                 !input.trim() || isSending || isTypingResponse || isRegenerating
//               }
//               sx={{
//                 "&:disabled": {
//                   opacity: 0.5,
//                   cursor: "not-allowed",
//                 },
//               }}
//             >
//               <SendIcon />
//             </IconButton>
//           </Box>
//         </Box>

//         <Box textAlign="center">
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

// ------------------------------------------------------------------------------------------------------------------------------

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   TextField,
//   Avatar,
//   List,
//   ListItemText,
//   Divider,
//   Button,
//   Paper,
//   FormControl,
//   Select,
//   ListItemButton,
//   CircularProgress,
//   Skeleton,
//   MenuItem,
//   Popover,
// } from "@mui/material";
// import {
//   Menu as MenuIcon,
//   Add as AddIcon,
//   Send as SendIcon,
//   ChevronLeft as ChevronLeftIcon,
//   ChevronRight as ChevronRightIcon,
//   Search as SearchIcon,
// } from "@mui/icons-material";
// import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";
// import KeyboardArrowDownTwoToneIcon from "@mui/icons-material/KeyboardArrowDownTwoTone";

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
//   const [showSidebar, setShowSidebar] = useState(true);
//   const [chats, setChats] = useState([]);
//   const [selectedChatId, setSelectedChatId] = useState("");
//   const [sessionLoading, setSessionLoading] = useState(false);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [messageGroups, setMessageGroups] = useState([]);
//   const [isSending, setIsSending] = useState(false);
//   const [isTypingResponse, setIsTypingResponse] = useState(false);
//   const messagesEndRef = useRef(null);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const abortControllerRef = useRef(null);
//   const isStoppedRef = useRef(false);
//   const [maxWords, setMaxWords] = useState(10);
//   const [skipHistoryLoad, setSkipHistoryLoad] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [selectedBot, setSelectedBot] = useState("gpt-3.5");
//   // State for popover (add these at top of ChatUI)
//   // const open = Boolean(anchorEl);

//   const [anchorEl, setAnchorEl] = useState(null);
//   const [activeGroup, setActiveGroup] = useState(null);

//   const handleClick = (event, idx) => {
//     setAnchorEl(event.currentTarget);
//     setActiveGroup(idx);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//     setActiveGroup(null);
//   };

//   // Add this function to generate a unique session ID
//   const generateSessionId = () => {
//     return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   // useEffect(() => {
//   //   const lastSessionId = localStorage.getItem("lastChatSessionId");
//   //   if (lastSessionId && chats.length > 0) {
//   //     const lastSession = chats.find((chat) => chat.id === lastSessionId);
//   //     if (lastSession) {
//   //       setSelectedChatId(lastSessionId);
//   //       loadChatHistory(lastSession.sessionId);
//   //     }
//   //   }
//   //   setInitialLoad(false);
//   // }, [chats]);
// useEffect(() => {
//   const lastSessionId = localStorage.getItem("lastChatSessionId");

//   if (lastSessionId) {
//     setSelectedChatId(lastSessionId);

//     // 👉 Define lastSession here
//     const lastSession = chats.find((chat) => chat.sessionId === lastSessionId);

//     if (lastSession) {
//       loadChatHistory(lastSession.sessionId);

//       // 👉 Restore tokens here
//       const savedTokens = localStorage.getItem(`tokens_${lastSession.sessionId}`);
//       if (savedTokens) {
//         console.log("Restored tokens:", savedTokens);
//         // optional: state ma set karvo
//         // setRemainingTokens(Number(savedTokens));
//       }
//     }
//   }
// }, [chats]);

//   useEffect(() => {
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   const scrollToBottom = useCallback(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, []);

//   const currentTime = () =>
//     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   // const fetchChatSessions = async () => {
//   //   setSessionLoading(true);
//   //   try {
//   //     const response = await fetch(
//   //       "http://localhost:8080/api/ai/get_user_sessions",
//   //       {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({ email: "chiraaag.korat@gmail.com" }),
//   //       }
//   //     );

//   //     if (!response.ok) {
//   //       throw new Error(`HTTP error! status: ${response.status}`);
//   //     }

//   //     const data = await response.json();
//   //     console.log("API Response:", data);

//   //     // Adjust this based on the actual response structure from your API
//   //     if (data.response && data.response.length > 0) {
//   //       // Check if the response structure matches your original API
//   //       let sessions = [];

//   //       // Try different response structures
//   //       if (data.response[0] && data.response[0].user_sessions) {
//   //         // Original structure from testcohere.fanisko.com
//   //         sessions = data.response[0].user_sessions.map((session) => ({
//   //           id: session.session_id,
//   //           name:
//   //             session.session_heading ||
//   //             `Chat ${session.session_id.slice(0, 8)}`,
//   //           sessionId: session.session_id,
//   //           createTime: session.create_time || new Date().toISOString(),
//   //         }));
//   //       } else {
//   //         // New structure from local API
//   //         sessions = data.response.map((session) => ({
//   //           id: session.session_id,
//   //           name:
//   //             session.session_heading ||
//   //             session.name ||
//   //             `Chat ${session.session_id.slice(0, 8)}`,
//   //           sessionId: session.session_id,
//   //           createTime:
//   //             session.create_time ||
//   //             session.createTime ||
//   //             new Date().toISOString(),
//   //         }));
//   //       }

//   //       setChats(sessions);

//   //       if (initialLoad) {
//   //         const lastSessionId = localStorage.getItem("lastChatSessionId");
//   //         if (lastSessionId && sessions.some((s) => s.id === lastSessionId)) {
//   //           setSelectedChatId(lastSessionId);
//   //           loadChatHistory(lastSessionId);
//   //         }
//   //       }
//   //     }
//   //     return [];
//   //   } catch (error) {
//   //     console.error("API Error:", error);
//   //     return [];
//   //   } finally {
//   //     setSessionLoading(false);
//   //   }
//   // };

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
//       console.log("API Response:", data);

//       // Process the sessions based on API response
//       let sessions = [];

//       // if (data.response && Array.isArray(data.response)) {
//       //   // Handle different response structures
//       //   if (data.response[0] && data.response[0].user_sessions) {
//       //     // Original structure
//       //     sessions = data.response[0].user_sessions.map((session) => ({
//       //       id: session.session_id,
//       //       name:
//       //         session.session_heading ||
//       //         `Chat ${session.session_id.slice(0, 8)}`,
//       //       sessionId: session.session_id,
//       //       createTime: session.create_time || new Date().toISOString(),
//       //     }));
//       //   } else {
//       //     // New structure
//       //     sessions = data.response.map((session) => ({
//       //       id: session.session_id,
//       //       name:
//       //         session.session_heading ||
//       //         session.name ||
//       //         `Chat ${session.session_id.slice(0, 8)}`,
//       //       sessionId: session.session_id,
//       //       createTime:
//       //         session.create_time ||
//       //         session.createTime ||
//       //         new Date().toISOString(),
//       //     }));
//       //   }
//       // }
//       if (data.response && Array.isArray(data.response)) {
//         if (data.response[0] && data.response[0].user_sessions) {
//           sessions = data.response[0].user_sessions.map((session) => {
//             // save token count to localStorage
//             if (session.remainingTokens !== undefined) {
//               localStorage.setItem(
//                 `tokens_${session.session_id}`,
//                 session.remainingTokens.toString()
//               );
//             }
//             return {
//               id: session.session_id,
//               name:
//                 session.session_heading ||
//                 `Chat ${session.session_id.slice(0, 8)}`,
//               sessionId: session.session_id,
//               createTime: session.create_time || new Date().toISOString(),
//             };
//           });
//         } else {
//           sessions = data.response.map((session) => {
//             if (session.remainingTokens !== undefined) {
//               localStorage.setItem(
//                 `tokens_${session.session_id}`,
//                 session.remainingTokens.toString()
//               );
//             }
//             return {
//               id: session.session_id,
//               name:
//                 session.session_heading ||
//                 session.name ||
//                 `Chat ${session.session_id.slice(0, 8)}`,
//               sessionId: session.session_id,
//               createTime:
//                 session.create_time ||
//                 session.createTime ||
//                 new Date().toISOString(),
//             };
//           });
//         }
//       }

//       setChats(sessions);

//       // Select the first chat if none is selected
//       if (initialLoad && sessions.length > 0 && !selectedChatId) {
//         const firstSessionId = sessions[0].id;
//         setSelectedChatId(firstSessionId);
//         localStorage.setItem("lastChatSessionId", firstSessionId);
//         loadChatHistory(sessions[0].sessionId);
//       }
//     } catch (error) {
//       console.error("API Error:", error);
//     } finally {
//       setSessionLoading(false);
//       setInitialLoad(false);
//     }
//   };

//   const getChatHistory = async (sessionId) => {
//     try {
//       const response = await fetch("http://localhost:8080/api/ai/history", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sessionId, email: "chiraaag.korat@gmail.com" }),
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
//     if (!historyLoading && messageGroups.length > 0) {
//       scrollToBottom();
//     }
//   }, [historyLoading, messageGroups, scrollToBottom]);

//   useEffect(() => {
//     fetchChatSessions();
//   }, []);

//   // useEffect(() => {
//   //   if (skipHistoryLoad) {
//   //     setSkipHistoryLoad(false);
//   //     return;
//   //   }

//   //   if (selectedChatId) {
//   //     const selectedChat = chats.find((chat) => chat.id === selectedChatId);
//   //     if (selectedChat) {
//   //       if (selectedChat.sessionId) {
//   //         loadChatHistory(selectedChat.sessionId);
//   //       } else {
//   //         // This is a new chat with no session ID yet
//   //         setMessageGroups([[]]);
//   //       }
//   //     }
//   //   }
//   // }, [selectedChatId, chats, skipHistoryLoad]);

//   // const loadChatHistory = async (sessionId) => {
//   //   if (!sessionId) {
//   //     setMessageGroups([[]]);
//   //     return;
//   //   }
//   //   setHistoryLoading(true);

//   //   // First check localStorage
//   //   const localHistory = JSON.parse(localStorage.getItem(sessionId) || "[]");
//   //   if (localHistory.length > 0) {
//   //     setMessageGroups([localHistory]);
//   //     setHistoryLoading(false);
//   //     setTimeout(() => scrollToBottom(), 200);
//   //     return;
//   //   }

//   //   // Fetch from API
//   //   const rawHistory = await getChatHistory(sessionId);

//   //   // ✅ Filter only messages belonging to this session
//   //   const sessionHistory = rawHistory.filter(
//   //     (msg) => msg.session_id === sessionId
//   //   );

//   //   const processedGroups = [];
//   //   for (let i = 0; i < sessionHistory.length; i++) {
//   //     const message = sessionHistory[i];

//   //     if (message.role === "user") {
//   //       const modelResponse =
//   //         sessionHistory[i + 1]?.role === "model"
//   //           ? sessionHistory[i + 1]
//   //           : null;

//   //       if (modelResponse) {
//   //         processedGroups.push({
//   //           prompt: message.content,
//   //           responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
//   //           time: currentTime(),
//   //           currentSlide: 0,
//   //           isTyping: false,
//   //           isComplete: true,
//   //         });
//   //         i++; // Skip model message
//   //       }
//   //     }
//   //   }

//   //   setMessageGroups([processedGroups]);
//   //   setHistoryLoading(false);
//   //   setTimeout(() => scrollToBottom(), 200);
//   // };
//   useEffect(() => {
//     if (skipHistoryLoad) {
//       setSkipHistoryLoad(false);
//       return;
//     }

//     if (selectedChatId) {
//       const selectedChat = chats.find((chat) => chat.id === selectedChatId);
//       if (selectedChat) {
//         if (selectedChat.sessionId) {
//           loadChatHistory(selectedChat.sessionId);

//           // Load the latest token count for this session
//           const savedTokens = localStorage.getItem(
//             `tokens_${selectedChatId.sessionId}`
//           );
//           if (savedTokens) {
//             // You might want to store this in state to show in UI
//             console.log("Current tokens:", savedTokens);
//           }
//         } else {
//           setMessageGroups([[]]);
//         }
//       }
//     }
//   }, [selectedChatId, chats, skipHistoryLoad]);

//   const loadChatHistory = async (sessionId) => {
//     if (!sessionId) {
//       setMessageGroups([[]]);
//       return;
//     }

//     setHistoryLoading(true);

//     try {
//       // Fetch from API
//       const rawHistory = await getChatHistory(sessionId);

//       // Load token count from localStorage
//       const savedTokens = localStorage.getItem(`tokens_${sessionId}`);
//       const tokenCount = savedTokens ? parseInt(savedTokens) : null;

//       // Process the history into message groups
//       const processedGroups = [];

//       for (let i = 0; i < rawHistory.length; i++) {
//         const message = rawHistory[i];

//         if (message.role === "user") {
//           // Find the corresponding model response
//           let modelResponse = null;
//           let j = i + 1;

//           while (j < rawHistory.length && rawHistory[j].role !== "user") {
//             if (rawHistory[j].role === "model") {
//               modelResponse = rawHistory[j];
//               break;
//             }
//             j++;
//           }

//           if (modelResponse) {
//             processedGroups.push({
//               prompt: message.content,
//               responses: [modelResponse.content.replace(/\n\n/g, "<br/>")],
//               time: new Date(
//                 message.timestamp || message.create_time || Date.now()
//               ).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }),
//               currentSlide: 0,
//               isTyping: false,
//               isComplete: true,
//               usageTokens: tokenCount, // Add token count to each message group
//             });
//           } else {
//             // Handle case where there's a user message but no response yet
//             processedGroups.push({
//               prompt: message.content,
//               responses: ["No response available"],
//               time: new Date(
//                 message.timestamp || message.create_time || Date.now()
//               ).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }),
//               currentSlide: 0,
//               isTyping: false,
//               isComplete: true,
//             });
//           }
//         }
//       }

//       setMessageGroups([processedGroups]);
//     } catch (error) {
//       console.error("Error loading chat history:", error);
//       setMessageGroups([[]]);
//     } finally {
//       setHistoryLoading(false);
//       setTimeout(() => scrollToBottom(), 200);
//     }
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

//       return {
//         response: data.response.replace(/\n\n/g, "<br/>"),
//         sessionId: data.sessionId, // This will be the new session ID from the server
//         remainingTokens: data.remainingTokens,
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
//   // console.log("remainingTokens<<<<<<<<<<<<<<<<<",remainingTokens);

//   const handleSend = async () => {
//     if (!input.trim() || isSending) return;

//     isStoppedRef.current = false;
//     const prompt = input;
//     setInput("");
//     setIsSending(true);
//     setIsTypingResponse(true);
//     setShowSidebar(false);

//     let currentSessionId = selectedChatId
//       ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
//       : "";

//     // Add new message group
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

//       // Save token count to localStorage
//       if (result.remainingTokens !== undefined) {
//         const storageKey = `tokens_${currentSessionId || result.sessionId}`;
//         localStorage.setItem(storageKey, result.remainingTokens.toString());

//         // also update chat list state so future load shows latest tokens
//         setChats((prev) =>
//           prev.map((chat) =>
//             chat.sessionId === (currentSessionId || result.sessionId)
//               ? { ...chat, remainingTokens: result.remainingTokens }
//               : chat
//           )
//         );
//       }

//       // If this was a new chat with no session ID, update it with the one from the response
//       if (!currentSessionId && result.sessionId) {
//         setChats((prev) => {
//           const updatedChats = [...prev];
//           const chatIndex = updatedChats.findIndex(
//             (chat) => chat.id === selectedChatId
//           );
//           if (chatIndex !== -1) {
//             updatedChats[chatIndex] = {
//               ...updatedChats[chatIndex],
//               sessionId: result.sessionId,
//             };
//           }
//           return updatedChats;
//         });

//         // Update the selected chat's session ID
//         currentSessionId = result.sessionId;
//       }

//       // Type out response character by character
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
//               usageTokens: result.remainingTokens,
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
//       scrollToBottom();
//     }
//   };

//   const createNewChat = () => {
//     const newChat = {
//       id: `temp_${Date.now()}`, // temporary ID for UI
//       name: `Chat ${chats.length + 1}`,
//       sessionId: "", // blank session ID
//       createTime: new Date().toISOString(),
//     };

//     setChats((prev) => [newChat, ...prev]);
//     setSkipHistoryLoad(true); // prevent history load
//     setSelectedChatId(newChat.id);
//     localStorage.setItem("lastChatSessionId", newChat.id);
//     setMessageGroups([[]]); // reset messages
//     setShowSidebar(false);
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
//     <Box
//       sx={{
//         display: "flex",
//         height: "98.2vh",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* Sidebar */}
//       <Box
//         sx={{
//           width: isCollapsed ? 60 : 290,
//           bgcolor: "#f5f5f5",
//           height: "100vh",
//           flexShrink: 0,
//           transition: "width 0.3s ease",
//           boxShadow: { xs: 3, md: 0 },
//           display: "flex",
//           flexDirection: "column",
//           alignItems: isCollapsed ? "center" : "flex-start",
//         }}
//       >
//         {isCollapsed ? (
//           // Collapsed Mode: only icons
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
//             <MenuIcon
//               style={{ cursor: "pointer" }}
//               onClick={() => setIsCollapsed(false)}
//             />
//             <AddIcon onClick={createNewChat} style={{ cursor: "pointer" }} />
//             <SearchIcon style={{ cursor: "pointer" }} />
//           </Box>
//         ) : (
//           <>
//             {/* 🔹 Fixed Header Section */}
//             <Box
//               sx={{
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 2,
//                 bgcolor: "#f5f5f5",
//                 borderBottom: "1px solid #e0e0e0",
//                 pb: 1,
//               }}
//             >
//               {/* Header */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   gap: 1,
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   pt: 1,
//                 }}
//               >
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <IconButton>
//                     <MenuIcon />
//                   </IconButton>
//                   <Typography className="text-xl font-medium text-gray-900">
//                     Chatbot
//                   </Typography>
//                 </Box>
//                 <IconButton onClick={() => setIsCollapsed(true)}>
//                   <FeaturedPlayListOutlinedIcon />
//                 </IconButton>
//               </Box>

//               {/* New Chat */}
//               <Box
//                 sx={{ display: "flex", alignItems: "center", pt: 1, pl: 1 }}
//                 onClick={createNewChat}
//               >
//                 <AddIcon />
//                 <Button
//                   fullWidth
//                   sx={{
//                     justifyContent: "flex-start",
//                     color: "black",
//                     textTransform: "none",
//                     "&:hover": { bgcolor: "#f5f5f5", color: "black" },
//                   }}
//                 >
//                   New Chat
//                 </Button>
//               </Box>

//               {/* Search */}
//               <Box
//                 sx={{
//                   py: 2,
//                   pb: 0.5,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 0.5,
//                   pl: 1,
//                 }}
//               >
//                 <SearchIcon />
//                 <TextField
//                   placeholder="Search chats..."
//                   variant="outlined"
//                   size="small"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "5px",
//                       backgroundColor: "#fff",
//                       width: "248px",
//                     },
//                   }}
//                 />
//               </Box>
//             </Box>

//             {/* sidebar chat list */}
//             <Box
//               sx={{
//                 overflowY: "auto",
//                 height: "calc(100vh - 120px)",
//                 px: 1,
//                 mt: 2,
//                 width: "100%",
//               }}
//             >
//               {sessionLoading ? (
//                 <div>
//                   {[...Array(7)].map((_, i) => (
//                     <Box key={i}>
//                       <Skeleton sx={{ width: "100%", p: 3 }} />
//                     </Box>
//                   ))}
//                 </div>
//               ) : (
//                 <List>
//                   {filteredChats
//                     ?.filter((item) => item?.name)
//                     .map((chat) => (
//                       <ListItemButton
//                         key={chat.id}
//                         selected={chat.id === selectedChatId}
//                         onClick={() => {
//                           setSelectedChatId(chat.id);
//                           localStorage.setItem("lastChatSessionId", chat.id);
//                           loadChatHistory(chat.sessionId);
//                           setShowSidebar(false);
//                         }}
//                         className={`cursor-pointer transition-colors ${
//                           chat.id === selectedChatId
//                             ? "bg-blue-50 border-blue-200"
//                             : "hover:bg-gray-50"
//                         }`}
//                         sx={{
//                           borderRadius: 1.5,
//                           my: 0.8,
//                           backgroundColor:
//                             chat.id === selectedChatId ? "#e3f2fd" : "#fff",
//                           border:
//                             chat.id === selectedChatId
//                               ? "1px solid #3067f6"
//                               : "1px solid #80808052",
//                           "&:hover": {
//                             backgroundColor:
//                               chat.id === selectedChatId
//                                 ? "#e3f2fd"
//                                 : "rgba(0, 0, 0, 0.04)",
//                           },
//                         }}
//                       >
//                         <ListItemText
//                           primary={chat.name.replace(/\b\w/g, (char) =>
//                             char.toUpperCase()
//                           )}
//                           secondary={formatChatTime(new Date(chat.createTime))}
//                         />
//                       </ListItemButton>
//                     ))}
//                 </List>
//               )}
//             </Box>
//           </>
//         )}
//       </Box>

//       <Box
//         sx={{
//           mt: 3,
//           ml: 2,
//           flexShrink: 0,
//         }}
//       >
//         <FormControl fullWidth size="small">
//           <Select
//             labelId="bot-select-label"
//             value={selectedBot}
//             onChange={(e) => setSelectedBot(e.target.value)}
//             sx={{ bgcolor: "#fff", borderRadius: "5px" }}
//           >
//             <MenuItem value="gpt-3.5">OpenAI GPT-3.5</MenuItem>
//             <MenuItem value="gpt-4">OpenAI GPT-4</MenuItem>
//             <MenuItem value="assistant-x">Assistant X</MenuItem>
//             <MenuItem value="custom-ai">Custom AI Bot</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//       <Box
//         sx={{
//           flexGrow: 1,
//           display: "flex",
//           flexDirection: "column",
//           transition: "all 0.3s ease",
//           width: "100%",
//           maxWidth: "900px",
//           mx: "auto",
//           px: { xs: 6, sm: 8, md: 10, lg: 12 },
//           height: "100vh",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             p: 2,
//             borderBottom: "1px solid #e0e0e0",
//             height: "64px",
//           }}
//         >
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

//         <Box
//           sx={{
//             height: "78vh",
//             p: 2,
//             display: "flex",
//             flexDirection: "column",
//             flexGrow: 1,
//             overflow: "auto",
//           }}
//         >
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
//           ) : messageGroups[0]?.length === 0 ? (
//             <Box sx={{ textAlign: "center", py: 12, color: "text.secondary" }}>
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
//                 Welcome to the AI Chatbot!
//               </Typography>
//               <Typography variant="body2">
//                 Start a conversation by typing a message below.
//               </Typography>
//             </Box>
//           ) : (
//             <Box sx={{ spaceY: 6, width: "100%" }}>
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
//                         alignItems="flex-end"
//                       >
//                         {/* Time on left */}
//                         <Typography
//                           variant="caption"
//                           sx={{ opacity: 0.6, mb: 0.5 }}
//                         >
//                           {group.time}
//                         </Typography>

//                         {/* Icon on right */}
//                         <IconButton size="small" onClick={handleClick}>
//                           <KeyboardArrowDownTwoToneIcon fontSize="small" />
//                         </IconButton>

//                         {/* Popover for usage token */}
//                         <Popover
//                           open={open && activeGroup === idx}
//                           anchorEl={anchorEl}
//                           onClose={handleClose}
//                           anchorOrigin={{
//                             vertical: "bottom",
//                             horizontal: "right",
//                           }}
//                           transformOrigin={{
//                             vertical: "top",
//                             horizontal: "right",
//                           }}
//                           PaperProps={{
//                             sx: {
//                               p: 1,
//                               borderRadius: 2,
//                               boxShadow: 3,
//                               minWidth: 140,
//                             },
//                           }}
//                         >
//                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                             Usage Tokens
//                           </Typography>
//                           <Typography
//                             variant="caption"
//                             sx={{ color: "text.secondary" }}
//                           >
//                             {group.usageTokens !== undefined
//                               ? group.usageTokens
//                               : "N/A"}
//                           </Typography>
//                         </Popover>
//                       </Box>

//                       {/* <Box
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
//                       </Box> */}
//                     </Paper>
//                   </Box>
//                 </Box>
//               ))}
//               <div ref={messagesEndRef} />
//             </Box>
//           )}
//         </Box>

//         <Box
//           sx={{
//             height: "50px",
//             p: 2,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             borderTop: "1px solid #e0e0e0",
//             bgcolor: "#fafafa",
//             pb: 0.5,
//           }}
//         >
//           {/* Main Input */}
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
//             disabled={isSending || isTypingResponse}
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

//           <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
//             {/* Round Dropdown */}
//             <TextField
//               select
//               size="small"
//               value={maxWords}
//               onChange={(e) => setMaxWords(Number(e.target.value))}
//               sx={{
//                 width: 80,
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "25px",
//                   backgroundColor: "#fff",
//                   textAlign: "center",
//                 },
//               }}
//               SelectProps={{
//                 MenuProps: {
//                   disablePortal: true,
//                   PaperProps: {
//                     style: {
//                       maxHeight: 200,
//                     },
//                   },
//                 },
//               }}
//             >
//               {[5, 10, 15, 20, 25, 50].map((num) => (
//                 <MenuItem key={num} value={num}>
//                   {num}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <IconButton
//               onClick={() => handleSend()}
//               disabled={!input.trim() || isSending || isTypingResponse}
//               sx={{
//                 "&:disabled": {
//                   opacity: 0.5,
//                   cursor: "not-allowed",
//                 },
//               }}
//             >
//               <SendIcon />
//             </IconButton>
//           </Box>
//         </Box>

//         <Box textAlign="center">
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
// --------------------------------------------------------------------------------------

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
import LogoutTwoToneIcon from '@mui/icons-material/LogoutTwoTone';

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

  const fetchChatSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/ai/get_user_sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email}),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Process the sessions based on API response
      let sessions = [];

      if (data.response && Array.isArray(data.response)) {
        if (data.response[0] && data.response[0].user_sessions) {
          sessions = data.response[0].user_sessions.map((session) => {
            // Save token count to localStorage
            if (session.remainingTokens !== undefined) {
              localStorage.setItem(
                `tokens_${session.session_id}`,
                session.remainingTokens.toString()
              );
            }
            return {
              id: session.session_id,
              name:
                session.session_heading ||
                `Chat ${session.session_id.slice(0, 8)}`,
              sessionId: session.session_id,
              createTime: session.create_time || new Date().toISOString(),
              remainingTokens: session.remainingTokens,
            };
          });
        } else {
          sessions = data.response.map((session) => {
            if (session.remainingTokens !== undefined) {
              localStorage.setItem(
                `tokens_${session.session_id}`,
                session.remainingTokens.toString()
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
              remainingTokens: session.remainingTokens,
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
      const response = await fetch("http://localhost:8080/api/ai/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email}),
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

        if (message.role === "user") {
          // Find the corresponding model response
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
              // tokensUsed: message.tokensUsed || null, // Add this line
              tokensUsed: tokensUsed, // Store tokens used
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
      console.log("API Response:", data);
      console.log("Available token fields:", {
        tokensUsed: data.tokensUsed,
        usage: data.usage,
        remainingTokens: data.remainingTokens,
        total_tokens: data.usage?.total_tokens,
      });

      return {
        response: data.response.replace(/\n\n/g, "<br/>"),
        sessionId: data.sessionId, // This will be the new session ID from the server
        remainingTokens: data.remainingTokens,
        tokensUsed: data.tokensUsed || data.usage?.total_tokens || null,
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

  // const handleSend = async () => {
  //   if (!input.trim() || isSending) return;

  //   isStoppedRef.current = false;
  //   const prompt = input;
  //   setInput("");
  //   setIsSending(true);
  //   setIsTypingResponse(true);

  //   let currentSessionId = selectedChatId
  //     ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
  //     : "";

  //   // Add new message group
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

  //     // Save token count to localStorage
  //     if (result.remainingTokens !== undefined) {
  //       const storageKey = `tokens_${currentSessionId || result.sessionId}`;
  //       localStorage.setItem(storageKey, result.remainingTokens.toString());

  //       // also update chat list state so future load shows latest tokens
  //       setChats((prev) =>
  //         prev.map((chat) =>
  //           chat.sessionId === (currentSessionId || result.sessionId)
  //             ? { ...chat, remainingTokens: result.remainingTokens }
  //             : chat
  //         )
  //       );
  //     }

  //     // If this was a new chat with no session ID, update it with the one from the response
  //     if (!currentSessionId && result.sessionId) {
  //       setChats((prev) => {
  //         const updatedChats = [...prev];
  //         const chatIndex = updatedChats.findIndex(
  //           (chat) => chat.id === selectedChatId
  //         );
  //         if (chatIndex !== -1) {
  //           updatedChats[chatIndex] = {
  //             ...updatedChats[chatIndex],
  //             sessionId: result.sessionId,
  //           };
  //         }
  //         return updatedChats;
  //       });

  //       // Update the selected chat's session ID
  //       currentSessionId = result.sessionId;
  //     }

  //     // Type out response character by character
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
  //             usageTokens: result.remainingTokens,
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
  //     scrollToBottom();
  //   }
  // };
  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    isStoppedRef.current = false;
    const prompt = input;
    setInput("");
    setIsSending(true);
    setIsTypingResponse(true);

    let currentSessionId = selectedChatId
      ? chats.find((chat) => chat.id === selectedChatId)?.sessionId || ""
      : "";

    // Add new message group directly to state
    setMessageGroups((prev) => {
      const updated = [...prev];
      const chatGroups = updated[0] || [];
      chatGroups.push({
        prompt,
        responses: ["Thinking..."],
        time: currentTime(),
        currentSlide: 0,
        isTyping: true,
        isComplete: false,
        tokensUsed: null, // Initialize tokens as null
      });
      return updated;
    });

    try {
      const result = await fetchChatbotResponse(prompt, currentSessionId);
      if (isStoppedRef.current || !result) return;

      if (result.remainingTokens !== undefined) {
        const storageKey = `tokens_${currentSessionId || result.sessionId}`;
        localStorage.setItem(storageKey, result.remainingTokens.toString());
      }

      // Extract tokens used from response (assuming API returns tokensUsed)
      const tokensUsed =
        result.tokensUsed || result.usage?.total_tokens || null;

      // If this was a new chat with no session ID, update it with the one from the response
      if (!currentSessionId && result.sessionId) {
        // Update the selected chat's session ID in the chats array
        setChats((prev) => {
          return prev.map((chat) => {
            if (chat.id === selectedChatId) {
              return {
                ...chat,
                sessionId: result.sessionId,
              };
            }
            return chat;
          });
        });

        // Update the current session ID
        currentSessionId = result.sessionId;

        // Update localStorage with the new session ID
        localStorage.setItem("lastChatSessionId", selectedChatId);
      }

      // Update the response directly in state instead of calling history API
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
              tokensUsed: tokensUsed, // Store tokens used
            };
          }
          return updated;
        });

        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      // Update token count if available
      if (result.remainingTokens !== undefined) {
        const storageKey = `tokens_${currentSessionId || result.sessionId}`;
        localStorage.setItem(storageKey, result.remainingTokens.toString());
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
            <MenuIcon
              style={{ cursor: "pointer" }}
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
    width: "100%",
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

  <Typography
    variant="subtitle1"
    sx={{ fontWeight: "bold", mt: 1 }}
  >
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
      width: 200,   // અહીં તમે custom width આપી શકો
      height: 90,  // અહીં height
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
    handleCloseMenu();       // Menu બંધ કરો
    localStorage.clear();    // બધું clear કરો
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
          width: "100%",
          maxWidth: "900px",
          mx: "auto",
          px: { xs: 6, sm: 8, md: 10, lg: 12 },
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

        <Box
          sx={{
            height: "50px",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e0e0e0",
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

      {/* <Dialog
  open={openProfile}
  onClose={() => setOpenProfile(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle sx={{ textAlign: "center" }}>Profile</DialogTitle>
  <DialogContent sx={{ textAlign: "center" }}>
    <Avatar
      sx={{
        bgcolor: "#1976d2",
        width: 70,
        height: 70,
        fontSize: 30,
        mx: "auto",
        mb: 2,
      }}
    >
      {(username || email || "U").charAt(0).toUpperCase()}
    </Avatar>
    <Typography variant="h6">{username || "Unknown User"}</Typography>
    <Typography variant="body2" color="text.secondary">
      {email || "No email"}
    </Typography>
  </DialogContent>
</Dialog> */}
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
        mt:1,
      }}
    >
      {(username || email || "U").charAt(0).toUpperCase()}
    </Avatar>

    {/* Username */}
    <Box sx={{ mb: 2,display:"flex" ,alignItems:"center",gap:1}}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", fontWeight: "medium",fontSize:"17px" }}
      >
        Username:
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
        {username || "Unknown User"}
      </Typography>
    </Box>

    {/* Email */}
    <Box sx={{ mb: 2,display:"flex" ,alignItems:"center",gap:1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block",  fontWeight: "medium",fontSize:"17px" }}
      >
        Email:
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
        {email || "No email"}
      </Typography>
    </Box>
  </DialogContent>
</Dialog>

    </Box>
  );
};

export default ChatUI;
