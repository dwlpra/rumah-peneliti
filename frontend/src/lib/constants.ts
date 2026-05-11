export const EXPLORER_URL = "https://chainscan.0g.ai";

export const CONTRACTS = {
  journalPayment: "0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0",
  paperAnchor: "0x335C0b922325dd5214Bb9e7CDcA6a61A24B0d8C7",
  researchNFT: "0x010a70be3D661B98f69Ab4De1e213CA56C90de4a",
  agentTipJar: "0xc215A541aF7ad5072B08641272248801c5590e9a", // Agent Tip Jar (ERC-7857 Agentic ID)
  agenticId: "0x82c5e31880929de181E5DF78D60f342168d18115", // 0G Agentic ID (ERC-7857) — verified on-chain agent identity
};

// AgenticID token IDs (0-indexed): Kurator #0, Summarizer #1, Scorer #2, Tagger #3
export const AGENT_IDS = {
  kurator: 0,
  summarizer: 1,
  scorer: 2,
  tagger: 3,
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
