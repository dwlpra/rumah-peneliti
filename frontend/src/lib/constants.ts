export const EXPLORER_URL = "https://chainscan.0g.ai";

export const CONTRACTS = {
  journalPayment: "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2",
  paperAnchor: "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE",
  researchNFT: "0x5495b92aca76B4414C698f60CdaAD85B364011a1",
  agentNFT: "0x9ebf66F0818db38BD55f1337b8a83E97c8e095C6", // 4 Agent NFTs: AI Kurator (#1), Summarizer (#2), Scorer (#3), Tagger (#4)
  agentTipJar: "0x7e59BB6ff6C58D03C07bdFC35040b4A08779A9f6", // Agent Tip Jar — on-chain tipping for Agentic Economy
};

export const AGENT_IDS = {
  kurator: 1,
  summarizer: 2,
  scorer: 3,
  tagger: 4,
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
