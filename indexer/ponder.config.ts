import { createConfig } from "@ponder/core";
import { http } from "viem";

// Load ABIs from contract artifacts
import PaperAnchor from "../contracts/artifacts/contracts/PaperAnchor.sol/PaperAnchor.json" assert { type: "json" };
import ResearchNFT from "../contracts/artifacts/contracts/ResearchNFT.sol/ResearchNFT.json" assert { type: "json" };
import JournalPayment from "../contracts/artifacts/contracts/JournalPayment.sol/JournalPayment.json" assert { type: "json" };

export default createConfig({
  networks: {
    zeroMainnet: {
      chainId: 16661,
      transport: http(process.env.RPC_URL || "https://evmrpc.0g.ai"),
    },
  },
  contracts: {
    PaperAnchor: {
      network: "zeroMainnet",
      abi: PaperAnchor.abi,
      address: "0x335C0b922325dd5214Bb9e7CDcA6a61A24B0d8C7",
      startBlock: 28937500,
    },
    ResearchNFT: {
      network: "zeroMainnet",
      abi: ResearchNFT.abi,
      address: "0x010a70be3D661B98f69Ab4De1e213CA56C90de4a",
      startBlock: 28939000,
    },
    JournalPayment: {
      network: "zeroMainnet",
      abi: JournalPayment.abi,
      address: "0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0",
      startBlock: 28937500,
    },
  },
  database: {
    kind: "pglite",
  },
});
