import axios from "axios";
import trustedSources from "../trusted_sources.json" with { type: "json" };
import SearchHistory from "../model/SearchHistory.js";
import * as cheerio from "cheerio";
import { countTokens, countWords } from "../utils/tokenCounter.js";
// import SearchHistory from "../model/SearchHistory.js";

const SERPER_URL = "https://google.serper.dev/search";
// const SERPER_API_KEY = "49d09f756085ba3e5cc2d434cdea914b271ceb05";



// mohmmedbhai gives key
const SERPER_API_KEY = "030caba1631ac33e868536cda190dd632ea99d82";

// meeral last uses key
// const SERPER_API_KEY = "4065c8aa208d00278c9dfedbc5bbeaae7aaed872";
 
/**
 * Call Serper API
 * @param {string} query
 * @param {object} opts - { returnRaw: boolean }
 * @returns {Array|Object}
 */
async function searchAPI(query, opts = { returnRaw: false }) {
  try {
    const response = await axios.post(
      SERPER_URL,
      { q: query },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );

    const data = response.data;

    console.log("searchAPI response::::::::::", data);
    if (opts.returnRaw) return data;
    return data;
  } catch (err) {
    console.error("searchAPI network/error:", err.message);
    return { error: true, message: err.message };
  }
}



async function searchTrusted(query, category) {
  const trusted = trustedSources[category] || [];
  //   console.log("trusted::::::::::", trusted);
  if (!trusted.length) return await searchAPI(query);

  const allResults = [];
  for (const site of trusted) {
    const siteQuery = `${query} site:${site}`;
    // console.log("siteQuery::::::::::", siteQuery);
    const res = await searchAPI(siteQuery);
    // console.log("res::::::::::", res);
    if (res) allResults.push(res);
  }
  //   console.log("allResults::::::::::", allResults);
  return allResults;
}

/**
 * Smart search: filter trusted sources, fallback if empty
 * @param {string} query
 * @param {string} category
 */
async function smartSearch(query, category) {
  
  let results = await searchTrusted(query, category);

  if (
    !results ||
    (Array.isArray(results) && results.length === 0) ||
    results.error
  ) {
    console.log(
      "No verified results (or API error). Falling back to general search."
    );
    results = await searchAPI(query);
    // console.log("results::::::::::", results);
  }

  const arr = Array.isArray(results) ? results : results.results || [];
  const trusted = trustedSources[category] || [];

  // Add trust_level field
  return arr.map((r) => {
    const link = r.link || r.url || "";
    const isTrusted = trusted.some((domain) => link.includes(domain));
    return { ...r, trust_level: isTrusted ? "verified" : "general" };
  });
}

// async function summarizeAsk(query, results) {
//   if (!results || results.length === 0) return query;

//   // Extract URLs from organic results
//   const urls = results
//     .map((r) => r.link || r.url)
//     .filter(Boolean);

//   if (urls.length === 0) return query;

//   const keywords = query.toLowerCase().split(/\s+/);
//   let combinedText = "";

//   // Scrape content from top 3 URLs
//   for (const url of urls.slice(0, 3)) {
//     try {
//       const { data: html } = await axios.get(url, {
//         timeout: 8000,
//         headers: { "User-Agent": "Mozilla/5.0 (Node.js)" },
//       });

//       const $ = cheerio.load(html);

//       // Extract paragraphs only
//       const paragraphs = $("p").map((_, el) => $(el).text().trim()).get();

//       // Keep paragraphs containing at least one keyword
//       const relevantParagraphs = paragraphs.filter((p) =>
//         keywords.some((k) => p.toLowerCase().includes(k))
//       );

//       combinedText += " " + relevantParagraphs.join(" ");
//     } catch (err) {
//       console.warn(`⚠️ Could not fetch ${url}: ${err.message}`);
//     }
//   }

//   // Fallback to query if no content was extracted
//   if (!combinedText.trim()) return query;

//   // ✅ ENSURE 50-WORD SUMMARY
//   const words = combinedText.split(/\s+/);
  
//   // If we have enough content, take exactly 50 words
//   if (words.length >= 50) {
//     return words.slice(0, 50).join(" ");
//   } 
//   // If we have less than 50 words, pad with relevant context
//   else {
//     const remainingWords = 50 - words.length;
//     // Add some generic AI context to reach 50 words if needed
//     const aiContext = "Artificial intelligence involves machines that can learn, reason, and perform tasks typically requiring human intelligence through algorithms and data processing.";
//     const contextWords = aiContext.split(/\s+/).slice(0, remainingWords);
//     return words.concat(contextWords).join(" ");
//   }
// }

