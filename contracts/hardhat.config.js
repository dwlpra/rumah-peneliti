require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      viaIR: true,
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    zeroTestnet: {
      url: process.env.ZERO_TESTNET_RPC || "https://evmrpc-testnet.0g.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 16602,
    },
    zeroMainnet: {
      url: process.env.ZERO_MAINNET_RPC || "https://evmrpc.0g.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 16661,
    },
  },
};
