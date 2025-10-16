// import fetch from "node-fetch";
// import trustedSources from "../trusted_sources.json" assert { type: "json" };
// // https://api.serper.dev/search
// // 🔹 Core Search Function
// export async function searchAPI(query) {
// const response = await fetch("https://api.serper.dev/search", {
// method: "POST",
// headers: {
// "X-API-KEY": process.env.SERPER_KEY,
// "Content-Type": "application/json",
// },
// body: JSON.stringify({ q: query }),
// });
// console.log("HTTP Status:", response.status);

// const data = await response.json();
//  console.log("API Response:", JSON.stringify(data, null, 2));
// return data.results || [];
// }

// // 🔹 Apply trusted filters
// export function applyTrustedFilters(query, category) {
// const trusted = trustedSources[category] || [];
// const siteFilters = trusted.map((site) => `site:${site}`).join(" OR ");
// return `${query} (${siteFilters})`;
// }

// // 🔹 Smart Search Logic
// export async function smartSearch(query, category) {
// const verifiedQuery = applyTrustedFilters(query, category);
// console.log("Verified Query::::::::::::::", verifiedQuery);

// let results = await searchAPI(verifiedQuery);
// console.log("results::::::::::::::", results);

// if (!results || results.length === 0) {
// console.log("No verified results found, using general search");
// results = await searchAPI(query);
// }

// const trusted = trustedSources[category] || [];
// return results.map((r) => {
// const isTrusted = trusted.some((domain) => r.link.includes(domain));
// return { ...r, trust_level: isTrusted ? "verified" : "general" };
// });
// }

// // 🔹 Controller function for route
// export const getAISearchResults = async (req, res) => {
// try {
// const { query, category } = req.query;
// if (!query) return res.status(400).json({ error: "Missing 'query' param" });
// console.log("Query::::::::::::::::::::::::", query);

// const results = await smartSearch(query, category || "general");
// res.json({ results });

// } catch (err) {
// console.error("Search Error:", err);
// res.status(500).json({ error: "Internal server error" });
// }
// };

// -----------------------------------------------------------------------------------------------------------------------------
import axios from "axios";
import trustedSources from "../trusted_sources.json" with { type: "json" };
import SearchHistory from "../model/SearchHistory.js";
import * as cheerio from "cheerio";
// import SearchHistory from "../model/SearchHistory.js";

const SERPER_URL = "https://google.serper.dev/search";
// const SERPER_API_KEY = "49d09f756085ba3e5cc2d434cdea914b271ceb05";
const SERPER_API_KEY = "4065c8aa208d00278c9dfedbc5bbeaae7aaed872";
 
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

/**
 * Apply trusted source filters to a query based on category
 * @param {string} query
 * @param {string} category
 */
// function applyTrustedFilters(query, category) {
//      console.log("query::::::::::", query);
//       console.log("category::::::::::", category);
//   const trusted = trustedSources[category] || [];
//    console.log("trusted::::::::::", trusted);
//   if (!trusted || trusted.length === 0) return query;
//   const siteFilters = trusted.map((site) => `site:${site}`).join(" OR ");
//   return `${query} (${siteFilters})`;
// }

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
  //   const verifiedQuery = applyTrustedFilters(query, category);
  //      console.log("verifiedQuery::::::::::", verifiedQuery);

  //   let results = await searchAPI(verifiedQuery);

  let results = await searchTrusted(query, category);

  //   console.log("resullllltssmartsearch::::::::::", results);

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


/**
 * Summarize content from actual trusted source URLs (under 100 words)
 * @param {string} query
 * @param {Array} results - verifiedLinks containing URLs
 */
//  async function summarizeAsk(query, results) {
//   if (!results || results.length === 0) return query;

//   // ✅ Step 1: Extract trusted URLs from results
//   const urls = [];
//   results.forEach((r) => {
//     const organic = r.organic?.[0];
//     if (organic?.link) urls.push(organic.link);
//   });

//   if (urls.length === 0) return query;

//   // ✅ Step 2: Fetch top 2-3 trusted pages
//   let combinedText = "";
//   for (const url of urls.slice(0, 3)) {
//     try {
//       const { data: html } = await axios.get(url, {
//         timeout: 8000,
//         headers: { "User-Agent": "Mozilla/5.0 (Node.js)" },
//       });

//       const $ = cheerio.load(html);

//       // ✅ Step 3: Extract meaningful text content
//       const text = $("p, h1, h2")
//         .map((_, el) => $(el).text())
//         .get()
//         .join(" ")
//         .replace(/\s+/g, " ")
//         .trim();