async function summarizeAsk(query, results) {
  if (!results || results.length === 0) return query;

  // Extract URLs from organic results
  const urls = results
    .map((r) => r.link || r.url)
    .filter(Boolean);

  if (urls.length === 0) return query;

  const keywords = query.toLowerCase().split(/\s+/);
  let combinedText = "";

  for (const url of urls.slice(0, 3)) {
    try {
      const { data: html } = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (Node.js)" },
      });

      const $ = cheerio.load(html);
      const paragraphs = $("p").map((_, el) => $(el).text().trim()).get();
      
      const relevantParagraphs = paragraphs.filter((p) =>
        keywords.some((k) => p.toLowerCase().includes(k))
      );

      combinedText += " " + relevantParagraphs.join(" ");
      
      // ✅ Optional: Check token count and stop early if too long
      const currentTokens = await countTokens(combinedText, "grok-1");
      if (currentTokens > 1000) { // Limit input context
        console.log(`🔹 Reached token limit (${currentTokens}), stopping early`);
        break;
      }
    } catch (err) {
      console.warn(`⚠️ Could not fetch ${url}: ${err.message}`);
    }
  }

  if (!combinedText.trim()) return query;

  // Ensure 50-word summary
  const words = combinedText.split(/\s+/);
  let summary = words.slice(0, 50).join(" ");
  
  // ✅ Add ellipsis only if we truncated
  if (words.length > 50) {
    summary += "...";
  }
  
  return summary;
}

export const getAISearchResults = async (req, res) => {
  console.log("11111111111", req.body);
  try {
    const { query, category = "general", raw, email, linkCount = 10 } = req.body;

    if (!query) return res.status(400).json({ error: "Missing 'query' field" });

    if (email) console.log(`🔹 Search request from: ${email}`);
    console.log(`🔹 Requested link count: ${linkCount}`);

    // ✅ 1. Use direct search API
    const searchResults = await searchAPI(query);
    
    console.log("Search Results ::::::::::", searchResults);

    // ✅ 2. Take only the requested number of organic results
    const requestedCount = parseInt(linkCount) || 10;
    const topResults = searchResults.organic ? searchResults.organic.slice(0, requestedCount) : [];
    console.log("topResults:::====", topResults);

    // ✅ 3. Format the results properly for frontend
    const formattedResults = {
      searchParameters: searchResults.searchParameters || { q: query },
      organic: topResults.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        site: getSourceName(item.link),
        publishedDate: item.date || item.publishedDate
      }))
    };

    console.log("Formatted Results ::::::::::", formattedResults);

    // ✅ 4. Create summary using Grok
    const summary = await summarizeAsk(query, formattedResults.organic);
    
    // ✅ 5. COUNT TOKENS AND WORDS FOR THE SUMMARY
    const tokenCount = await countTokens(summary, "grok-1"); // Use "gpt-4o-mini" if using OpenAI
    const wordCount = countWords(summary);
    
    console.log(`🔹 Summary Stats - Words: ${wordCount}, Tokens: ${tokenCount}`);
    
    // ✅ 6. Verify summary length (optional - for quality control)
    if (wordCount < 40) {
      console.warn(`⚠️ Summary might be too short: ${wordCount} words`);
    }

    // ✅ 7. Save to MongoDB with token count
    const record = new SearchHistory({
      email,
      query,
      category,
      summary,  
      resultsCount: topResults.length,
      raw: raw || false,
      summaryWordCount: wordCount, // ✅ Store word count
      summaryTokenCount: tokenCount, // ✅ Store token count
    });
    await record.save();

    // ✅ 8. If raw requested
    if (raw === true) {
      const rawData = await searchAPI(query, { returnRaw: true });
      return res.json({
        summary,
        verifiedLinks: formattedResults.organic,
        raw: rawData,
        email,
        linkCount: topResults.length,
        summaryStats: { // ✅ Include stats in response
          words: wordCount,
          tokens: tokenCount
        }
      });
    }

    // ✅ 9. Final response with summary stats
    return res.json({
      summary,
      verifiedLinks: formattedResults.organic,
      email,
      linkCount: topResults.length,
      summaryStats: { // ✅ Include stats in response
        words: wordCount,
        tokens: tokenCount
      }
    });
  } catch (err) {
    console.error("Search Error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};
// summery get
// export const getAISearchResults = async (req, res) => {
//   console.log("11111111111", req.body);
//   try {
//     const { query, category = "general", raw, email, linkCount = 10 } = req.body;

//     if (!query) return res.status(400).json({ error: "Missing 'query' field" });

//     if (email) console.log(`🔹 Search request from: ${email}`);
//     console.log(`🔹 Requested link count: ${linkCount}`);

//     // ✅ 1. Use direct search API
//     const searchResults = await searchAPI(query);
    
//     console.log("Search Results ::::::::::", searchResults);

//     // ✅ 2. Take only the requested number of organic results
//     const requestedCount = parseInt(linkCount) || 10;
//     const topResults = searchResults.organic ? searchResults.organic.slice(0, requestedCount) : [];
//     console.log("topResults:::====", topResults);

//     // ✅ 3. Format the results properly for frontend
//     const formattedResults = {
//       searchParameters: searchResults.searchParameters || { q: query },
//       organic: topResults.map(item => ({
//         title: item.title,
//         link: item.link,
//         snippet: item.snippet,
//         site: getSourceName(item.link),
//         publishedDate: item.date || item.publishedDate
//       }))
//     };

//     console.log("Formatted Results ::::::::::", formattedResults);

//     // ✅ 4. Create 50-word summary using Grok
//     const summary = await summarizeAsk(query, formattedResults.organic);
    
//     // ✅ 5. Verify word count
//     const wordCount = summary.split(/\s+/).length;
//     console.log(`🔹 Summary word count: ${wordCount} words`);

//     // ✅ 6. Save to MongoDB
//     const record = new SearchHistory({
//       email,
//       query,
//       category,
//       summary,  
//       resultsCount: topResults.length,
//       raw: raw || false,
//     });
//     await record.save();

//     // ✅ 7. If raw requested
//     if (raw === true) {
//       const rawData = await searchAPI(query, { returnRaw: true });
//       return res.json({
//         summary,
//         verifiedLinks: formattedResults.organic,
//         raw: rawData,
//         email,
//         linkCount: topResults.length
//       });
//     }

//     // ✅ 8. Final response
//     return res.json({
//       summary,
//       verifiedLinks: formattedResults.organic,
//       email,
//       linkCount: topResults.length
//     });
//   } catch (err) {
//     console.error("Search Error:", err);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", message: err.message });
//   }
// };

// export const getAISearchResults = async (req, res) => {
//   console.log("11111111111", req.body);
//   try {
//     const { query, category = "general", raw, email, linkCount = 10 } = req.body;

//     if (!query) return res.status(400).json({ error: "Missing 'query' field" });

//     if (email) console.log(`🔹 Search request from: ${email}`);
//     console.log(`🔹 Requested link count: ${linkCount}`);

//     // ✅ 1. Use direct search API
//     const searchResults = await searchAPI(query);
    
//     console.log("Search Results ::::::::::", searchResults);

//     // ✅ 2. Take only the requested number of organic results
//     const requestedCount = parseInt(linkCount) || 10;
//     const topResults = searchResults.organic ? searchResults.organic.slice(0, requestedCount) : [];
//     console.log("topResults:::====", topResults);

//     // ✅ 3. Format the results properly for frontend
//     const formattedResults = {
//       searchParameters: searchResults.searchParameters || { q: query },
//       organic: topResults.map(item => ({
//         title: item.title,
//         link: item.link,
//         snippet: item.snippet,
//         site: getSourceName(item.link), // Add source name
//         publishedDate: item.date || item.publishedDate
//       }))
//     };

//     console.log("Formatted Results ::::::::::", formattedResults);

//     // ✅ 4. Create summary using only the limited results
//     const summary = await summarizeAsk(query, formattedResults.organic);

//     // ✅ 5. Save to MongoDB
//     const record = new SearchHistory({
//       email,
//       query,
//       category,
//       summary,  
//       resultsCount: topResults.length,
//       raw: raw || false,
//     });
//     await record.save();

//     // ✅ 6. If raw requested
//     if (raw === true) {
//       const rawData = await searchAPI(query, { returnRaw: true });
//       return res.json({
//         summary,
//         verifiedLinks: formattedResults,
//         raw: rawData,
//         email,
//       });
//     }

//     // ✅ 7. Final response - return organic array directly
//     return res.json({
//       summary,
//       verifiedLinks: formattedResults.organic, // ✅ Direct array of results
//       email,
//       linkCount: topResults.length // ✅ Actual count sent back
//     });
//   } catch (err) {
//     console.error("Search Error:", err);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", message: err.message });
//   }
// };

// ✅ Add this helper function to extract source name from URL
function getSourceName(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      const mainDomain = domainParts[domainParts.length - 2];
      return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    }
    return domain;
  } catch (error) {
    return "Website";
  }
}

