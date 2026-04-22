import { onchainTable } from "@ponder/core";
import { text, integer, bigint } from "drizzle-orm/pg-core";

export const paperAnchorEvents = onchainTable(
  "paper_anchor_events",
  {
    id: text("id").primaryKey(),
    paperId: integer("paper_id").notNull(),
    storageRoot: text("storage_root").notNull(),
    curationHash: text("curation_hash").notNull(),
    metadataHash: text("metadata_hash").notNull(),
    author: text("author").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
    contractAddress: text("contract_address").notNull(),
  }
);

export const articleAnchorEvents = onchainTable(
  "article_anchor_events",
  {
    id: text("id").primaryKey(),
    paperId: integer("paper_id").notNull(),
    articleHash: text("article_hash").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  }
);

export const researchNFTEvents = onchainTable(
  "research_nft_events",
  {
    id: text("id").primaryKey(),
    tokenId: integer("token_id").notNull(),
    paperId: integer("paper_id").notNull(),
    storageRoot: text("storage_root").notNull(),
    researcher: text("researcher").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
    contractAddress: text("contract_address").notNull(),
  }
);

export const paymentEvents = onchainTable(
  "payment_events",
  {
    id: text("id").primaryKey(),
    paperId: integer("paper_id").notNull(),
    buyer: text("buyer").notNull(),
    amount: text("amount").notNull(),
    txHash: text("tx_hash").notNull(),
    blockNumber: bigint("block_number", { mode: "number" }).notNull(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  }
);
