import { createConfig } from "@ponder/core";
import { http } from "viem";

// Load ABIs from contract artifacts
import PaperAnchor from "../contracts/artifacts/contracts/PaperAnchor.sol/PaperAnchor.json" assert { type: "json" };
import ResearchNFT from "../contracts/artifacts/contracts/ResearchNFT.sol/ResearchNFT.json" assert { type: "json" };
import JournalPayment from "../contracts/artifacts/contracts/JournalPayment.sol/JournalPayment.json" assert { type: "json" };

export default createConfig({
  networks: {
    zeroTestnet: {
      chainId: 16602,
      transport: http(process.env.RPC_URL || "https://evmrpc-testnet.0g.ai"),
    },
  },
  contracts: {
    PaperAnchor: {
      network: "zeroTestnet",
      abi: PaperAnchor.abi,
      address: "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE",
      startBlock: 28937500,
    },
    ResearchNFT: {
      network: "zeroTestnet",
      abi: ResearchNFT.abi,
      address: "0x5495b92aca76B4414C698f60CdaAD85B364011a1",
      startBlock: 28939000,
    },
    JournalPayment: {
      network: "zeroTestnet",
      abi: JournalPayment.abi,
      address: "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2",
      startBlock: 28937500,
    },
  },
  database: {
    kind: "pglite",
  },
});
