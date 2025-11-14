// import React, { useState, useEffect } from "react";
// import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";

import React, { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  FormControl,
  Avatar,
  Typography,
  Link,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useGrok } from "./context/GrokContext";
import Swal from "sweetalert2";
import zomato from "././assets/zomato.png";
import Zomato1 from "././assets/Zomato1.png";
// import gofig from "././assets/gofig.png";
import gofig from "././assets/gofig1.png";
// import sirat from "././assets/sirat.png";
import sirat from "././assets/sirat.gif";
// import insead from "././assets/insead.png";
import insead from "././assets/insead1.png";
import search from "././assets/search_icon.png";

// import insead from "././assets/insead.png";

export default function GrokSearchUI(props) {
  const { selectedGrokQuery } = props;

  const [query, setQuery] = useState("");
  // const [results, setResults] = useState(null);
  // const [loading, setLoading] = useState(false);
  const [linkCount, setLinkCount] = useState(3); // ✅ default value = 3 links
  // const [error, setError] = useState(null);
  // const [tokenCount, setTokenCount] = useState(0);
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
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const saved = localStorage.getItem("lastGrokSearch");
    if (saved) {
      const { query, results } = JSON.parse(saved);
      setQuery(query);
      setResults(results);
      // ✅ Add this line to show token count from last search
      // setTokenCount(results.tokenUsage?.totalTokens || 0);
      setTokenCount(results.tokenUsage?.totalTokens || 0);
    }
  }, []);

  // ✅ NEW useEffect to load search history on mount
  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user?.email;
        if (!email) return;

        const res = await fetch(`${apiBaseUrl}/Searchhistory`, {
          // const res = await fetch(`${apiBaseUrl}/grokSearchhistory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        console.log("Search history loaded:", data);

        // ✅ FIX: Update dropdown list
        if (data.history?.length > 0) {
          setGrokHistoryList(data.history.map((h) => h.query));

          // ✅ NEW: Get the latest search's token count
          const latestSearch = data.history[0]; // sorted by latest if backend sorts descending
          const latestTokenCount = latestSearch?.summaryTokenCount || 0;

          // ✅ Set this token count globally
          setTokenCount(latestTokenCount);
        } else {
          setGrokHistoryList([]); // handle empty case
          setTokenCount(0);
        }
      } catch (err) {
        console.error("Search history fetch error:", err);
      }
    };

    fetchSearchHistory();
  }, [apiBaseUrl]);

  useEffect(() => {
    // if (selectedGrokQuery) {
    if (selectedGrokQuery && selectedGrokQuery.trim() !== "") {
      setQuery(selectedGrokQuery);
      // handleSearch(selectedGrokQuery);
    }
  }, [selectedGrokQuery]);

  // Source name extraction function
  //   const getSourceName = (url) => {
  //     try {
  //       const domain = new URL(url).hostname.toLowerCase();

  //       const sourceMap = {
  //         "wikipedia.org": "Wikipedia",
  //         "en.wikipedia.org": "Wikipedia",
  //         "britannica.com": "Britannica",
  //         "www.britannica.com": "Britannica",
  //         "nationalgeographic.com": "National Geographic",
  //         "history.com": "History",
  //         "britishmuseum.org": "British Museum",
  //         "louvre.fr": "Louvre Museum",
  //         "google.com": "Google",
  //         "youtube.com": "YouTube",
  //         // Add more as needed
  //       };

  //       // Check for exact matches first
  //       if (sourceMap[domain]) {
  //         return sourceMap[domain];
  //       }

  //       // Check for partial matches
  //       for (const [key, value] of Object.entries(sourceMap)) {
  //         if (domain.includes(key)) {
  //           return value;
  //         }
  //       }

  //       // Fallback: extract from domain
  //       const cleanDomain = domain.replace("www.", "");
  //       const domainParts = cleanDomain.split(".");
  //       if (domainParts.length >= 2) {
  //         const mainDomain = domainParts[domainParts.length - 2];
  //         return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  //       }

  //       return cleanDomain;
  //     } catch (error) {
  //       return "Website";
  //     }
  //   };

  const handleSearch = async (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery) return;

    setLoading(true);
    setError(null);
    setTokenCount(0);

    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;

    try {
      const response = await fetch(`${apiBaseUrl}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalQuery,
          email,
          category: "general",
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

      if (data.remainingTokens !== undefined)
        setSessionRemainingTokens(data.remainingTokens);

      setResults(data);

      // ✅ Get token counts
      const usedTokens =
        data.summaryStats?.tokens || data.tokenUsage?.totalTokens || 0;
      setTokenCount(usedTokens);
      console.log("🔹 usedTokens:::::", usedTokens);
      // ✅ Update total tokens used
      // setTotalTokensUsed((prev) => (prev || 0) + usedTokens);

      // // ✅ Deduct used tokens from remaining
      // setSessionRemainingTokens((prev) =>
      //   Math.max(0, (prev || 0) - usedTokens)
      // );

      // ✅ Sync global totals from backend (single source of truth)
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
        console.log("🔹 setTotalSearches:::::::", data.totalSearches);
      }

      // const currentTokens = data.tokenUsage?.totalTokens || 0;
      // setTokenCount(currentTokens);
      // setTotalTokensUsed((prev) => prev + currentTokens);

      // ✅ Deduct used tokens from remaining
      // const usedTokens = data.summaryStats?.tokens || currentTokens || 0;
      // setSessionRemainingTokens((prev) => Math.max(0, prev - usedTokens));

      localStorage.setItem(
        "lastGrokSearch",
        JSON.stringify({ query: finalQuery, results: data })
      );

      await fetch(`${apiBaseUrl}/Searchhistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((historyData) => {
          if (historyData.history?.length > 0)
            setGrokHistoryList(historyData.history.map((h) => h.query));
        })
        .catch((err) => console.error("Search history fetch error:", err));
    } catch (err) {
      console.error("Search API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Box sx={{ display: "block", width: "100%" }}>
      <Box sx={{width: "100%", mb: 1 }}>
        <Box
          sx={{
            position: "sticky",
            top: 85,
            bgcolor: "#fff",
            pt: 5,
            pb: 3,
            mb: 2,
            display: "flex",

            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            width: "75%",
            mx: "auto",
          }}
        >
          {/* 🔹 Search TextField with icon inside */}
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search..."
            value={query}
            multiline // ✅ enables multi-line input
            minRows={2}
            maxRows={5}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              flexGrow: 1,
              backgroundColor: "#f5f5f5",
              fontFamily: "Calibri, sans-serif",
              borderRadius: "20px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                height: "auto",
                minHeight: "67px",
                  display: "flex",
                alignItems: "center",
                 justifyContent: "center",
                paddingRight: "1px",
              },
              "& .MuiOutlinedInput-input": {
                
                paddingLeft: "20px",
                lineHeight: "1.5", // ✅ nice text spacing
                whiteSpace: "pre-wrap", // ✅ wraps text naturally
                wordBreak: "break-word",
                alignItems: "center",
                justifyContent: "center",
              
              },
              "& .MuiInputBase-input::placeholder": {
                top: "50%",
                paddingTop: 1.5,
              },
            }}
            inputProps={{
              style: {
                display: "flex",
                alignItems: "center", // ✅ keeps text vertically centered
                justifyContent: "center",
              }, // padding for text
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleSearch()}>
                    {/* <SearchIcon sx={{ color: "#555" }} /> */}
                    <img
                      src={search}
                      alt=""
                      srcset=""
                      height={"40px"}
                      width={"40px"}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          {/* 🔹 Dropdown on the left side */}
          <FormControl
            size="small"
            sx={{
              minWidth: 110,
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Select
              value={linkCount}
              onChange={(e) => setLinkCount(e.target.value)}
              sx={{
                fontFamily: "Calibri, sans-serif",
                fontSize: "14px",
              }}
            >
              <MenuItem value={3}>3 Links</MenuItem>
              <MenuItem value={5}>5 Links</MenuItem>
              {/* <MenuItem value={10}>10 Links</MenuItem> */}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mt: 0, textAlign: "left", width: "85%" }}>
          <p
            style={{
              fontFamily: "Calibri, sans-serif",
              fontSize: "16px",
              color: "#555",
              display: "flex",
              fontWeight: "bold",
              justifyContent: "flex-end",
            }}
          >
            {/* Token count: {results?.summaryStats?.tokens} */}
            Token count: {tokenCount}
          </p>
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          height: "100%",
          display: "flex",
          flexDirection: "row",
          // alignItems: "center", // horizontal centering
          // justifyContent: "flex-start", // pushes content to top
          pt: 2, // optional: adds padding from top
          textAlign: "center",
          color: "#555",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            width: "13%",
            maxWidth: "13%",
          }}
        >
          {/* sirat Ad */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {/* ✅ Clickable Logo */}
            <Link
              href="https://sirat.earth"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                textDecoration: "none",
                "&:hover": { transform: "scale(1.05)", transition: "0.3s" },
              }}
            >
              <img
                src={sirat}
                height={140}
                width={200}
                style={{ objectFit: "contain" }}
              />
              {/* <Avatar
              alt="Sirat"
              src={sirat}
              sx={{
                width: 140,
                height: 140,
                mb: 1,
                // border: "2px solid #ddd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            /> */}
            </Link>

            {/* Brand Name */}
            {/* <Typography variant="subtitle1" sx={{ color: "#000", mb: 0.5 }}>
            Sirat
          </Typography> */}
          </Box>

          {/* INSEAD Ad */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {/* ✅ Clickable Logo */}
            <Link
              href="https://www.insead.edu"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                textDecoration: "none",
                "&:hover": { transform: "scale(1.05)", transition: "0.3s" },
              }}
            >
              <img
                src={insead}
                height={140}
                width={200}
                style={{ objectFit: "contain" }}
              />
              {/* <Avatar
              alt="INSEAD"
              src={insead}
              sx={{
                width: 140,
                height: 140,
                mb: 1,
                border: "2px solid #ddd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                mr: 1,
              }}
            /> */}
            </Link>

            {/* Brand Name */}
            {/* <Typography variant="subtitle1" sx={{ color: "#000", mb: 0.5 }}>
            INSEAD
          </Typography> */}
          </Box>
        </Box>

        {/* <Box
          sx={{
           
            width: "70%",
            maxWidth: "70%",
           
          }}
        >
       */}

        {error && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
            {/* {error} */}
          </p>
        )}
        {console.log("results::::", results)}
        {/* {results && !loading && ( */}
        <Box
          sx={{
            mt: 0,
            width: "90%",
            textAlign: "left",
            mx: 4,
            // height: "95%",
            // overflowY: "auto",
          }}
        >
          {loading ? (
            <Box>Loading...</Box>
          ) : (
            <Box sx={{ textAlign: "left" }}>
              {results && (
                <p
                  style={{
                    paddingLeft: "4px",
                    fontFamily: "Calibri, sans-serif",
                    fontWeight: "400",
                    fontSize: "18px",
                    color: "#1a1717ff",
                  }}
                >
                  {results.summary}
                </p>
              )}
              {results?.verifiedLinks?.map((item, idx) => (
                // {results?.verifiedLinks?.organic?.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    //   backgroundColor: "#f9f9f9",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {/* Source Name Badge */}
                  {item?.site && (
                    // {item?.organic?.[0]?.site &&
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: "#e9ecef",
                        color: "#17202bff",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "500",
                        width: "fit-content",
                        mb: 0.5,
                        fontFamily: "Calibri, sans-serif",
                        //  fontWeight: "bold"
                      }}
                    >
                      {item.site}
                      {/* {item?.organic?.[0]?.site} */}
                    </Box>
                  )}

                  <a
                    // href={item?.organic?.[0]?.link}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "16px",
                      color: "#006621",
                      cursor: "pointer",
                      fontFamily: "Calibri, sans-serif",
                    }}
                  >
                    {item.link}
                    {/* {item?.organic?.[0]?.link} */}
                  </a>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      // fontWeight: "bold",
                      fontSize: "17px",
                      color: "#1a0dab",
                      fontFamily: "Calibri, sans-serif",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {/* {item?.organic?.[0]?.title} */}
                    {item.title}
                  </a>
                  <p
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      margin: "4px 0 0 0",
                      color: "#1a1717ff",
                      fontSize: "16px",
                      fontFamily: "Calibri, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {/* {item?.organic?.[0]?.snippet} */}
                    {item.snippet}
                  </p>
                  {/* Published Date */}
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      color: "#555",
                      fontSize: "13px",
                      fontFamily: "Calibri, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {/* {item?.organic?.[0]?.publishedDate
                    ? new Date(item.publishedDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : ""} */}
                    {item.publishedDate}
                    {/* {item.publishedDate
                        ? new Date(item.publishedDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : ""} */}
                  </p>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {/* )} */}
        {/* </Box> */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            width: "13%",
            maxWidth: "13%",
          }}
        >
          {/* Gofig Ad */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {/* ✅ Clickable Logo */}
            <Link
              href="https://gofig.in"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                textDecoration: "none",
                "&:hover": { transform: "scale(1.05)", transition: "0.3s" },
              }}
            >
              <img
                src={gofig}
                height={140}
                width={200}
                style={{ objectFit: "contain" }}
              />
              {/* <Avatar
              alt="Gofig"
              src={gofig}
              sx={{
                width: 140,
                height: 140,
                mb: 1,
                border: "2px solid #ddd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            /> */}
            </Link>

            {/* Brand Name */}
            {/* <Typography variant="subtitle1" sx={{ color: "#000", mb: 0.5 }}>
            Gofig
          </Typography> */}
          </Box>

          {/* Zomato Ad */}
          {/* Zomato Ad */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {/* ✅ Clickable Logo */}
            <Link
              href="https://www.zomato.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                textDecoration: "none",
                "&:hover": { transform: "scale(1.05)", transition: "0.3s" },
              }}
            >
              <Avatar
                alt="Zomato1"
                src={Zomato1}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 1,
                  border: "2px solid #ddd",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />
            </Link>

            {/* Brand Name */}
            {/* <Typography variant="subtitle1" sx={{ color: "#000", mb: 0.5 }}>
            Zomato
          </Typography> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// INSEAD URL
// <cite class="tjvcx GvPZzd cHaqb" role="text">https://www.insead.edu</cite> insead.png

// gifig.png
// <cite class="tjvcx GvPZzd cHaqb" role="text">https://gofig.in</cite>

// zomato.png
// <cite class="qLRx3b tjvcx GvPZzd cHaqb" role="text">https://www.zomato.com<span class="ylgVCe ob9lvb" role="text"> › surat</span></cite>

// sirat.png
// <cite class="tjvcx GvPZzd cHaqb" role="text">https://sirat.earth</cite>