export const getUserSearchHistory = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing 'email' field in request body" });
    }

    const history = await SearchHistory.find({ email }).sort({ createdAt: -1 });

    return res.json({ 
      email, 
      history,
      // Optional: Include total stats
      totalStats: {
        totalSearches: history.length,
        averageWords: history.reduce((acc, curr) => acc + (curr.summaryWordCount || 0), 0) / history.length,
        averageTokens: history.reduce((acc, curr) => acc + (curr.summaryTokenCount || 0), 0) / history.length
      }
    });
  } catch (err) {
    console.error("History Fetch Error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};
// export const getUserSearchHistory = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Missing 'email' field in request body" });
//     }

//     const history = await SearchHistory.find({ email }).sort({ createdAt: -1 });

//     return res.json({ email, history });
//   } catch (err) {
//     console.error("History Fetch Error:", err);
//     return res.status(500).json({
//       error: "Internal server error",
//       message: err.message,
//     });
//   }
// };
async function summarizeAskWithGrok(query, results) {
  if (!results || results.length === 0) return query;

  // Extract snippets from results for context
  const snippets = results
    .map(r => r.snippet)
    .filter(Boolean)
    .join(" ");

  const context = snippets || query;

  try {
    // Call Grok API for summarization (adjust endpoint and headers as needed)
    const grokResponse = await axios.post(
      'https://api.grok.ai/summarize', // Adjust endpoint
      {
        text: context,
        max_words: 50,
        query: query
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return grokResponse.data.summary || query;
  } catch (error) {
    console.warn('Grok API failed, falling back to basic summary:', error.message);
    // Fallback to basic 50-word summary
    const words = context.split(/\s+/).slice(0, 50);
    return words.join(" ");
  }
}