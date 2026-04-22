import { ponder } from "@/generated";
import { paperAnchorEvents, articleAnchorEvents, researchNFTEvents, paymentEvents } from "../ponder.schema.js";

// ═══════════════════════════════════════════
// PaperAnchor Events
// ═══════════════════════════════════════════

ponder.on("PaperAnchor:PaperAnchored", async ({ event, context }) => {
  const { id, storageRoot, curationHash, metadataHash, author, timestamp } = event.args;

  await context.db.insert(paperAnchorEvents).values({
    id: `anchor-${event.transaction.hash}`,
    paperId: Number(id),
    storageRoot,
    curationHash,
    metadataHash,
    author,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    contractAddress: event.log.address,
  }).onConflictDoNothing();
});

ponder.on("PaperAnchor:ArticleAnchored", async ({ event, context }) => {
  const { paperId, articleHash } = event.args;

  await context.db.insert(articleAnchorEvents).values({
    id: `article-${event.transaction.hash}`,
    paperId: Number(paperId),
    articleHash,
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  }).onConflictDoNothing();
});

// ═══════════════════════════════════════════
// ResearchNFT Events
// ═══════════════════════════════════════════

ponder.on("ResearchNFT:ResearchMinted", async ({ event, context }) => {
  const { tokenId, paperId, storageRoot, researcher } = event.args;

  await context.db.insert(researchNFTEvents).values({
    id: `nft-${event.transaction.hash}`,
    tokenId: Number(tokenId),
    paperId: Number(paperId),
    storageRoot,
    researcher,
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    contractAddress: event.log.address,
  }).onConflictDoNothing();
});

// ═══════════════════════════════════════════
// JournalPayment Events
// ═══════════════════════════════════════════

ponder.on("JournalPayment:PaperPurchased", async ({ event, context }) => {
  const { paperId, reader, amount } = event.args;

  await context.db.insert(paymentEvents).values({
    id: `payment-${event.transaction.hash}`,
    paperId: Number(paperId),
    buyer: reader,
    amount: amount.toString(),
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  }).onConflictDoNothing();
});
