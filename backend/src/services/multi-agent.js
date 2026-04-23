/**
 * Multi-Agent AI Research Pipeline
 * 3 specialized agents run in parallel for paper analysis
 * Agent 4 (Reviewer) runs on-demand when users chat
 */

const API_KEY = process.env.LLM_API_KEY || "";
const API_BASE = "https://api.z.ai/api/paas/v4";
const MODEL = "glm-5.1";

async function callLLM(systemPrompt, userPrompt, temperature = 0.7, maxTokens = 4000) {
  if (!API_KEY) throw new Error("No API key");

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => "unknown")}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response");

  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");
  return JSON.parse(jsonMatch[0]);
}

// ═══════════════════════════════════════════════
// AGENT 1: Summarizer — Article Generation
// ═══════════════════════════════════════════════
async function agentSummarizer(title, text) {
  return callLLM(
    `You are Agent Summarizer, a specialized AI research journalist. Your sole purpose is transforming academic papers into engaging, accessible articles. You write in clear, journalistic English. You always produce structured JSON output.`,
    `Transform this academic paper into an engaging article.

PAPER TITLE: ${title}
PAPER CONTENT:
${text.slice(0, 10000)}

Respond in EXACTLY this JSON format (no markdown):
{
  "curated_title": "a catchy, engaging article title (NOT the original title)",
  "summary": "a compelling 2-3 sentence summary that hooks the reader",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4"],
  "body": "full article 5-8 paragraphs, accessible language, paragraphs separated by blank lines"
}`,
    0.7, 4000
  );
}

// ═══════════════════════════════════════════════
// AGENT 2: Scorer — Quality Assessment
// ═══════════════════════════════════════════════
async function agentScorer(title, text) {
  return callLLM(
    `You are Agent Scorer, a specialized AI research quality evaluator. You assess academic papers across 4 dimensions with rigorous, evidence-based scoring. You are critical but fair. You always produce structured JSON output.`,
    `Evaluate this research paper's quality across 4 dimensions.

PAPER TITLE: ${title}
PAPER CONTENT:
${text.slice(0, 10000)}

Score each dimension 0-100 with brief reasoning.

Respond in EXACTLY this JSON format (no markdown):
{
  "novelty": 75,
  "clarity": 80,
  "methodology": 70,
  "impact": 85,
  "reasoning_novelty": "How original is this research? What makes it novel or derivative?",
  "reasoning_clarity": "How well-written and structured is the paper?",
  "reasoning_methodology": "How rigorous is the experimental/research approach?",
  "reasoning_impact": "What is the potential real-world or academic impact?"
}`,
    0.3, 1500
  );
}

// ═══════════════════════════════════════════════
// AGENT 3: Tagger — Classification & Tagging
// ═══════════════════════════════════════════════
async function agentTagger(title, text) {
  return callLLM(
    `You are Agent Tagger, a specialized AI research classifier. You categorize academic papers by domain, topic, and research type. You produce concise, accurate classifications. You always produce structured JSON output.`,
    `Classify and tag this research paper.

PAPER TITLE: ${title}
PAPER CONTENT:
${text.slice(0, 6000)}

Respond in EXACTLY this JSON format (no markdown):
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "domain": "primary research domain (e.g., Computer Science, Medicine, Physics)",
  "subdomain": "specific subdomain (e.g., Distributed Systems, Cardiology)",
  "research_type": "one of: survey, experimental, theoretical, applied, case-study",
  "difficulty": "one of: beginner, intermediate, advanced, expert"
}`,
    0.3, 800
  );
}

