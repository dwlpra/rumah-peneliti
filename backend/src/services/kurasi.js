const { runMultiAgentPipeline, generateMockResult } = require("./multi-agent");
const { curateWith0GCompute } = require("./og-compute");

/**
 * AI Kurasi Service — Priority: 0G Compute → Multi-Agent Pipeline → Mock
 */
async function curate(paperId, title, abstract, textContent) {
  // 1. Try 0G Compute Network (primary)
  try {
    const ogResult = await curateWith0GCompute(title, abstract, textContent);
    if (ogResult) {
      console.log("[Kurasi] 0G Compute succeeded");
      return ogResult;
    }
  } catch (e) {
    console.warn("[Kurasi] 0G Compute failed:", e.message);
  }

  // 2. Try Multi-Agent Pipeline (fallback)
  try {
    const result = await runMultiAgentPipeline(paperId, title, abstract, textContent);
    if (result) {
      console.log("[Kurasi] Multi-Agent pipeline succeeded — agents:", result.meta?.agents_used?.join(", "));
      return result;
    }
  } catch (e) {
    console.warn("[Kurasi] Multi-Agent pipeline failed:", e.message);
  }

  // 3. Final fallback to mock
  console.log("[Kurasi] All AI agents unavailable, using mock result");
  return generateMockResult(title, abstract || "");
}

module.exports = { generateArticle: curate };
