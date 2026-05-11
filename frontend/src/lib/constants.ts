export const EXPLORER_URL = "https://chainscan.0g.ai";

export const CONTRACTS = {
  journalPayment: "0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0",
  paperAnchor: "0x335C0b922325dd5214Bb9e7CDcA6a61A24B0d8C7",
  researchNFT: "0x010a70be3D661B98f69Ab4De1e213CA56C90de4a",
  agentNFT: "0x9ebf66F0818db38BD55f1337b8a83E97c8e095C6", // 4 Agent NFTs: AI Kurator (#1), Summarizer (#2), Scorer (#3), Tagger (#4)
  agentTipJar: "0x7e59BB6ff6C58D03C07bdFC35040b4A08779A9f6", // Agent Tip Jar — on-chain tipping for Agentic Economy
  agenticId: "0x82c5e31880929de181E5DF78D60f342168d18115", // 0G Agentic ID (ERC-7857) — verified on-chain agent identity
};

export const AGENT_IDS = {
  kurator: 1,
  summarizer: 2,
  scorer: 3,
  tagger: 4,
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
