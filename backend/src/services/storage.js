/**
 * ============================================================
 *  0G Storage — Upload & Download Files
 * ============================================================
 *
 *  0G Storage adalah jaringan penyimpanan file terdesentralisasi.
 *  File di-upload ke node storage, lalu mendapat "root hash"
 *  yang berfungsi sebagai alamat unik file tersebut.
 *
 *  Cara kerja:
 *    1. File dibaca dari disk
 *    2. Dikirim ke 0G Storage via Indexer
 *    3. Indexer memilih node storage untuk menyimpan file
 *    4. Hasilnya: rootHash (hash file) + txHash (bukti transaksi)
 *
 *  Analogi sederhana:
 *    rootHash = "alamat rumah" file di jaringan storage
 *    txHash   = "bukti pengiriman" bahwa file berhasil di-upload
 *
 * ============================================================
 */

const { ZgFile, Indexer } = require("@0gfoundation/0g-ts-sdk");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Konfigurasi koneksi ke 0G Storage
const INDEXER_URL = process.env.STORAGE_INDEXER || "https://indexer-storage-turbo.0g.ai";
const RPC_URL = process.env.RPC_URL || "https://evmrpc.0g.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/**
 * Upload file ke 0G Storage network
 *
 * @param {string} filePath - Path file lokal yang mau di-upload (misal: /uploads/abc-paper.pdf)
 * @returns {Promise<{rootHash: string, txHash: string}>}
 *   - rootHash: Hash unik file di jaringan storage (alamat file)
 *   - txHash: Hash transaksi blockchain sebagai bukti upload
 *
 * @example
 *   const result = await uploadTo0G("/uploads/my-paper.pdf");
 *   console.log(result.rootHash); // "0xabc123..."
 *   console.log(result.txHash);   // "0xdef456..."
 */
async function uploadTo0G(filePath) {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not configured for 0G Storage uploads");
  }

  // Siapkan wallet untuk signing transaksi (bayar gas)
  const signer = new ethers.Wallet(PRIVATE_KEY, new ethers.JsonRpcProvider(RPC_URL));

  // Indexer adalah "pintu masuk" ke jaringan storage
  // Dia yang menentukan node mana yang akan menyimpan file
  const indexer = new Indexer(INDEXER_URL);

  // Buka file untuk di-upload
  const file = await ZgFile.fromFilePath(filePath);

  try {
    // Upload file ke jaringan storage
    const [rootHash, err] = await indexer.upload(file, RPC_URL, signer);

    if (err) {
      throw new Error(`0G Storage upload failed: ${err.message}`);
    }

    // SDK v1.2.1 bisa return string atau object
    const rootHashStr = typeof rootHash === "string" ? rootHash : rootHash.rootHash;
    const txHashStr = typeof rootHash === "string" ? rootHash : rootHash.txHash;

    console.log(`Uploaded to 0G Storage: rootHash=${rootHashStr}, txHash=${txHashStr}, file=${path.basename(filePath)}`);
    return { rootHash: rootHashStr, txHash: txHashStr };
  } finally {
    // Selalu tutup file setelah selesai (biar tidak memory leak)
    await file.close();
  }
}

/**
 * Upload buffer (data di memory) ke 0G Storage
 *
 * Cara kerjanya: tulis buffer ke file temporary, lalu upload file tersebut.
 * File temporary dihapus setelah upload selesai.
 *
 * @param {Buffer} buffer - Data yang mau di-upload
 * @param {string} filename - Nama file (untuk logging saja)
 * @returns {Promise<{rootHash: string, txHash: string}>}
 */
async function uploadBufferTo0G(buffer, filename) {
  const tmpPath = path.join("/tmp", `0g-upload-${Date.now()}-${filename}`);
  fs.writeFileSync(tmpPath, buffer);

  try {
    return await uploadTo0G(tmpPath);
  } finally {
    // Hapus file temporary setelah selesai
    fs.unlinkSync(tmpPath);
  }
}

/**
 * Download file dari 0G Storage
 *
 * @param {string} rootHash - Hash file yang mau di-download (alamat file)
 * @param {string} outputPath - Path lokal untuk menyimpan file hasil download
 * @returns {Promise<string>} - Path file yang sudah di-download
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
