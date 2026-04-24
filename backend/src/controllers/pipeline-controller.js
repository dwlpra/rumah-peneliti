/**
 * Pipeline Controller
 *
 * Business logic untuk pipeline status:
 *   - Status konfigurasi seluruh komponen
 *   - SSE (Server-Sent Events) untuk real-time progress
 */

const pipelineStates = new Map();

/** Emit pipeline event ke SSE subscribers */
function emitPipelineEvent(paperId, step, name, status, data) {
  const payload = { step, name, status, ...data };
  if (!pipelineStates.has(String(paperId))) {
    pipelineStates.set(String(paperId), { steps: [] });
  }
  pipelineStates.get(String(paperId)).steps.push(payload);
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
      contract: process.env.PAPER_ANCHOR_ADDRESS || "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE",
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

/** SSE endpoint untuk Pipeline Wizard di frontend */
function pipelineSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  res.write('data: {"connected":true}\n\n');

  // Kirim state yang sudah ada
  const state = pipelineStates.get(req.params.id);
  if (state) {
    state.steps.forEach(s => {
      res.write(`event: step\ndata: ${JSON.stringify(s)}\n\n`);
    });
  }

  // Keep-alive: kirim ping setiap 15 detik
  const keepAlive = setInterval(() => res.write(": ping\n\n"), 15000);
  req.on("close", () => clearInterval(keepAlive));
}

module.exports = { getPipelineStatus, pipelineSSE, emitPipelineEvent };
