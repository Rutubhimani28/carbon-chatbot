// import { encoding_for_model } from "tiktoken";

// // Count tokens for any OpenAI model
// export function countTokens(text, modelName = "gpt-4o-mini") {
//   try {
//     const enc = encoding_for_model(modelName);
//     const tokens = enc.encode(text).length;
//     enc.free(); // free memory
//     return tokens;
//   } catch (error) {
//     console.warn(
//       `tiktoken failed for model ${modelName}, falling back to word count`,
//       error
//     );
//     // return text.split(/\s+/).length;
//     return (text || "").trim().split(/\s+/).length;
//   }
// }

// tokenCounter.js
import { encoding_for_model } from "tiktoken";
import { AutoTokenizer } from "@xenova/transformers";

let grokTokenizer = null;

// Lazy-load Grok tokenizer
async function getGrokTokenizer() {
  if (!grokTokenizer) {
    grokTokenizer = await AutoTokenizer.from_pretrained(
      "Xenova/grok-1-tokenizer"
    );
  }
  return grokTokenizer;
}

// Async function to count tokens
// export async function countTokens(text, modelName = "gpt-4o-mini") {
//   try {
//     if (!text) return 0;

//     // Case 1: Grok models
//     if (modelName.toLowerCase().startsWith("grok")) {
//       const tokenizer = await getGrokTokenizer();
//       const tokens = tokenizer.encode(text);
//       return tokens.length;
//     }

//     // Case 2: OpenAI models
//     const enc = encoding_for_model(modelName);
//     const tokens = enc.encode(text).length;
//     enc.free();
//     return tokens;
//   } catch (error) {
//     console.warn(
//       `Tokenizer failed for model ${modelName}, fallback to word count`,
//       error
//     );
//     return (text || "").trim().split(/\s+/).length;
//   }
// }
// export async function countTokens(text, modelName = "gpt-4o-mini") {
//   try {
//     if (!text) return 0;

//     // Map invalid model names to valid ones
//     let validModel = modelName;
//     if (modelName === "chatgpt-5-mini") validModel = "gpt-4o-mini";
//     // Add more mappings if needed, e.g., grok models
//     else if (modelName.toLowerCase().startsWith("grok")) {
//       // For grok, fallback to word count (or implement Grok tokenizer if available)
//       return text.trim().split(/\s+/).length;
//     }

//     // OpenAI model tokenization
//     const enc = encoding_for_model(validModel);
//     const tokenCount = enc.encode(text).length;
//     enc.free();
//     return tokenCount;
//   } catch (err) {
//     console.warn(
//       `Tokenizer failed for model ${modelName}, fallback to word count`,
//       err
//     );
//     return text.trim().split(/\s+/).length;
//   }
// }

export async function countTokens(text, modelName = "gpt-4o-mini") {
  try {
    if (!text) return 0;

    let validModel = modelName;

    // ✅ Map aliases
    if (modelName === "chatgpt-5-mini") {
      validModel = "gpt-4o-mini";
    }

    // ✅ Case 1: Grok models → use Xenova tokenizer
    if (validModel.toLowerCase().startsWith("grok")) {
      const tokenizer = await getGrokTokenizer();
      const tokens = await tokenizer.encode(text);
      return tokens.length;
    }

    // ✅ Case 2: OpenAI models → use tiktoken
    const enc = encoding_for_model(validModel);
    const tokenCount = enc.encode(text).length;
    enc.free();
    return tokenCount;
  } catch (err) {
    console.warn(
      `Tokenizer failed for model ${modelName}, fallback to word count`,
      err
    );
    return text.trim().split(/\s+/).length;
  }
}

// Word counter stays sync
// export function countWords(text) {
//   if (!text) return 0;
//   return text.trim().split(/\s+/).length;
// }

export function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}
