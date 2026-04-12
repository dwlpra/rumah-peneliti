const API_KEY = process.env.LLM_API_KEY || "";
const API_BASE = "https://api.z.ai/api/paas/v4";
const MODEL = "glm-5.1";

async function generateArticle(paperId, title, abstract, textContent) {
  const input = [title, abstract, textContent].filter(Boolean).join("\n\n");
  try {
    return await callGLM(paperId, title, input);
  } catch (e) {
    console.warn("GLM API failed, using mock:", e.message);
    return generateMockArticle(paperId, title, abstract || "");
  }
}

async function callGLM(paperId, title, text) {
  const prompt = `You are an expert science journalist. Transform the following academic paper into an engaging, accessible article in ENGLISH.

PAPER TITLE: ${title}
PAPER CONTENT:
${text.slice(0, 10000)}

You MUST respond in EXACTLY this JSON format (no markdown code block):
{
  "curated_title": "a catchy, engaging article title in English",
  "summary": "a compelling 2-3 sentence summary",
  "key_takeaways": ["point 1", "point 2", "point 3", "point 4"],
  "body": "a full article of 5-8 paragraphs",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const res = await fetch(API_BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 4000 }),
  });
  if (!res.ok) throw new Error("API " + res.status);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response");
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) { cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, ""); }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");
  const parsed = JSON.parse(jsonMatch[0]);
  return { curated_title: parsed.curated_title || title, summary: parsed.summary || "", key_takeaways: parsed.key_takeaways || [], body: parsed.body || "", tags: parsed.tags || [], mock: false };
}

function generateMockArticle(paperId, title, abstract) {
  return {
    curated_title: "Deep Dive: " + title,
    summary: "A groundbreaking study on \"" + title + "\" presents exciting new perspectives.",
    key_takeaways: ["Innovative methodology", "Significant results", "New research directions", "Practical implications"],
    body: "Full article content for \"" + title + "\".",
    tags: ["research", "innovation", "technology"],
    mock: true,
  };
}

module.exports = { generateArticle };
