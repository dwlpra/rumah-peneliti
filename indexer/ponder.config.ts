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
      address: "0x4ad80352231407Afa845c5428fa8fE870b4509A9",
      startBlock: 28937500,
    },
    ResearchNFT: {
      network: "zeroMainnet",
      abi: ResearchNFT.abi,
      address: "0x78C414367A91917fe5DC8123119467c9910a4B6d",
      startBlock: 28939000,
    },
    JournalPayment: {
      network: "zeroMainnet",
      abi: JournalPayment.abi,
      address: "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2",
      startBlock: 28937500,
    },
  },
  database: {
    kind: "pglite",
  },
});
