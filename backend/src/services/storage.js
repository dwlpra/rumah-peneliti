const { ZgFile, Indexer } = require("@0glabs/0g-ts-sdk");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const INDEXER_URL = "https://indexer-storage-testnet-turbo.0g.ai";
const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/**
 * Upload a file to 0G Storage network
 * @param {string} filePath - Local file path to upload
 * @returns {Promise<{rootHash: string, txHash: string}>}
 */
async function uploadTo0G(filePath) {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not configured for 0G Storage uploads");
  }

  const signer = new ethers.Wallet(PRIVATE_KEY, new ethers.JsonRpcProvider(RPC_URL));
  const indexer = new Indexer(INDEXER_URL);

  // Open file for upload
  const file = await ZgFile.fromFilePath(filePath);

  try {
    const [rootHash, err] = await indexer.upload(file, RPC_URL, signer);

    if (err) {
      throw new Error(`0G Storage upload failed: ${err.message}`);
    }

    console.log(`Uploaded to 0G Storage: rootHash=${rootHash}, file=${path.basename(filePath)}`);
    return { rootHash, txHash: rootHash };
  } finally {
    await file.close();
  }
}

/**
 * Upload a buffer to 0G Storage (write to temp file first, then upload)
 * @param {Buffer} buffer - Data to upload
 * @param {string} filename - Original filename for logging
 * @returns {Promise<{rootHash: string, txHash: string}>}
 */
async function uploadBufferTo0G(buffer, filename) {
  const tmpPath = path.join("/tmp", `0g-upload-${Date.now()}-${filename}`);
  fs.writeFileSync(tmpPath, buffer);

  try {
    return await uploadTo0G(tmpPath);
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

/**
 * Download a file from 0G Storage
 * @param {string} rootHash - The root hash of the uploaded data
 * @param {string} outputPath - Where to save the downloaded file
 * @returns {Promise<string>} - Path to downloaded file
 */
async function downloadFrom0G(rootHash, outputPath) {
  const indexer = new Indexer(INDEXER_URL);
  const err = await indexer.download(rootHash, outputPath, false);

  if (err) {
    throw new Error(`0G Storage download failed: ${err.message}`);
  }

  console.log(`Downloaded from 0G Storage: ${rootHash} -> ${outputPath}`);
  return outputPath;
}

module.exports = { uploadTo0G, uploadBufferTo0G, downloadFrom0G };
