/**
 * Wallet Status Controller
 *
 * Cek saldo wallet backend yang sponsor gas fee.
 * Wallet ini membayar semua biaya transaksi on-chain.
 */

const { ethers } = require("ethers");

const WALLET_ADDRESS = "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55";

async function walletStatus(req, res) {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL || "https://evmrpc.0g.ai"
  );

  const balance = await provider.getBalance(WALLET_ADDRESS);
  const balance0G = Number(ethers.formatEther(balance));

  res.json({
    address: WALLET_ADDRESS,
    balance: balance0G.toFixed(4) + " 0G",
    balanceRaw: balance0G,
    canSponsor: balance0G > 0.01,  // Cukup untuk sponsor beberapa transaksi?
    network: "0G Mainnet",
    chainId: 16661,
  });
}

module.exports = walletStatus;
