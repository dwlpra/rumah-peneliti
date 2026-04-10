require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    zeroTestnet: {
      url: process.env.ZERO_TESTNET_RPC || "https://evm-rpc.zero-testnet.xdao.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    zeroMainnet: {
      url: process.env.ZERO_MAINNET_RPC || "https://evm-rpc.0g.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