// ═══════════════════════════════════════════════
// ORCHESTRATOR — Runs all agents in parallel
// ═══════════════════════════════════════════════
async function runMultiAgentPipeline(paperId, title, abstract, textContent) {
  const text = textContent || abstract || "";
  const startTime = Date.now();

  console.log(`[Multi-Agent] Starting pipeline for paper #${paperId}: "${title}"`);
  console.log("[Multi-Agent] Launching 3 agents in parallel: Summarizer, Scorer, Tagger");

  // Run all 3 agents in parallel
  const [summarizerResult, scorerResult, taggerResult] = await Promise.allSettled([
    agentSummarizer(title, text),
    agentScorer(title, text),
    agentTagger(title, text),
  ]);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Extract results (with fallbacks)
  const summary = summarizerResult.status === "fulfilled" ? summarizerResult.value : null;
  const score = scorerResult.status === "fulfilled" ? scorerResult.value : null;
  const tags = taggerResult.status === "fulfilled" ? taggerResult.value : null;

  const agentsUsed = [
    summarizerResult.status === "fulfilled" ? "Summarizer" : null,
    scorerResult.status === "fulfilled" ? "Scorer" : null,
    taggerResult.status === "fulfilled" ? "Tagger" : null,
  ].filter(Boolean);

  console.log(`[Multi-Agent] Completed in ${elapsed}s — Agents: ${agentsUsed.join(", ")}`);

  // Log failures
  if (summarizerResult.status === "rejected") console.warn("[Multi-Agent] Summarizer failed:", summarizerResult.reason?.message);
  if (scorerResult.status === "rejected") console.warn("[Multi-Agent] Scorer failed:", scorerResult.reason?.message);
  if (taggerResult.status === "rejected") console.warn("[Multi-Agent] Tagger failed:", taggerResult.reason?.message);

  // Merge results
  return {
    curated_title: summary?.curated_title || title,
    summary: summary?.summary || "",
    key_takeaways: summary?.key_takeaways || [],
    body: summary?.body || "",
    tags: tags?.tags || ["research"],
    ai_score: score ? {
      novelty: score.novelty || 0,
      clarity: score.clarity || 0,
      methodology: score.methodology || 0,
      impact: score.impact || 0,
      reasoning_novelty: score.reasoning_novelty || "",
      reasoning_clarity: score.reasoning_clarity || "",
      reasoning_methodology: score.reasoning_methodology || "",
      reasoning_impact: score.reasoning_impact || "",
    } : null,
    classification: tags ? {
      domain: tags.domain || "",
      subdomain: tags.subdomain || "",
      research_type: tags.research_type || "",
      difficulty: tags.difficulty || "",
    } : null,
    meta: {
      agents_used: agentsUsed,
      pipeline_time_ms: Date.now() - startTime,
      total_agents: 3,
      successful_agents: agentsUsed.length,
    },
    mock: false,
  };
}

// ═══════════════════════════════════════════════
// MOCK FALLBACK (when all agents fail)
// ═══════════════════════════════════════════════
function generateMockResult(title, abstract) {
  return {
    curated_title: `Deep Dive: ${title}`,
    summary: `A groundbreaking study on "${title}" presents exciting new perspectives. ${abstract ? `Focusing on ${abstract.slice(0, 100)}...` : "This research opens new insights in its field."}`,
    key_takeaways: [
      "An innovative new approach to research methodology",
      "Experimental results show significant improvements",
      "Opens new directions for further research",
      "Practical implications relevant to industry",
    ],
    body: `The research titled "${title}" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.\n\nThe research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.\n\nOne of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.\n\nThe implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.\n\nHowever, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.\n\nLooking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.`,
    tags: ["research", "innovation", "technology", "academic"],
    ai_score: {
      novelty: 65 + Math.floor(Math.random() * 20),
      clarity: 60 + Math.floor(Math.random() * 25),
      methodology: 55 + Math.floor(Math.random() * 30),
      impact: 50 + Math.floor(Math.random() * 35),
      reasoning_novelty: "Automated assessment — AI agents unavailable",
      reasoning_clarity: "Automated assessment — AI agents unavailable",
      reasoning_methodology: "Automated assessment — AI agents unavailable",
      reasoning_impact: "Automated assessment — AI agents unavailable",
    },
    classification: {
      domain: "General",
      subdomain: "Interdisciplinary",
      research_type: "applied",
      difficulty: "intermediate",
    },
    meta: {
      agents_used: [],
      pipeline_time_ms: 0,
      total_agents: 3,
      successful_agents: 0,
    },
    mock: true,
  };
}

module.exports = {
  runMultiAgentPipeline,
  generateMockResult,
  agentSummarizer,
  agentScorer,
  agentTagger,
  callLLM,
};
