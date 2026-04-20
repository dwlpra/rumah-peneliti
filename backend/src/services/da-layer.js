const { ethers } = require("ethers");

/**
 * 0G DA (Data Availability) Layer Client
 * Publishes data availability proofs for research papers
 */

const DA_RPC = "https://evmrpc-testnet.0g.ai";

async function publishDAProof(storageRoot, metadataHash) {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured");

  const provider = new ethers.JsonRpcProvider(DA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Create blob commitment
  const blobData = ethers.toUtf8Bytes(JSON.stringify({
    storageRoot,
    metadataHash,
    timestamp: Date.now(),
    version: "rumahpeneliti-v1",
  }));

  const blobHash = ethers.keccak256(blobData);

  // Submit DA commitment as on-chain transaction
  const tx = await wallet.sendTransaction({
    to: wallet.address,
    data: ethers.concat([
      ethers.toUtf8Bytes("RP:DA:"),
      ethers.getBytes(blobHash),
    ]),
    value: 0,
  });

  const receipt = await tx.wait();
  console.log("[0G DA] Proof published. Tx:", receipt.hash);

  return {
    blobHash,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    dataRoot: ethers.keccak256(ethers.concat([blobHash, ethers.toUtf8Bytes(storageRoot)])),
  };
}

module.exports = { publishDAProof };
