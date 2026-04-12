const MODEL = "glm-5.1";
const API_BASE = "https://api.z.ai/api/paas/v4";

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
  const prompt = `You are an expert science journalist. Transform the following academic paper into an engaging, accessible article in ENGLISH.\n\nPAPER TITLE: ${title}\nPAPER CONTENT:\n${text.slice(0, 10000)}`;
  throw new Error("API key not configured yet");
}

function generateMockArticle(paperId, title, abstract) {
  return {
    curated_title: "Deep Dive: " + title,
    summary: "A groundbreaking study presents exciting new perspectives.",
    key_takeaways: ["Innovative approach", "Significant results", "New research directions", "Practical implications"],
    body: "Full article content placeholder.",
    tags: ["research", "innovation"],
    mock: true,
  };
}

module.exports = { generateArticle };
