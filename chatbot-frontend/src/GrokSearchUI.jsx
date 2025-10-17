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
    setSessionRemainingTokens,
    results,
    setResults,
    grokhistoryList,
    setGrokHistoryList,
    totalTokensUsed,
    setTotalTokensUsed,
  } = useGrok();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const saved = localStorage.getItem("lastGrokSearch");
    if (saved) {
      const { query, results } = JSON.parse(saved);
      setQuery(query);
      setResults(results);
      // ✅ Add this line to show token count from last search
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

        const res = await fetch(`${apiBaseUrl}/grokSearchhistory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        console.log("Search history loaded:", data);

        // ✅ FIX: Update dropdown list
        if (data.history?.length > 0) {
          setGrokHistoryList(data.history.map((h) => h.query));
        } else {
          setGrokHistoryList([]); // handle empty case
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
    const finalQuery = searchQuery || query; // ✅ use passed query if available
    if (!finalQuery) return; // do nothing if query is empty
    setLoading(true);
    setError(null);
    setTokenCount(0);

    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;

    try {
      const response = await fetch(`${apiBaseUrl}/grokSearch`, {
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

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || "Something went wrong");
      // }

      // ✅ Handle "Not enough tokens" error specifically
      if (!response.ok) {
        const errorData = await response.json();

        if (
          response.status === 400 &&
          errorData.message === "Not enough tokens"
        ) {
          // Clear old results
          setResults(null); //  Clear previous results
          setTokenCount(0); // Optional: clear token count

          await Swal.fire({
            title: "Not enough tokens!",
            text: "You don't have enough tokens to continue.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ok",
            cancelButtonText: "Purchase Tokens",
          }).then((result) => {
            if (result.isConfirmed) {
              // Just close the modal
            } else if (result.isDismissed) {
              // Redirect to purchase page
              // window.location.href = "/purchase";
            }
          });

          setError("Not enough tokens to process your request.");
          setLoading(false);
          return;
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.remainingTokens !== undefined) {
        setSessionRemainingTokens(data.remainingTokens); // ✅ update parent
      }
      setResults(data);
      const currentTokens = data.tokenUsage?.totalTokens || 0;

      // ✅ Update token count for this search
      setTokenCount(currentTokens);

      // ✅ Add to global total tokens used
      setTotalTokensUsed((prevTotal) => prevTotal + currentTokens);

      // 🔹 Save to localStorage for persistence
      localStorage.setItem(
        "lastGrokSearch",
        JSON.stringify({ query: finalQuery, results: data })
      );
      console.log("Search Response:", data);

      // 🔹 2. After search success → Call Search History API
      await fetch(`${apiBaseUrl}/grokSearchhistory`, {
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

  return (
    // <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
          width: "15%",
          maxWidth: "15%",
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
              width={247}
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
              width={247}
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "70%",
          maxWidth: "70%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            width: "100%",
          }}
        >
          {/* 🔹 Search TextField with icon inside */}
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              flexGrow: 1,
              backgroundColor: "#f5f5f5",
              fontFamily: "Calibri, sans-serif",
              borderRadius: "30px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
                paddingRight: "1px",
              },
            }}
            inputProps={{
              style: { paddingLeft: "20px" }, // padding for text
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleSearch()}>
                    <SearchIcon sx={{ color: "#555" }} />
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
              <MenuItem value={10}>10 Links</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Token count display */}
        {tokenCount > 0 && (
          <Box sx={{ mt: 0, textAlign: "left", width: "100%" }}>
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
              Token count: {tokenCount}
            </p>
          </Box>
        )}

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {results && !loading && (
          <Box
            sx={{
              mt: 0,
              width: "90%",
              textAlign: "left",
              height: "95%",
              overflowY: "auto",
            }}
          >
            {/* <h3>Summary:</h3> */}
            <p
              style={{
                fontFamily: "Calibri, sans-serif",
                fontWeight: "400",
                fontSize: "18px",
                color: "#1a1717ff",
              }}
            >
              {results.summary}
            </p>
            {/* <h4>Verified Links:</h4> */}

            {results?.verifiedLinks?.map((item, idx) => (
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
                </Box>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "16px",
                    color: "#006621",
                    fontFamily: "Calibri, sans-serif",
                  }}
                >
                  {item.link}
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
                  {item.publishedDate
                    ? new Date(item.publishedDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
          width: "15%",
          maxWidth: "15%",
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
              width={247}
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
                width: 140,
                height: 140,
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