//       combinedText += " " + text;
//     } catch (err) {
//       console.warn(`⚠️ Could not fetch ${url}: ${err.message}`);
//     }
//   }

//   // ✅ Step 4: Filter content by query (simple relevance check)
//   const filtered = combinedText
//     .split(". ")
//     .filter((sentence) =>
//       sentence.toLowerCase().includes(query.toLowerCase().split(" ")[0])
//     )
//     .join(". ");

//   const finalText = filtered || combinedText || query;

//   // ✅ Step 5: Limit to 100 words
//   const words = finalText.split(/\s+/).slice(0, 100);
//   return words.join(" ") + (words.length >= 100 ? "..." : "");
// }

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



/**
 * Express controller
 */
// export const getAISearchResults = async (req, res) => {
//   try {
//     const { query, category = "general", raw, email } = req.body; // using POST body

//     if (!query) return res.status(400).json({ error: "Missing 'query' field" });

//     if (email) console.log(`🔹 Search request from: ${email}`);

//     let results = await smartSearch(query, category);
//     console.log("results::::::::::", results);

//     // ✅ Filter: only verified results
//     // results = results.filter((r) => r.trust_level === "general");
//     results = results.filter((r) => r.trust_level === "verified" || r.trust_level === "general");
//     console.log("Verified Results :::::::::::::", results);

// // ✅ Limit: top 5 verified links only
//     results = results.slice(0, 5);
//     console.log("Top 5 Verified Results :::::::::::::", results);

//      // ✅ Create short summary (≤100 words)
//     const summary = summarizeAsk(query);

//     // ✅ Store user search in MongoDB
//     const record = new SearchHistory({
//       email,
//       query,
//       category,
//       resultsCount: Array.isArray(results) ? results.length : 0,
//       raw: raw || false,
//     });
//     await record.save();

//     if (raw === true) {
//       // const verifiedQuery = applyTrustedFilters(query, category);
//       // const rawData = await searchAPI(verifiedQuery, { returnRaw: true });
//       const rawData = await searchAPI(query, { returnRaw: true });
//       // return res.json({ results, raw: rawData, email });
//       return res.json({
//         summary,
//         verifiedLinks: results,
//         raw: rawData,
//         email,
//       });
//     }

