// // -----------------------------------------------------------------------------------------------------------------------------
// import axios from "axios";
// import trustedSources from "../trusted_sources.json" with { type: "json" };
// import SearchHistory from "../model/SearchHistory.js";
// import * as cheerio from "cheerio";
// // import SearchHistory from "../model/SearchHistory.js";

// const SERPER_URL = "https://google.serper.dev/search";
// // const SERPER_API_KEY = "49d09f756085ba3e5cc2d434cdea914b271ceb05";



// // mohmmedbhai gives key
// const SERPER_API_KEY = "030caba1631ac33e868536cda190dd632ea99d82";

// // meeral last uses key
// // const SERPER_API_KEY = "4065c8aa208d00278c9dfedbc5bbeaae7aaed872";
 
// /**
//  * Call Serper API
//  * @param {string} query
//  * @param {object} opts - { returnRaw: boolean }
//  * @returns {Array|Object}
//  */
// async function searchAPI(query, opts = { returnRaw: false }) {
//   try {
//     const response = await axios.post(
//       SERPER_URL,
//       { q: query },
//       {
//         headers: {
//           "X-API-KEY": SERPER_API_KEY,
//           "Content-Type": "application/json",
//         },
//         maxBodyLength: Infinity,
//       }
//     );

//     const data = response.data;

//     console.log("searchAPI response::::::::::", data);
//     if (opts.returnRaw) return data;
//     return data;
//   } catch (err) {
//     console.error("searchAPI network/error:", err.message);
//     return { error: true, message: err.message };
//   }
// }



// async function searchTrusted(query, category) {
//   const trusted = trustedSources[category] || [];
//   //   console.log("trusted::::::::::", trusted);
//   if (!trusted.length) return await searchAPI(query);

//   const allResults = [];
//   for (const site of trusted) {
//     const siteQuery = `${query} site:${site}`;
//     // console.log("siteQuery::::::::::", siteQuery);
//     const res = await searchAPI(siteQuery);
//     // console.log("res::::::::::", res);
//     if (res) allResults.push(res);
//   }
//   //   console.log("allResults::::::::::", allResults);
//   return allResults;
// }

// /**
//  * Smart search: filter trusted sources, fallback if empty
//  * @param {string} query
//  * @param {string} category
//  */
// async function smartSearch(query, category) {
  
//   let results = await searchTrusted(query, category);

//   if (
//     !results ||
//     (Array.isArray(results) && results.length === 0) ||
//     results.error
//   ) {
//     console.log(
//       "No verified results (or API error). Falling back to general search."
//     );
//     results = await searchAPI(query);
//     // console.log("results::::::::::", results);
//   }

//   const arr = Array.isArray(results) ? results : results.results || [];
//   const trusted = trustedSources[category] || [];

//   // Add trust_level field
//   return arr.map((r) => {
//     const link = r.link || r.url || "";
//     const isTrusted = trusted.some((domain) => link.includes(domain));
//     return { ...r, trust_level: isTrusted ? "verified" : "general" };
//   });
// }


// async function summarizeAsk(query, results) {
//   if (!results || results.length === 0) return query;

//   // Extract URLs from verified links
//   const urls = results
//     .map((r) => r.organic?.[0]?.link)
//     .filter(Boolean);

//   if (urls.length === 0) return query;

//   const keywords = query.toLowerCase().split(/\s+/);
//   let combinedText = "";

//   for (const url of urls.slice(0, 3)) { // limit top 3 sources
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

//   if (!combinedText.trim()) return query; // fallback to query if no content

//   // Limit to 100 words
//   const words = combinedText.split(/\s+/).slice(0, 100);
//   return words.join(" ") + (words.length >= 100 ? "..." : "");
// }

// export const getAISearchResults = async (req, res) => {
//   console.log("11111111111", req.body);
//   try {
//     const { query, category = "general", raw, email } = req.body; // using POST body

//     if (!query) return res.status(400).json({ error: "Missing 'query' field" });

//     if (email) console.log(`🔹 Search request from: ${email}`);

//     // ✅ 1. Collect all trusted site results (all related to same query)
//     const allResults = [];

//     // for (const source of trustedSources) {
//     //   const resData = await searchTrusted(query, source);
//     //   if (resData && Array.isArray(resData)) {
//     //     allResults.push(...resData); // flatten from all trusted sources
//     //   } else if (resData) {
//     //     allResults.push(resData);
//     //   }
//     // }
//     // Loop through each trusted source category key
//     for (const categoryKey of Object.keys(trustedSources)) {
//       const resData = await searchTrusted(query, categoryKey);
//       console.log(`resData::::==========`, resData);
//       if (resData && Array.isArray(resData)) {
//         allResults.push(...resData);
//       } else if (resData) {
//         allResults.push(resData);
//       }
//     }

//     console.log("All Trusted Source Results ::::::::::", allResults.length);

//     // ✅ 2. Take only top 5 sources (limit)
//     const topFiveResults = allResults.slice(0, 10);
//     console.log("topFiveResults:::====",topFiveResults)
//     // ✅ 3. From each site’s results, pick only the 1st organic link
//     const verifiedLinks = topFiveResults.map((result) => ({
//       searchParameters: result.searchParameters
//         ? result.searchParameters
//         : { q: query },
//       organic:
//         result.organic && result.organic.length > 0
//           ? [result.organic[0]]
//           : [],
//     }));

