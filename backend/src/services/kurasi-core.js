/**
 * GLM API + Mock fallback for paper curation
 * Used when 0G Compute Network is unavailable
 */

const API_KEY = process.env.LLM_API_KEY || "";
const API_BASE = "https://api.z.ai/api/paas/v4";
const MODEL = "glm-5.1";

async function callGLM(paperId, title, text) {
  const prompt = `You are an expert science journalist. Transform the following academic paper into an engaging, accessible article in ENGLISH.

PAPER TITLE: ${title}
PAPER CONTENT:
${text.slice(0, 10000)}

You MUST respond in EXACTLY this JSON format (no markdown code block):
{
  "curated_title": "a catchy, engaging article title in English (NOT the original paper title)",
  "summary": "a compelling 2-3 sentence summary in English that hooks the reader",
  "key_takeaways": ["key point 1", "key point 2", "key point 3", "key point 4"],
  "body": "a full article of 5-8 paragraphs in English that is easy to understand. Use accessible language with simple analogies. Separate paragraphs with blank lines. Write in a journalistic, engaging style — not too academic.",
  "tags": ["topic1", "topic2", "topic3", "topic4"]
}`;

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text().catch(() => "unknown")}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response");

  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    curated_title: parsed.curated_title || title,
    summary: parsed.summary || "",
    key_takeaways: parsed.key_takeaways || [],
    body: parsed.body || "",
    tags: parsed.tags || [],
    mock: false,
  };
}

function generateMockArticle(paperId, title, abstract) {
  return {
    curated_title: `Deep Dive: ${title}`,
    summary: `A groundbreaking study on "${title}" presents exciting new perspectives. ${abstract ? `Focusing on ${abstract.slice(0, 100)}...` : "This research opens new insights in its field."} The findings could fundamentally change how we understand this topic.`,
    key_takeaways: [
      "An innovative new approach to research methodology",
      "Experimental results show significant improvements",
      "Opens new directions for further research",
      "Practical implications relevant to industry",
    ],
    body: `The research titled "${title}" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.\n\nThe research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.\n\nOne of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.\n\nThe implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.\n\nHowever, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.\n\nLooking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.`,
    tags: ["research", "innovation", "technology", "academic"],
    mock: true,
  };
}

module.exports = { generateArticle: callGLM, callGLM, generateMockArticle };
