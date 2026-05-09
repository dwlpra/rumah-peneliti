/**
 * Pipeline Controller
 *
 * Business logic untuk pipeline status:
 *   - Status konfigurasi seluruh komponen
 *   - SSE (Server-Sent Events) untuk real-time progress
 *   - Progress polling endpoint
 */

const pipelineStates = new Map();
const sseSubscribers = new Map(); // paperId -> Set<res>

/** Emit pipeline event ke SSE subscribers + store for replay */
function emitPipelineEvent(paperId, step, name, status, data) {
  const payload = { step, name, status, ...data };
  const key = String(paperId);
  if (!pipelineStates.has(key)) {
    pipelineStates.set(key, { steps: [] });
  }
  pipelineStates.get(key).steps.push(payload);

  // Push to live SSE subscribers
  const subscribers = sseSubscribers.get(key);
  if (subscribers) {
    const msg = `event: step\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of subscribers) {
      try { res.write(msg); } catch (e) {}
    }
  }
}

/** Status konfigurasi seluruh pipeline */
function getPipelineStatus(req, res) {
  res.json({
    storage: {
      configured: !!process.env.RPC_URL,
      indexer: "https://indexer-storage-turbo.0g.ai",
    },
    da: {
      configured: true,
      endpoint: "https://da.0g.ai",
    },
    anchor: {
      configured: true,
      contract: process.env.PAPER_ANCHOR_ADDRESS || "0x4ad80352231407Afa845c5428fa8fE870b4509A9",
    },
    compute: {
      configured: !!process.env.PRIVATE_KEY,
      provider: "0G Compute Network",
    },
    chain: {
      rpc: process.env.RPC_URL,
      chainId: 16661,
      explorer: "https://chainscan.0g.ai",
    },
  });
}

/** SSE endpoint untuk live pipeline progress */
function pipelineSSE(req, res) {
  const key = String(req.params.id);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  res.write('data: {"connected":true}\n\n');

  // Replay stored state
  const state = pipelineStates.get(key);
  if (state) {
    state.steps.forEach(s => {
      res.write(`event: step\ndata: ${JSON.stringify(s)}\n\n`);
    });
  }

  // Register as live subscriber
  if (!sseSubscribers.has(key)) sseSubscribers.set(key, new Set());
  sseSubscribers.get(key).add(res);

  // Keep-alive
  const keepAlive = setInterval(() => {
    try { res.write(": ping\n\n"); } catch (e) { clearInterval(keepAlive); }
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    const subs = sseSubscribers.get(key);
    if (subs) {
      subs.delete(res);
      if (subs.size === 0) sseSubscribers.delete(key);
    }
  });
}

/** Progress polling endpoint — reads DB state for pipeline steps */
function pipelineProgress(req, res) {
  const { stmts, parseArticle } = require("../db");
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid paper ID" });

  const paper = stmts.getPaper.get(id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });

  const article = parseArticle(stmts.getArticle.get(id));

  // Determine step states from DB
  const steps = {
    storage: { done: !!paper.storage_hash },
    da: { done: !!paper.storage_hash }, // DA proof happens with storage
    anchor: { done: !!paper.journal_id || !!paper.storage_hash },
    ai: { done: !!article },
    nft: { done: !!paper.nft_token_id },
  };

  // Build response
  const response = {
    paperId: id,
    status: paper.pipeline_status || "pending",
    steps,
    article: article ? {
      curated_title: article.curated_title,
      ai_score: article.ai_score,
      classification: article.classification,
      is_mock: article.is_mock,
      agent_token_id: article.agent_token_id,
    } : null,
    nft: paper.nft_token_id ? {
      tokenId: paper.nft_token_id,
      txHash: paper.nft_tx_hash,
    } : null,
  };

  res.json(response);
}

module.exports = { getPipelineStatus, pipelineSSE, pipelineProgress, emitPipelineEvent };
