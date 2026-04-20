const { ethers } = require("ethers");

/**
 * 0G Compute Network Client for AI-powered paper curation
 * Uses @0glabs/0g-serving-broker for decentralized AI inference
 */

let brokerInstance = null;
let brokerInitPromise = null;

async function getBroker() {
  if (brokerInstance) return brokerInstance;
  if (brokerInitPromise) return brokerInitPromise;

  brokerInitPromise = (async () => {
    const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured for 0G Compute");

    const { createZGComputeNetworkBroker } = require("@0glabs/0g-serving-broker");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("[0G Compute] Initializing broker for wallet:", wallet.address);
    brokerInstance = await createZGComputeNetworkBroker(wallet);
    console.log("[0G Compute] Broker initialized");
    return brokerInstance;
  })();

  return brokerInitPromise;
}

async function ensureLedger(minBalance = 0.1) {
  const broker = await getBroker();
  try {
    const account = await broker.ledger.getLedger();
    const balance = Number(ethers.formatEther(account.totalBalance));
    console.log("[0G Compute] Ledger balance:", balance, "0G");
    if (balance < minBalance) {
      console.log("[0G Compute] Depositing funds...");
      await broker.ledger.depositFund(minBalance);
    }
  } catch (e) {
    if (e.message?.includes("does not exist")) {
      console.log("[0G Compute] Creating new ledger with", minBalance, "0G");
      await broker.ledger.addLedger(minBalance);
    } else throw e;
  }
}

async function curateWith0GCompute(title, abstract, textContent) {
  try {
    const broker = await getBroker();
    await ensureLedger(0.1);

    const services = await broker.inference.listService();
    if (!services || services.length === 0) {
      throw new Error("No compute services available");
    }

    console.log("[0G Compute] Found", services.length, "services");

    const prompt = `You are an expert science journalist. Transform the following academic paper into an engaging, accessible article in ENGLISH.

PAPER TITLE: ${title}
PAPER CONTENT:
${(textContent || abstract || "").slice(0, 10000)}

You MUST respond in EXACTLY this JSON format (no markdown code block):
{
  "curated_title": "a catchy, engaging article title in English",
  "summary": "a compelling 2-3 sentence summary",
  "key_takeaways": ["point1", "point2", "point3", "point4"],
  "body": "full article 5-8 paragraphs, accessible language",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const messages = [{ role: "user", content: prompt }];

    // Try providers in order
    const providers = [
      services.find(s => s.provider === "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"),
      services.find(s => s.provider === "0xf07240Efa67755B5311bc75784a061eDB47165Dd"),
      ...services,
    ].filter(Boolean);

    // Deduplicate
    const seen = new Set();
    const uniqueProviders = providers.filter(p => {
      if (seen.has(p.provider)) return false;
      seen.add(p.provider);
      return true;
    });

    for (const service of uniqueProviders) {
      try {
        console.log("[0G Compute] Trying provider:", service.provider);

        // Acknowledge provider
        try { await broker.inference.acknowledgeProviderSigner(service.provider); } catch (e) {
          if (!e.message?.includes("already acknowledged")) console.warn("[0G Compute] Acknowledge warning:", e.message);
        }

        const metadata = await broker.inference.getServiceMetadata(service.provider);
        const headers = await broker.inference.getRequestHeaders(service.provider, JSON.stringify(messages));

        const response = await fetch(`${metadata.endpoint}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ model: metadata.model, messages }),
        });

        if (!response.ok) {
          console.warn("[0G Compute] Provider returned", response.status);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) continue;

        console.log("[0G Compute] Got response from", service.provider);

        // Parse JSON from response
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]);

        // Verify with SDK
        let verified = false;
        try {
          verified = await broker.inference.processResponse(service.provider, content, data.id);
        } catch (e) {
          console.log("[0G Compute] Verification skipped:", e.message);
        }

        return {
          curated_title: parsed.curated_title || title,
          summary: parsed.summary || "",
          key_takeaways: parsed.key_takeaways || [],
          body: parsed.body || "",
          tags: parsed.tags || [],
          mock: false,
          provider: service.provider,
          model: metadata.model,
          verified,
          chatID: data.id,
        };
      } catch (e) {
        console.warn("[0G Compute] Provider failed:", e.message);
        continue;
      }
    }

    throw new Error("All 0G Compute providers failed");
  } catch (e) {
    console.warn("[0G Compute] Failed, falling back to GLM API:", e.message);
    return null;
  }
}

module.exports = { curateWith0GCompute, getBroker, ensureLedger };
