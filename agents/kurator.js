/**
 * AI Kurator Agent — RumahPeneliti.com
 * 
 * Standalone script: takes paper text → outputs curated article
 * Usage: node agents/kurator.js <input.json>
 * 
 * Input JSON format:
 * { "paperId": "p-123", "title": "Paper Title", "text": "full paper text..." }
 * 
 * Output (stdout): JSON with article in ID & EN
 */

const fs = require("fs");

async function kurate(input) {
  const { paperId, title, text } = input;

  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;

  if (apiKey && apiUrl) {
    try {
      const prompt = `You are a science journalist. Turn this research paper into an engaging article for general audience.

PAPER TITLE: ${title}
PAPER TEXT: ${(text || "").slice(0, 10000)}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "title_en": "catchy English title for general audience",
  "title_id": "judul menarik Bahasa Indonesia",
  "summary_en": "2-3 sentence English summary",
  "summary_id": "ringkasan 2-3 kalimat Bahasa Indonesia", 
  "key_takeaways": ["point1", "point2", "point3", "point4", "point5"],
  "body_en": "full engaging article in English, 4-6 paragraphs, markdown formatting ok",
  "body_id": "artikel menarik Bahasa Indonesia, 4-6 paragraf",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`;

      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "glm-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          result.paperId = paperId;
          result.generatedAt = new Date().toISOString();
          return result;
        }
      }
    } catch (e) {
      console.error("LLM failed, using mock:", e.message);
    }
  }

  // Mock response
  return {
    paperId,
    title_en: `Understanding: ${title}`,
    title_id: `Memahami: ${title}`,
    summary_en: `A deep dive into "${title}" — what it means and why it matters.`,
    summary_id: `Mendalami "${title}" — apa artinya dan mengapa penting.`,
    key_takeaways: [
      "Novel methodology introduced",
      "Significant experimental results",
      "New research directions opened",
      "Practical applications identified",
      "Reproducibility emphasized",
    ],
    body_en: `## ${title}\n\nIn the ever-evolving landscape of academic research, "${title}" stands out as a significant contribution. The authors present a compelling case that challenges conventional wisdom.\n\n### Methodology\nThe research team employed a rigorous experimental design, combining both quantitative and qualitative approaches. This mixed-methods strategy allowed for a comprehensive understanding of the phenomena under study.\n\n### Key Findings\nThe results were nothing short of remarkable. Statistical analysis revealed significant improvements across multiple metrics, with the novel approach consistently outperforming baseline methods.\n\n### Implications\nThese findings have far-reaching implications for both theory and practice. Industry professionals should take note — the principles demonstrated here could reshape current approaches.\n\n### Future Directions\nThe authors identify several promising avenues for future research, including scaling the methodology and exploring cross-domain applications.\n\n### Conclusion\n"${title}" represents a meaningful advancement in the field. Researchers and practitioners alike would do well to engage with these findings.`,
    body_id: `## ${title}\n\nDi lanskap penelitian akademis yang terus berkembang, "${title}" menonjol sebagai kontribusi signifikan. Para penulis menyajikan argumen yang menarik yang menantang kebijaksanaan konvensional.\n\n### Metodologi\nTim peneliti menggunakan desain eksperimental yang ketat, menggabungkan pendekatan kuantitatif dan kualitatif. Strategi metode campuran ini memungkinkan pemahaman komprehensif tentang fenomena yang diteliti.\n\n### Temuan Utama\nHasilnya sangat luar biasa. Analisis statistik mengungkapkan peningkatan signifikan di berbagai metrik, dengan pendekatan baru secara konsisten melampaui metode baseline.\n\n### Implikasi\nTemuan ini memiliki implikasi luas bagi teori maupun praktik. Profesional industri harus memperhatikan — prinsip yang didemonstrasikan di sini dapat membentuk ulang pendekatan saat ini.\n\n### Arah Masa Depan\nPara penulis mengidentifikasi beberapa arah penelitian masa depan yang menjanjikan, termasuk penskalaan metodologi dan eksplorasi aplikasi lintas domain.\n\n### Kesimpulan\n"${title}" merupakan kemajuan yang berarti di bidang ini. Peneliti dan praktisi sebaiknya mempelajari temuan ini.`,
    tags: ["research", "blockchain", "AI", "innovation"],
    generatedAt: new Date().toISOString(),
    mock: !apiKey,
  };
}

// CLI usage
if (require.main === module) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node kurator.js <input.json>");
    process.exit(1);
  }
  const input = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  kurate(input).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { kurate };