//     console.log("VerifiedLinks (Top 5, One Per Site) ::::::::::", verifiedLinks);

//     // ✅ 4. Create summary
//     // const summary = summarizeAsk(query);
//     const summary = await summarizeAsk(query, verifiedLinks);


//     // ✅ 5. Save to MongoDB
//     const record = new SearchHistory({
//       email,
//       query,
//       category,
//       summary,  
//       resultsCount: verifiedLinks.length,
//       raw: raw || false,
//     });
//     await record.save();

//     // ✅ 6. If raw requested
//     if (raw === true) {
//       const rawData = await searchAPI(query, { returnRaw: true });
//       return res.json({
//         summary,
//         verifiedLinks,
//         raw: rawData,
//         email,
//       });
//     }

//     // ✅ 7. Final response
//     return res.json({
//       summary,
//       verifiedLinks,
//       email,
//     });
//   } catch (err) {
//     console.error("Search Error:", err);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", message: err.message });
//   }
// };

// export const getUserSearchHistory = async (req, res) => {
//   try {
//     const { email } = req.body; // now using body instead of query

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



// -----------------------------------------------------------------------------------------------------------------------------
import axios from "axios";
import trustedSources from "../trusted_sources.json" with { type: "json" };
import SearchHistory from "../model/SearchHistory.js";
import * as cheerio from "cheerio";
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


async function summarizeAsk(query, results) {
  if (!results || results.length === 0) return query;

  // Extract URLs from verified links
  const urls = results
    .map((r) => r.organic?.[0]?.link)
    .filter(Boolean);

  if (urls.length === 0) return query;

  const keywords = query.toLowerCase().split(/\s+/);
  let combinedText = "";

  for (const url of urls.slice(0, 3)) { // limit top 3 sources
    try {
      const { data: html } = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (Node.js)" },
      });

      const $ = cheerio.load(html);

      // Extract paragraphs only
      const paragraphs = $("p").map((_, el) => $(el).text().trim()).get();

      // Keep paragraphs containing at least one keyword
      const relevantParagraphs = paragraphs.filter((p) =>
        keywords.some((k) => p.toLowerCase().includes(k))
      );

      combinedText += " " + relevantParagraphs.join(" ");
    } catch (err) {
      console.warn(`⚠️ Could not fetch ${url}: ${err.message}`);
    }
  }

  if (!combinedText.trim()) return query; // fallback to query if no content

  // Limit to 100 words
  const words = combinedText.split(/\s+/).slice(0, 100);
  return words.join(" ") + (words.length >= 100 ? "..." : "");
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
        site: getSourceName(item.link), // Add source name
        publishedDate: item.date || item.publishedDate
      }))
    };

    console.log("Formatted Results ::::::::::", formattedResults);

    // ✅ 4. Create summary using only the limited results
    const summary = await summarizeAsk(query, formattedResults.organic);

    // ✅ 5. Save to MongoDB
    const record = new SearchHistory({
      email,
      query,
      category,
      summary,  
      resultsCount: topResults.length,
      raw: raw || false,
    });
    await record.save();

    // ✅ 6. If raw requested
    if (raw === true) {
      const rawData = await searchAPI(query, { returnRaw: true });
      return res.json({
        summary,
        verifiedLinks: formattedResults,
        raw: rawData,
        email,
      });
    }

    // ✅ 7. Final response - return organic array directly
    return res.json({
      summary,
      verifiedLinks: formattedResults.organic, // ✅ Direct array of results
      email,
      linkCount: topResults.length // ✅ Actual count sent back
    });
  } catch (err) {
    console.error("Search Error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};

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
// export const getAISearchResults = async (req, res) => {
//   console.log("11111111111", req.body);
//   try {
//     const { query, category = "general", raw, email } = req.body;

//     if (!query) return res.status(400).json({ error: "Missing 'query' field" });

//     if (email) console.log(`🔹 Search request from: ${email}`);

//     // ✅ 1. Use direct search API instead of trusted sources
//     const searchResults = await searchAPI(query);
    
//     console.log("Search Results ::::::::::", searchResults);

//     // ✅ 2. Take only top 10 organic results
//     const topResults = searchResults.organic ? searchResults.organic.slice(0, 10) : [];
//     console.log("topResults:::====", topResults);

//     // ✅ 3. Format the results
//     const formattedResults = {
//       searchParameters: searchResults.searchParameters || { q: query },
//       organic: topResults
//     };

//     console.log("Formatted Results ::::::::::", formattedResults);

//     // ✅ 4. Create summary
//     const summary = await summarizeAsk(query, [formattedResults]);

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

//     // ✅ 7. Final response
//     return res.json({
//       summary,
//       verifiedLinks: formattedResults,
//       email,
//     });
//   } catch (err) {
//     console.error("Search Error:", err);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", message: err.message });
//   }
// };

export const getUserSearchHistory = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing 'email' field in request body" });
    }

    const history = await SearchHistory.find({ email }).sort({ createdAt: -1 });

    return res.json({ email, history });
  } catch (err) {
    console.error("History Fetch Error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};