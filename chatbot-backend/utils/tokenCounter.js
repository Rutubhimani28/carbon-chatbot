// import fs from "fs";
// import { encoding_for_model } from "tiktoken";
// import { Tokenizer } from "@huggingface/tokenizers";

// // Preload Hugging Face tokenizers
// const hfTokenizers = {};

// // Example: load Hugging Face tokenizer JSON files
// // You need to have tokenizer JSON for each HF model locally
// // or use pre-built HF tokenizers.
// function loadHFTokenizer(modelName, tokenizerPath) {
//   if (!hfTokenizers[modelName]) {
//     hfTokenizers[modelName] = Tokenizer.fromFile(tokenizerPath);
//   }
//   return hfTokenizers[modelName];
// }

// // Count tokens
// export function countTokens(text, botName) {
//   let tokens = 0;

//   // OpenAI models
//   if (botName === "chatgpt-5-mini" || botName === "gpt-4o-mini") {
//     const enc = encoding_for_model("gpt-4o-mini"); // Replace with exact model
//     tokens = enc.encode(text).length;
//     enc.free();
//   }
//   // Hugging Face models
//   else if (botName === "deepseek") {
//     const tokenizer = loadHFTokenizer(
//       "deepseek",
//       "./tokenizers/deepseek-tokenizer.json"
//     );
//     tokens = tokenizer.encode(text).length;
//   } else if (botName === "grok") {
//     const tokenizer = loadHFTokenizer(
//       "grok",
//       "./tokenizers/grok-tokenizer.json"
//     );
//     tokens = tokenizer.encode(text).length;
//   } else {
//     // fallback: simple word-based approximation
//     tokens = text.split(/\s+/).length;
//   }

//   return tokens;
// }

import { encoding_for_model } from "tiktoken";

// Count tokens for any OpenAI model
export function countTokens(text, modelName = "gpt-4o-mini") {
  try {
    const enc = encoding_for_model(modelName);
    const tokens = enc.encode(text).length;
    enc.free(); // free memory
    return tokens;
  } catch (error) {
    console.warn(
      `tiktoken failed for model ${modelName}, falling back to word count`,
      error
    );
    // return text.split(/\s+/).length;
    return (text || "").trim().split(/\s+/).length;
  }
}
