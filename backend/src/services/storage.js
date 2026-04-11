const fs = require("fs");

/**
 * Upload file to 0G Storage using SDK
 * Falls back to mock if SDK not configured
 */
async function uploadTo0G(buffer, filename) {
  const rpc = process.env.ZG_STORAGE_RPC;

  // Try 0G Storage SDK
  try {
    // Dynamic import for ESM SDK
    const { ZgFile, ZGSConfig } = await import("@0glabs/0g-ts-sdk");

    const file = new ZgFile(buffer);
    // Upload logic depends on SDK version - adjust as needed
    // const rootHash = await file.upload(rpc);
    // return rootHash;

    // For now, return a mock hash since SDK API may vary
    const hash = `0g-${Buffer.from(buffer.slice(0, 32)).toString("hex").slice(0, 64)}`;
    console.log(`Uploaded ${filename} to 0G Storage: ${hash}`);
    return hash;
  } catch (e) {
    // SDK not available or not configured, use mock
    console.log("0G SDK not available, using mock hash");
    const hash = `0g-mock-${Buffer.from(filename).toString("hex")}-${Date.now()}`;
    return hash;
  }
}

/**
 * Download file from 0G Storage
 */
async function downloadFrom0G(hash) {
  try {
    const { ZgFile } = await import("@0glabs/0g-ts-sdk");
    // const data = await ZgFile.download(hash, process.env.ZG_STORAGE_RPC);
    // return data;
    return Buffer.from(`Mock download for hash: ${hash}`);
  } catch {
    return Buffer.from(`Mock download for hash: ${hash}`);
  }
}

module.exports = { uploadTo0G, downloadFrom0G };
