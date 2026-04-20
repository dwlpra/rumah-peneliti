const { generateArticle, callGLM, generateMockArticle } = require("./kurasi-core");
const { curateWith0GCompute } = require("./og-compute");

/**
 * AI Kurasi Service — Priority: 0G Compute → GLM API → Mock
 */
async function curate(paperId, title, abstract, textContent) {
  // 1. Try 0G Compute Network first (decentralized AI)
  const ogResult = await curateWith0GCompute(title, abstract, textContent);
  if (ogResult) return ogResult;

  // 2. Fallback to GLM API (Z.AI)
  try {
    return await callGLM(paperId, title, [title, abstract, textContent].filter(Boolean).join("\n\n"));
  } catch (e) {
    console.warn("GLM API failed, using mock:", e.message);
  }

  // 3. Final fallback to mock
  return generateMockArticle(paperId, title, abstract || "");
}

module.exports = { generateArticle: curate };
