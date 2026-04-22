import { pgTable, text, integer, bigint, index } from "drizzle-orm/pg-core";

// ═══════════════════════════════════════════
// PaperAnchor Events
// PaperAnchored(id, storageRoot, curationHash, metadataHash, author, timestamp)
// ═══════════════════════════════════════════

export const paperAnchorEvents = pgTable(
  "paper_anchor_events",
  {
    id: text("id").primaryKey(),
    paperId: integer("paper_id").notNull(),
    storageRoot: text("storage_root").notNull(),
    curationHash: text("curation_hash").notNull(),
    metadataHash: text("metadata_hash").notNull(),
    author: text("author").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
    contractAddress: text("contract_address").notNull(),
  },
  (table) => ({
    paperIdx: index("anchor_paper_idx").on(table.paperId),
    txIdx: index("anchor_tx_idx").on(table.txHash),
  })
);

// ═══════════════════════════════════════════
// ArticleAnchor Events
// ArticleAnchored(paperId, articleHash, timestamp)
// ═══════════════════════════════════════════

export const articleAnchorEvents = pgTable(
  "article_anchor_events",
  {
    id: text("id").primaryKey(),
    paperId: integer("paper_id").notNull(),
    articleHash: text("article_hash").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
  },
  (table) => ({
    paperIdx: index("article_paper_idx").on(table.paperId),
  })
);

// ═══════════════════════════════════════════
// ResearchNFT Events
// ResearchMinted(tokenId, paperId, storageRoot, researcher, timestamp)
// ═══════════════════════════════════════════

export const researchNFTEvents = pgTable(
  "research_nft_events",
  {
    id: text("id").primaryKey(),
    tokenId: integer("token_id").notNull(),
    paperId: integer("paper_id").notNull(),
    storageRoot: text("storage_root").notNull(),
    researcher: text("researcher").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
    contractAddress: text("contract_address").notNull(),
  },
  (table) => ({
    tokenIdx: index("nft_token_idx").on(table.tokenId),
    paperIdx: index("nft_paper_idx").on(table.paperId),
  })
);

// ═══════════════════════════════════════════
// JournalPayment Events
// PaperPurchased(paperId, reader, amount)
// ═══════════════════════════════════════════

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: text("id").primaryKey(),
    paperId: integer("paper_id").notNull(),
    buyer: text("buyer").notNull(),
    amount: text("amount").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
  },
  (table) => ({
    paperIdx: index("payment_paper_idx").on(table.paperId),
    buyerIdx: index("payment_buyer_idx").on(table.buyer),
  })
);
