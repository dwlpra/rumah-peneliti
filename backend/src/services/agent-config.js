/**
 * Agent Configuration
 *
 * Static metadata for the 4 pipeline AI agents.
 * On-chain identity is managed by 0G Agentic ID (ERC-7857) contract.
 * This config provides the metadata that isn't stored on-chain (name, type, model, etc.)
 */

const AGENTS = [
  {
    agenticId: 0,
    name: "AI Kurator",
    type: "Kurator",
    model: "0G Compute Network",
    capabilities: ["summarize", "score", "tag", "classify", "review"],
    description: "Multi-agent research curation pipeline orchestrator. Coordinates the Summarizer, Scorer, and Tagger agents for comprehensive paper analysis.",
  },
  {
    agenticId: 1,
    name: "Summarizer",
    type: "Summarizer",
    model: "0G Compute Network",
    capabilities: ["summarize", "generate_article", "key_takeaways", "extract_findings"],
    description: "Generates concise summaries and engaging articles from academic papers. Transforms dense research into accessible content.",
  },
  {
    agenticId: 2,
    name: "Scorer",
    type: "Scorer",
    model: "0G Compute Network",
    capabilities: ["score", "evaluate", "assess_quality", "reason"],
    description: "Evaluates research papers across 4 dimensions: novelty, clarity, methodology, and impact. Provides rigorous, evidence-based quality assessment.",
  },
  {
    agenticId: 3,
    name: "Tagger",
    type: "Tagger",
    model: "0G Compute Network",
    capabilities: ["tag", "classify", "categorize", "domain_detect"],
    description: "Classifies research papers by domain, subdomain, research type, and difficulty. Produces concise, accurate classifications.",
  },
];

/**
 * Get agent config by AgenticID token ID (0-indexed)
 */
function getAgentConfig(agenticId) {
  return AGENTS.find(a => a.agenticId === agenticId) || null;
}

/**
 * Get all agent configs
 */
function getAllAgentConfigs() {
  return AGENTS;
}

/**
 * Map old AgentNFT token IDs (1-4) to new AgenticID token IDs (0-3)
 */
function mapOldTokenId(oldId) {
  const map = { 1: 0, 2: 1, 3: 2, 4: 3 };
  return map[oldId] !== undefined ? map[oldId] : oldId;
}

module.exports = { AGENTS, getAgentConfig, getAllAgentConfigs, mapOldTokenId };