//     // return res.json({ email, results });
//     return res.json({
//       summary,
//       verifiedLinks: results,
//       email,
//     });
//   } catch (err) {
//     console.error("Search Error:", err);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", message: err.message });
//   }
// };
// -------------------------------------------------------------------------------------------
export const getAISearchResults = async (req, res) => {
  try {
    const { query, category = "general", raw, email } = req.body; // using POST body

    if (!query) return res.status(400).json({ error: "Missing 'query' field" });

    if (email) console.log(`🔹 Search request from: ${email}`);

    // ✅ 1. Collect all trusted site results (all related to same query)
    const allResults = [];

    // for (const source of trustedSources) {
    //   const resData = await searchTrusted(query, source);
    //   if (resData && Array.isArray(resData)) {
    //     allResults.push(...resData); // flatten from all trusted sources
    //   } else if (resData) {
    //     allResults.push(resData);
    //   }
    // }
    // Loop through each trusted source category key
    for (const categoryKey of Object.keys(trustedSources)) {
      const resData = await searchTrusted(query, categoryKey);
      console.log(`resData::::==========`, resData);
      if (resData && Array.isArray(resData)) {
        allResults.push(...resData);
      } else if (resData) {
        allResults.push(resData);
      }
    }

    console.log("All Trusted Source Results ::::::::::", allResults.length);

    // ✅ 2. Take only top 5 sources (limit)
    const topFiveResults = allResults.slice(0, 10);
    console.log("topFiveResults:::====",topFiveResults)
    // ✅ 3. From each site’s results, pick only the 1st organic link
    const verifiedLinks = topFiveResults.map((result) => ({
      searchParameters: result.searchParameters
        ? result.searchParameters
        : { q: query },
      organic:
        result.organic && result.organic.length > 0
          ? [result.organic[0]]
          : [],
    }));

    console.log("VerifiedLinks (Top 5, One Per Site) ::::::::::", verifiedLinks);

    // ✅ 4. Create summary
    // const summary = summarizeAsk(query);
    const summary = await summarizeAsk(query, verifiedLinks);


    // ✅ 5. Save to MongoDB
    const record = new SearchHistory({
      email,
      query,
      category,
      summary,  
      resultsCount: verifiedLinks.length,
      raw: raw || false,
    });
    await record.save();

    // ✅ 6. If raw requested
    if (raw === true) {
      const rawData = await searchAPI(query, { returnRaw: true });
      return res.json({
        summary,
        verifiedLinks,
        raw: rawData,
        email,
      });
    }

    // ✅ 7. Final response
    return res.json({
      summary,
      verifiedLinks,
      email,
    });
  } catch (err) {
    console.error("Search Error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};
// ---------------------------------------------------------------------


// export const getAISearchResults = async (req, res) => {
//   try {
//     // 🔹 Static response you want to send
//     const staticResponse = {
//       summary:
//         'In geometry, a hexagon (from Greek ἕξ, hex, meaning "six", and γωνία, gonía, meaning "corner, angle") is a six-sided polygon.[1] The total of the internal angles of any simple (non-self-intersecting) hexagon is 720°. A regular hexagon is defined as a hexagon that is both equilateral and equiangular. In other words, a hexagon is said to be regular if the edges are all equal in length, and each of its internal angle is equal to 120°. The Schläfli symbol denotes this polygon as {6}.',
//       verifiedLinks: [
//         {
//           searchParameters: {
//             q: 'How many sides does a hexagon have? site:wikipedia.org',
//             type: 'search',
//             engine: 'google',
//           },
//           organic: [
//             {
//               title: 'Hexagon',
//               link: 'https://en.wikipedia.org/wiki/Hexagon',
//               snippet:
//                 'In geometry, a hexagon is a six-sided polygon. The total of the internal angles of any simple (non-self-intersecting) hexagon is 720°. Contents.',
//               position: 1,
//             },
//           ],
//         },
//         {
//           searchParameters: {
//             q: 'How many sides does a hexagon have? site:britannica.com',
//             type: 'search',
//             engine: 'google',
//           },
//           organic: [
//             {
//               title: 'Hexagon | Definition, Shape, Area, Angles, & Sides',
//               link: 'https://www.britannica.com/science/hexagon',
//               snippet:
//                 'Hexagon, in geometry, a six-sided polygon. In a regular hexagon, all sides are the same length, and each internal angle is 120 degrees.',
//               date: 'Sep 12, 2025',
//               position: 1,
//             },
//           ],
//         },
//         {
//           searchParameters: {
//             q: 'How many sides does a hexagon have? site:quora.com',
//             type: 'search',
//             engine: 'google',
//           },
//           organic: [
//             {
//               title: 'How many sides does a hexagon have?',
//               link: 'https://www.quora.com/How-many-sides-does-a-hexagon-have',
//               snippet:
//                 'A hexagon is a 2D geometric polygon that has six sides and six angles. It has no curved sides and all the lines are closed.',
//               date: '10 years ago',
//               sitelinks: [
//                 {
//                   title: '20 answers',
//                   link: 'https://www.quora.com/How-many-sides-does-a-hexagon-have?top_ans=127935231',
//                 },
//               ],
//               position: 1,
//             },
//           ],
//         },
//         {
//           searchParameters: {
//             q: 'How many sides does a hexagon have? site:reddit.com',
//             type: 'search',
//             engine: 'google',
//           },
//           organic: [
//             {
//               title: 'TIL a hexagon has 8 sides : r/confidentlyincorrect',
//               link: 'https://www.reddit.com/r/confidentlyincorrect/comments/15v9p64/til_a_hexagon_has_8_sides/',
//               snippet:
//                 'But a hexagon does have 8 sides and I can prove it! The october is the 10th month, therefore an octagon has 10 sides.',
//               date: '2 years ago',
//               position: 1,
//             },
//           ],
//         },
//         {
//           searchParameters: {
//             q: 'How many sides does a hexagon have? site:medium.com',
//             type: 'search',
//             engine: 'google',
//           },
//           organic: [
//             {
//               title: 'How to make a HEXAGON in CSS',
//               link: 'https://medium.com/@jenthorn_/how-to-make-a-hexagon-in-css-8ee61d5ebae5',
//               snippet:
//                 'Because hexagons have 6 sides that are equal we get 1.73. I read this in a how to make a quilt tutorial btw.',
//               date: '10 years ago',
//               position: 1,
//             },
//           ],
//         },
//       ],
//       email: 'user4@gmail.com',
//     };

//     // ✅ Return the static response directly
//     return res.json(staticResponse);
//   } catch (err) {
//     console.error('Search Error:', err);
//     return res
//       .status(500)
//       .json({ error: 'Internal server error', message: err.message });
//   }
// };


// ✅ Get search history for a specific user (POST method)
export const getUserSearchHistory = async (req, res) => {
  try {
    const { email } = req.body; // now using body instead of query

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

