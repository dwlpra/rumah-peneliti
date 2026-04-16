export const MOCK_PAPERS = [
  { id: 1, title: "Test Paper 1", authors: "Author A", abstract: "Abstract 1", price_wei: "1000000000000000" },
  { id: 2, title: "Test Paper 2", authors: "Author B", abstract: "Abstract 2", price_wei: "0" },
];

export const MOCK_ARTICLES = [
  { id: 1, paper_id: 1, curated_title: "Test Article 1", summary: "Summary 1", key_takeaways: ["point 1"], body: "Body 1", tags: ["test"], is_mock: true },
  { id: 2, paper_id: 2, curated_title: "Test Article 2", summary: "Summary 2", key_takeaways: ["point 2"], body: "Body 2", tags: ["test"], is_mock: true },
];

export function createMockPaper(overrides = {}) {
  return { id: Date.now(), title: "Mock Paper", authors: "Test Author", abstract: "Test abstract", price_wei: "0", ...overrides };
}

export function createMockArticle(overrides = {}) {
  return { id: Date.now(), paper_id: 1, curated_title: "Mock Article", summary: "Mock summary", key_takeaways: [], body: "Mock body", tags: [], is_mock: true, ...overrides };
}
