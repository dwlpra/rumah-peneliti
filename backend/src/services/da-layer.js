/**
 * ============================================================
 *  0G DA Layer — Data Availability Proofs
 * ============================================================
 *
 *  DA (Data Availability) Layer menjamin bahwa data paper
 *  benar-benar tersedia dan bisa diakses oleh siapa saja.
 *
 *  Cara kerja:
 *    1. Buat "blob commitment" — semacam tanda tangan digital dari data
 *    2. Submit commitment ke blockchain sebagai transaksi
 *    3. Jaringan DA memverifikasi bahwa data tersedia
 *
 *  Analogi sederhana:
 *    DA Proof = "Surat pernyataan" dari jaringan bahwa:
 *    "Kami konfirmasi data paper ini tersedia dan bisa diakses"
 *
 *  Kenapa penting?
 *    Tanpa DA proof, tidak ada jaminan data benar-benar ada di storage.
 *    DA proof adalah lapisan keamanan tambahan di atas 0G Storage.
 *
 * ============================================================
 */

const { ethers } = require("ethers");

const DA_RPC = process.env.RPC_URL || "https://evmrpc.0g.ai";

/**
 * Publish Data Availability proof untuk paper
 *
 * @param {string} storageRoot - Hash file di 0G Storage (alamat file)
 * @param {string} metadataHash - Hash metadata paper (judul, penulis, dll)
 * @returns {Promise<{blobHash: string, txHash: string, blockNumber: number, dataRoot: string}>}
 *
 * @example
 *   const proof = await publishDAProof("0xabc...", '{"title":"My Paper"}');
 *   console.log(proof.blobHash);    // Hash commitment
 *   console.log(proof.txHash);      // Bukti transaksi on-chain
 *   console.log(proof.dataRoot);    // Root hash gabungan storage + commitment
 */
async function publishDAProof(storageRoot, metadataHash) {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured");

  const provider = new ethers.JsonRpcProvider(DA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // ── Step 1: Buat blob commitment ──
  // Blob commitment adalah hash dari data yang menjamin ketersediaan data.
  // Isinya: storageRoot + metadataHash + timestamp + versi.
  const blobData = ethers.toUtf8Bytes(JSON.stringify({
    storageRoot,       // Hash file di storage
    metadataHash,      // Hash metadata paper
    timestamp: Date.now(),
    version: "rumahpeneliti-v1",
  }));

  // Hash blob data → ini adalah "commitment" yang disimpan on-chain
  const blobHash = ethers.keccak256(blobData);

  // ── Step 2: Submit ke blockchain ──
  // Kirim transaksi yang berisi commitment.
  // Data transaksi di-prefix dengan "RP:DA:" untuk identifikasi.
  const tx = await wallet.sendTransaction({
    to: wallet.address,  // Kirim ke diri sendiri (self-transfer)
    data: ethers.concat([
      ethers.toUtf8Bytes("RP:DA:"),     // Prefix identifier
      ethers.getBytes(blobHash),          // Blob commitment
    ]),
    value: 0,           // Tidak kirim token
  });

  // Tunggu transaksi dikonfirmasi di blok
  const receipt = await tx.wait();
  console.log("[0G DA] Proof published. Tx:", receipt.hash);

  return {
    blobHash,                        // Hash commitment
    txHash: receipt.hash,            // Hash transaksi blockchain
    blockNumber: receipt.blockNumber, // Nomor blok
    dataRoot: ethers.keccak256(ethers.concat([
      blobHash,
      ethers.toUtf8Bytes(storageRoot),
    ])),
  };
}

module.exports = { publishDAProof };
