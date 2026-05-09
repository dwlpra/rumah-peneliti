const fs = require("fs"), path = require("path");
const envContent = fs.readFileSync(path.join(__dirname, "..", "..", ".env"), "utf8");
envContent.split("\n").forEach(line => { const m = line.match(/^([^#=]+)=(.*)$/); if (m) process.env[m[1].trim()] = m[2].trim(); });
const { stmts, parseArticle } = require("../src/db");
const { mintResearchNFT } = require("../src/services/nft");
async function main() {
  const p = stmts.getPaper.get(7);
  const art = parseArticle(stmts.getArticle.get(7));
  console.log("Paper #7 journal_id:", p.journal_id, "| body len:", art?.body?.length);
  try {
    const result = await mintResearchNFT(p.author_wallet || "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55", Number(p.journal_id), p.storage_hash, art?.body || "empty", { title: p.title, authors: p.authors, abstract: p.abstract });
    console.log("MINT OK:", JSON.stringify(result));
    stmts.updateNFT.run(result.tokenId, result.txHash, 7);
    stmts.updatePipelineStatus.run("complete", 7);
  } catch(e) { console.error("MINT FAILED:", e.message?.slice(0, 300)); }
}
main().then(() => process.exit(0));
