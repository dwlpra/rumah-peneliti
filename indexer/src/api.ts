import { Hono } from "hono";
import { cors } from "hono/cors";

// Proxy to Ponder's built-in GraphQL API at localhost:42069/graphql
const PONDER_URL = process.env.PONDER_URL || "http://localhost:42069";

const app = new Hono();
app.use("/*", cors());

// GraphQL proxy to Ponder
app.all("/graphql", async (c) => {
  const body = c.req.method === "GET" ? null : await c.req.text();
  const query = c.req.method === "GET" ? new URL(c.req.url).search : body;

  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: c.req.method,
    headers: { "Content-Type": "application/json" },
    body: query,
  });

  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
});

// REST convenience endpoints
app.get("/anchors", async (c) => {
  const query = `{
    paperAnchorEvents(orderBy: "timestamp", orderDirection: "desc", limit: 50) {
      items { id paperId storageRoot title authors researcher txHash blockNumber timestamp }
    }
  }`;
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return c.json(data);
});

app.get("/nfts", async (c) => {
  const query = `{
    researchNFTEvents(orderBy: "timestamp", orderDirection: "desc", limit: 50) {
      items { id tokenId paperId storageRoot researcher txHash blockNumber timestamp }
    }
  }`;
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return c.json(data);
});

app.get("/payments", async (c) => {
  const query = `{
    paymentEvents(orderBy: "timestamp", orderDirection: "desc", limit: 50) {
      items { id paperId buyer amount txHash blockNumber timestamp }
    }
  }`;
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return c.json(data);
});

app.get("/activity", async (c) => {
  // Combined activity feed from all events
  const queries = [
    `{ paperAnchorEvents(limit: 10, orderBy: "timestamp", orderDirection: "desc") {
      items { id paperId title researcher txHash timestamp __typename }
    }}`,
    `{ researchNFTEvents(limit: 10, orderBy: "timestamp", orderDirection: "desc") {
      items { id tokenId paperId researcher txHash timestamp __typename }
    }}`,
    `{ paymentEvents(limit: 10, orderBy: "timestamp", orderDirection: "desc") {
      items { id paperId buyer amount txHash timestamp __typename }
    }}`,
  ];

  const results = await Promise.all(
    queries.map((q) =>
      fetch(`${PONDER_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      }).then((r) => r.json())
    )
  );

  const anchors = results[0]?.data?.paperAnchorEvents?.items || [];
  const nfts = results[1]?.data?.researchNFTEvents?.items || [];
  const payments = results[2]?.data?.paymentEvents?.items || [];

  const activity = [...anchors, ...nfts, ...payments]
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 20);

  return c.json({ activity, total: activity.length });
});

const PORT = process.env.PORT || 42070;
console.log(`📊 Indexer API running on port ${PORT}`);
export default { port: PORT, fetch: app.fetch };
