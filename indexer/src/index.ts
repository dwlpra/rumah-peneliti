import { ponder } from "@/generated";
import { paperAnchorEvents, articleAnchorEvents, researchNFTEvents, paymentEvents } from "../ponder.schema.js";

ponder.on("PaperAnchor:PaperAnchored", async ({ event, context }) => {
  const { id, storageRoot, curationHash, metadataHash, author } = event.args;
  await context.db.insert(paperAnchorEvents).values({
    id: event.transaction.hash,
    paperId: Number(id),
    storageRoot,
    curationHash,
    metadataHash,
    author,
    txHash: event.transaction.hash,
    blockNumber: Number(event.block.number),
    timestamp: Number(event.block.timestamp),
    contractAddress: event.log.address,
  }).onConflictDoNothing();
});

ponder.on("PaperAnchor:ArticleAnchored", async ({ event, context }) => {
  const { paperId, articleHash } = event.args;
  await context.db.insert(articleAnchorEvents).values({
    id: event.transaction.hash,
    paperId: Number(paperId),
    articleHash,
    txHash: event.transaction.hash,
    blockNumber: Number(event.block.number),
    timestamp: Number(event.block.timestamp),
  }).onConflictDoNothing();
});

ponder.on("ResearchNFT:ResearchMinted", async ({ event, context }) => {
  const { tokenId, paperId, storageRoot, researcher } = event.args;
  await context.db.insert(researchNFTEvents).values({
    id: event.transaction.hash,
    tokenId: Number(tokenId),
    paperId: Number(paperId),
    storageRoot,
    researcher,
    txHash: event.transaction.hash,
    blockNumber: Number(event.block.number),
    timestamp: Number(event.block.timestamp),
    contractAddress: event.log.address,
  }).onConflictDoNothing();
});

ponder.on("JournalPayment:PaperPurchased", async ({ event, context }) => {
  const { paperId, reader, amount } = event.args;
  await context.db.insert(paymentEvents).values({
    id: event.transaction.hash,
    paperId: Number(paperId),
    buyer: reader,
    amount: amount.toString(),
    txHash: event.transaction.hash,
    blockNumber: Number(event.block.number),
    timestamp: Number(event.block.timestamp),
  }).onConflictDoNothing();
});
