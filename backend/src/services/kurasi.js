const { runMultiAgentPipeline, generateMockResult } = require("./multi-agent");
const { curateWith0GCompute } = require("./og-compute");

/**
 * AI Kurasi Service — Priority: Multi-Agent Pipeline → 0G Compute → Mock
 *
 * Multi-Agent Architecture:
 *   Agent 1: Summarizer  — generates article, summary, key takeaways
 *   Agent 2: Scorer      — assesses novelty, clarity, methodology, impact
 *   Agent 3: Tagger      — classifies domain, tags, research type
 *   Agent 4: Reviewer    — answers reader questions (on-demand, via /chat endpoint)
 */
async function curate(paperId, title, abstract, textContent) {
  // 1. Try Multi-Agent Pipeline (3 parallel agents via GLM API)
  try {
    const result = await runMultiAgentPipeline(paperId, title, abstract, textContent);
    if (result && !result.mock) return result;
  } catch (e) {
    console.warn("[Kurasi] Multi-Agent pipeline failed:", e.message);
  }

  // 2. Try 0G Compute Network (single agent fallback)
  const ogResult = await curateWith0GCompute(title, abstract, textContent);
  if (ogResult) return ogResult;

  // 3. Final fallback to mock
  console.log("[Kurasi] All AI agents unavailable, using mock");
  return generateMockResult(title, abstract || "");
}

module.exports = { generateArticle: curate };
