const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchPapers() {
  const res = await fetch(`${API}/api/papers`);
  if (!res.ok) throw new Error("Failed to fetch papers");
  return res.json();
}

export async function fetchPaper(id) {
  const res = await fetch(`${API}/api/papers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch paper");
  return res.json();
}

export async function fetchArticles() {
  const res = await fetch(`${API}/api/articles`);
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
}

export async function fetchArticle(id) {
  const res = await fetch(`${API}/api/articles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json();
}

export async function uploadPaper(formData) {
  const res = await fetch(`${API}/api/papers`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function purchasePaper(paperId, buyerWallet, txHash, amount) {
  const res = await fetch(`${API}/api/papers/${paperId}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buyer_wallet: buyerWallet, tx_hash: txHash, amount }),
  });
  return res.json();
}

export async function checkAccess(paperId, wallet) {
  const res = await fetch(`${API}/api/papers/${paperId}/access/${wallet}`);
  if (!res.ok) return { hasAccess: false };
  return res.json();
}
