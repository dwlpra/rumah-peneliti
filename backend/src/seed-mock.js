#!/usr/bin/env node
// Seed 8 additional mock papers + articles for demo purposes
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "data", "rumahpeneliti.db");
const db = new Database(DB_PATH);

const stmts = {
  insertPaper: db.prepare(
    "INSERT INTO papers (title, authors, abstract, file_path, price_wei, author_wallet) VALUES (?, ?, ?, ?, ?, ?)"
  ),
  insertArticle: db.prepare(
    "INSERT OR REPLACE INTO articles (paper_id, curated_title, summary, key_takeaways, body, tags, is_mock) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ),
};

const mockData = [
  {
    paper: {
      title: "Zero-Knowledge Proofs for Privacy-Preserving Academic Peer Review",
      authors: "Dr. Wei Zhang, Maria Santos, Dr. Kenji Tanaka",
      abstract: "This paper proposes a novel framework using zero-knowledge proofs to maintain anonymity and integrity in academic peer review processes. Our system allows reviewers to prove their qualifications without revealing identity, and authors to verify review authenticity without exposing reviewer information.",
      price: "500000000000000",
      wallet: "0x1111222233334444555566667777888899990000",
    },
    article: {
      title: "How Zero-Knowledge Proofs Could Revolutionize Academic Peer Review",
      summary: "A groundbreaking framework uses zero-knowledge proofs to create blind peer review systems that are both anonymous and verifiable — solving a decades-old problem in academic publishing.",
      takeaways: [
        "Reviewers can prove expertise without revealing identity using ZK-SNARKs",
        "Author-reviewer matching improved by 40% while maintaining complete anonymity",
        "System prevents review manipulation and conflicts of interest",
        "Pilot with 3 journals showed 95% reviewer satisfaction rate",
      ],
      body: `Academic peer review has long been criticized for its lack of transparency and potential for bias. Reviewers may favor authors from prestigious institutions, or authors might guess reviewer identities based on feedback style. A new framework leveraging zero-knowledge proofs offers an elegant solution.

The system works by having reviewers generate ZK-SNARKs — cryptographic proofs that verify they meet qualification criteria without revealing who they are. Think of it like a bouncer checking your ID at a club, but instead of seeing your name and photo, they only get a green light confirming you're old enough to enter.

In testing across three academic journals, the framework demonstrated remarkable improvements. Reviewer-author matching accuracy increased by 40% compared to traditional editorial assignment. This is because the system can match based on actual expertise markers rather than journal editors' sometimes imperfect knowledge of their reviewer pool.

Perhaps most importantly, the system completely eliminates the possibility of review manipulation. Since reviewer identities are cryptographically hidden, authors cannot influence or retaliate against reviewers. And since the matching process is algorithmic, editors cannot strategically assign friendly reviewers.

The pilot study involved over 200 reviewers and 500 manuscript submissions across journals in computer science, biology, and physics. Reviewer satisfaction reached 95%, with many noting they felt more comfortable providing honest feedback when their anonymity was mathematically guaranteed.

One limitation is the computational overhead — generating zero-knowledge proofs takes several seconds per review assignment. However, the researchers argue this is a small price to pay for the integrity benefits, and optimization work is ongoing.

The team has open-sourced the framework and is working with several major publishers to implement it at scale. If successful, it could fundamentally change how academic peer review operates worldwide.`,
      tags: ["zero-knowledge-proofs", "peer-review", "privacy", "academic-publishing", "cryptography"],
    },
  },
  {
    paper: {
      title: "Cross-Chain Interoperability Protocol for Decentralized Research Data Sharing",
      authors: "Dr. Aisha Patel, James O'Connor, Dr. Yuki Nakamura",
      abstract: "We present a cross-chain protocol enabling seamless sharing of research data across multiple blockchain networks. The protocol uses atomic swaps and relay chains to ensure data integrity while allowing researchers on different chains to collaborate without intermediaries.",
      price: "0",
      wallet: "0xaaaabbbbccccddddeeee11112222333344445555",
    },
    article: {
      title: "Breaking Down Blockchain Silos: A New Protocol for Research Data Sharing",
      summary: "Researchers have developed a cross-chain protocol that allows scientists on different blockchain networks to share data seamlessly — no intermediaries required. This could be the key to truly decentralized scientific collaboration.",
      takeaways: [
        "Protocol supports data sharing across Ethereum, Polkadot, Cosmos, and 0G chains",
        "Atomic swaps ensure data integrity without trusted intermediaries",
        "Latency reduced to under 3 seconds for cross-chain data verification",
        "Already tested with genomic datasets spanning 4 blockchain networks",
      ],
      body: `One of the biggest challenges in decentralized science (DeSci) is that different research groups use different blockchain platforms. A genomics lab might store data on 0G Storage, while a climate research team uses Filecoin, and a pharmaceutical company uses a private Ethereum network. How do they collaborate?

A new cross-chain interoperability protocol aims to solve this exact problem. Using a combination of atomic swaps and relay chain technology, the protocol enables seamless data sharing across disparate blockchain networks without requiring any central intermediary.

The technical architecture is elegant in its simplicity. Each blockchain network runs a lightweight relay node that monitors data access requests from other chains. When a researcher on Chain A requests data from Chain B, the protocol initiates an atomic swap — a cryptographic transaction that either completes entirely or not at all, ensuring no party is left in an ambiguous state.

Performance testing shows impressive results. Cross-chain data verification completes in under 3 seconds, compared to minutes or hours for traditional data sharing methods. The protocol currently supports Ethereum, Polkadot, Cosmos, and 0G chains, with more networks being added.

The real-world test involved sharing anonymized genomic datasets across four blockchain networks. Researchers were able to query and access data from any chain as if it were local, with cryptographic proofs guaranteeing data integrity at every step.

Security audits by two independent firms found no critical vulnerabilities. The protocol uses battle-tested cryptographic primitives and has been formally verified using the TLA+ specification language.

For the DeSci community, this is a significant milestone. True decentralization of scientific research requires breaking down the silos between blockchain platforms, and this protocol provides the technical foundation to do exactly that.`,
      tags: ["cross-chain", "interoperability", "desci", "data-sharing", "blockchain"],
    },
  },
  {
    paper: {
      title: "Federated Learning on Blockchain: Privacy-Preserving Medical Research at Scale",
      authors: "Dr. Sarah Chen, Dr. Michael Okafor, Lisa Bergström",
      abstract: "We propose a blockchain-based federated learning framework that enables hospitals to collaboratively train AI models on sensitive patient data without sharing the data itself. Our approach uses smart contracts to coordinate training rounds and verify model updates cryptographically.",
      price: "800000000000000",
      wallet: "0xdeadbeef12345678deadbeef12345678deadbeef",
    },
    article: {
      title: "Hospitals Can Now Train AI Together Without Sharing Patient Data — Here's How",
      summary: "A blockchain-powered federated learning framework lets hospitals collaborate on AI model training while keeping patient data completely private. Early results show diagnostic accuracy improvements of 23% compared to single-hospital models.",
      takeaways: [
        "Patient data never leaves the hospital — only model updates are shared",
        "Smart contracts automatically coordinate training rounds and validate contributions",
        "23% improvement in diagnostic accuracy vs single-hospital models",
        "Deployed across 12 hospitals in a pilot study with 100,000+ patient records",
      ],
      body: `Medical AI has a data problem. The best models need data from thousands of patients, but privacy regulations make sharing medical records between hospitals nearly impossible. A new blockchain-based federated learning framework offers a clever workaround.

The concept is simple but powerful: instead of moving patient data to a central server, the model travels to where the data lives. Each hospital trains the AI model locally on its own data, then sends only the model updates — not the data — to a smart contract on the blockchain. The smart contract aggregates updates from all hospitals, verifies they're valid, and produces an improved model.

Think of it like a group of chefs perfecting a recipe. Instead of everyone bringing their ingredients to one kitchen, each chef experiments at home and only shares their notes on what worked. The final recipe benefits from everyone's expertise without anyone revealing their secret ingredients.

In a pilot study spanning 12 hospitals across three countries, the framework demonstrated remarkable results. The collaborative model achieved 23% higher diagnostic accuracy for rare diseases compared to models trained at individual hospitals. This is because rare conditions that might only appear in a few patients at one hospital become statistically meaningful when combined across thousands of patients at multiple institutions.

The blockchain component ensures trust and transparency. Every training round is recorded on-chain, making it auditable and tamper-proof. Hospitals can verify that their contributions are being used correctly and that other participants are following the rules.

The framework also includes an incentive mechanism. Hospitals that contribute high-quality model updates earn tokens, creating a natural incentive for participation. This gamification element has proven surprisingly effective — hospitals in the pilot were eager to contribute when they could see tangible rewards.

Privacy analysis confirmed that no patient data can be reconstructed from the model updates, even under sophisticated attack scenarios. The team is now working on expanding the pilot to 50 hospitals and exploring applications beyond medical imaging, including drug discovery and epidemiological forecasting.`,
      tags: ["federated-learning", "blockchain", "medical-ai", "privacy", "healthcare"],
    },
  },
  {
    paper: {
      title: "Tokenomics of Academic Publishing: A Game-Theoretic Approach to Incentivizing Open Access",
      authors: "Prof. Elena Rossi, Dr. Arun Sharma, Dr. Fatima Al-Hassan",
      abstract: "This paper applies game theory to design a token-based incentive system for academic publishing that promotes open access while ensuring sustainable revenue for journals. Our Nash equilibrium analysis shows that the proposed mechanism encourages authors, reviewers, and readers to contribute to an open ecosystem.",
      price: "300000000000000",
      wallet: "0x9876abcd5432efab9876abcd5432efab9876abcd",
    },
    article: {
      title: "Can Game Theory Fix Academic Publishing? This Token System Says Yes",
      summary: "Researchers have used game theory to design a token economy that naturally incentivizes open access publishing. In simulations, the system achieved 85% open access rates while maintaining journal revenue — solving a problem that has plagued academia for decades.",
      takeaways: [
        "Nash equilibrium analysis proves the system is self-sustaining",
        "85% open access rate in simulations vs 30% in current systems",
        "Authors earn tokens for publishing, reviewers earn for quality reviews",
        "Readers pay micro-tokens that redistribute to authors and reviewers",
      ],
      body: `Academic publishing is broken. Researchers give their work to journals for free, peer reviewers donate their time for free, and then universities pay millions to access the same research. It's a system that benefits publishers at the expense of everyone else. But what if we could redesign the economic incentives using game theory?

That's exactly what this research proposes. The authors have created a token-based system where every participant in the academic publishing ecosystem is economically incentivized to contribute to open access. The key insight is applying Nash equilibrium — the state where no participant can improve their outcome by changing their strategy alone.

Here's how it works. Authors earn tokens when their papers are published and cited. Reviewers earn tokens based on the quality and timeliness of their reviews (as rated by other reviewers). Readers pay micro-tokens to access papers, but this payment is distributed directly to authors and reviewers — not to a publisher middleman.

The game-theoretic analysis is rigorous. The researchers modeled the system as a multi-player game and proved that the Nash equilibrium favors open access. In other words, the most rational strategy for every participant leads naturally to more open research, not less.

Simulations running over 10,000 academic papers confirmed the theory. Open access rates reached 85%, compared to roughly 30% in traditional publishing models. Journal revenue remained stable because the reduced per-paper cost was offset by the increased volume of readers attracted by open access.

One surprising finding: the token system actually improved review quality. When reviewers are compensated based on review quality ratings, they spend more time and provide more thorough feedback. Average review scores improved by 35% in the simulation.

The researchers are now working with three academic publishers to test the system in the real world. If successful, it could represent the most significant change to academic publishing economics since the invention of the journal.`,
      tags: ["tokenomics", "game-theory", "open-access", "academic-publishing", "decentralized-science"],
    },
  },
  {
    paper: {
      title: "Decentralized Autonomous Universities: Governance Models for Web3 Education",
      authors: "Dr. Roberto Martinez, Dr. Priya Kapoor, Thomas Fischer",
      abstract: "We explore governance models for Decentralized Autonomous Universities (DAUs) built on blockchain technology. Our analysis compares DAO governance mechanisms applied to educational contexts, including quadratic voting, reputation-weighted systems, and hybrid approaches for curriculum and resource decisions.",
      price: "0",
      wallet: "0xfedcba9876543210fedcba9876543210fedcba98",
    },
    article: {
      title: "What If Universities Were Run by Smart Contracts? Exploring DAUs",
      summary: "A comprehensive analysis of how blockchain governance models could transform universities into decentralized organizations. The research examines voting mechanisms, reputation systems, and how curriculum decisions could be made collectively by students and faculty.",
      takeaways: [
        "Quadratic voting produces more equitable curriculum decisions than simple majority",
        "Reputation-weighted governance improves faculty participation by 60%",
        "Hybrid models combining multiple voting mechanisms show most promise",
        "Three prototype DAUs already operating with 500+ students each",
      ],
      body: `What if your university was run entirely by smart contracts? No administrators, no bureaucracy — just code and collective decision-making. It sounds like science fiction, but a growing movement of Decentralized Autonomous Universities (DAUs) is making it reality.

This research provides the first comprehensive analysis of governance models for these Web3 educational institutions. The core question: how should a university make decisions when there's no central authority?

The researchers evaluated three primary governance mechanisms. Simple token voting (one token, one vote) proved problematic — it allowed wealthy students to dominate decisions. Quadratic voting, where the cost of additional votes increases exponentially, produced much more equitable outcomes and prevented any single group from controlling curriculum decisions.

The most innovative approach was the hybrid model. Day-to-day operational decisions use reputation-weighted voting (faculty with more teaching experience have more influence on scheduling, for example). Major decisions like curriculum changes require quadratic voting from all stakeholders. And constitutional changes need a supermajority across all voting mechanisms.

Three prototype DAUs are already running on blockchain networks with a combined student body of over 1,500. Early results are encouraging. Faculty participation in governance decisions increased by 60% compared to traditional university committee structures. Students reported feeling more invested in their education when they had a genuine voice in how the institution operates.

Of course, challenges remain. Decision-making can be slower when everything requires a vote. The researchers found that setting appropriate quorum requirements — low enough for efficiency but high enough for legitimacy — requires careful calibration for each type of decision.

The paper also addresses the philosophical question: should education be democratized to this extent? The authors argue that the current administrative overhead in universities (which can consume 30-40% of budgets) is unsustainable, and that well-designed governance mechanisms can maintain academic standards while dramatically reducing costs.`,
      tags: ["dao", "governance", "education", "web3", "decentralized-university"],
    },
  },
  {
    paper: {
      title: "IPFS-Based Distributed Computing for Large-Scale Scientific Simulations",
      authors: "Dr. Hans Müller, Dr. Mei Lin, Carlos Rodriguez",
      abstract: "We present a distributed computing framework that uses IPFS for task distribution and result aggregation in large-scale scientific simulations. Our approach enables researchers to pool idle computing resources globally, achieving 78% of supercomputer performance at 5% of the cost.",
      price: "400000000000000",
      wallet: "0x4321dcba8765ef4321dcba8765ef4321dcba8765",
    },
    article: {
      title: "Supercomputing for 5% of the Cost: How IPFS Powers a Global Research Grid",
      summary: "Scientists have built a distributed computing network using IPFS that delivers 78% of supercomputer performance at a fraction of the cost. The framework could democratize access to high-performance computing for researchers worldwide.",
      takeaways: [
        "78% of supercomputer performance achieved using distributed idle computers",
        "Cost reduced to 5% compared to traditional HPC cluster rental",
        "IPFS enables fault-tolerant task distribution across 1,000+ nodes globally",
        "Successfully ran protein folding simulation spanning 3 continents",
      ],
      body: `High-performance computing (HPC) is essential for modern scientific research, from climate modeling to drug discovery. But supercomputers cost tens of millions of dollars, and renting time on cloud HPC clusters can drain a research budget in weeks. What if we could harness the unused computing power of the world's billions of devices?

This research presents a framework that does exactly that, using IPFS as the backbone for distributing and collecting computational tasks. Unlike traditional distributed computing projects like Folding@home, which use centralized servers to coordinate work, this system is fully decentralized.

The architecture is brilliantly simple. Researchers upload their simulation parameters to IPFS, generating a content hash. Computing nodes around the world download the parameters, execute their assigned portion of the simulation, and upload results back to IPFS. A smart contract coordinates the entire process, verifying that results are mathematically correct and compensating node operators with tokens.

In benchmark tests, the framework achieved 78% of the performance of a dedicated supercomputer cluster — an impressive figure considering the heterogeneous nature of the distributed hardware. The key innovation is an adaptive task scheduling algorithm that assigns work based on each node's demonstrated capability and reliability.

Cost analysis reveals the economic advantage. Running a protein folding simulation that would cost $50,000 on a commercial cloud HPC platform cost just $2,500 using the distributed framework. For cash-strapped university research labs, this difference is transformative.

The system has already been stress-tested with a major simulation. A protein folding computation was distributed across 1,247 nodes spanning three continents, completing in 14 hours what would take a single research server 47 days. The results were verified against traditional computation and found to be identical.

Security is handled through cryptographic verification. Each computing node must provide a proof-of-computation that can be verified without re-executing the entire task. This prevents malicious nodes from submitting fake results.`,
      tags: ["distributed-computing", "ipfs", "hpc", "scientific-simulation", "decentralized"],
    },
  },
  {
    paper: {
      title: "Blockchain-Verified Citation Networks: Combating Academic Misinformation",
      authors: "Dr. Natalia Petrova, James Thompson, Dr. Hiroshi Yamamoto",
      abstract: "We propose a blockchain-based citation verification system that tracks the provenance of scientific claims through citation networks. Each citation is verified on-chain, creating an immutable audit trail that helps identify unsupported claims and citation manipulation in academic literature.",
      price: "200000000000000",
      wallet: "0xabcdef0123456789abcdef0123456789abcdef01",
    },
    article: {
      title: "The Blockchain Tool That Exposes Fake Citations in Academic Papers",
      summary: "A new blockchain-based system creates an immutable audit trail for every academic citation, making it possible to trace claims back to their original source and identify papers that misrepresent their references.",
      takeaways: [
        "On-chain citation verification creates immutable provenance trails",
        "System detected 12% of citations in test dataset as misrepresenting source material",
        "Citation manipulation reduced by 73% when authors knew verification was active",
        "Works with existing DOI systems — no changes to publishing workflows needed",
      ],
      body: `Citation manipulation is one of academia's dirty secrets. Studies have found that up to 20% of citations in some fields misrepresent the cited work — either by taking findings out of context, attributing claims that were never made, or citing papers that don't actually support the argument. A new blockchain-based system aims to bring transparency to this opaque corner of academic publishing.

The system works by creating an on-chain record for every citation in a published paper. When an author cites a source, they must provide the specific claim they're referencing and the exact location in the source document. This citation is hashed and stored on the blockchain, creating an immutable record that can be verified by anyone.

The real power comes from the network effect. As more citations are recorded on-chain, the system can automatically trace chains of claims through multiple papers. If Paper A makes a claim, Paper B cites it, and Paper C cites Paper B's citation — the system can verify that the original claim hasn't been distorted through multiple rounds of citation.

Testing on a dataset of 10,000 academic papers revealed some uncomfortable truths. 12% of citations were found to misrepresent their source material in some way. The most common form of manipulation was "citation inflation" — citing a paper as supporting evidence when it actually presented the finding as a limitation or caveat.

Perhaps most tellingly, when researchers ran the system in a transparent mode where authors could see their citations being verified, citation manipulation dropped by 73%. Simply knowing that claims would be checked was enough to dramatically improve citation accuracy.

The system is designed to integrate with existing academic publishing workflows. It works with standard DOI systems and doesn't require authors to change how they write papers. The verification happens automatically during the submission process, with questionable citations flagged for author review before publication.

Several journal publishers have expressed interest in piloting the system, and the research team is building plugins for popular reference management tools like Zotero and Mendeley.`,
      tags: ["citations", "blockchain", "academic-integrity", "misinformation", "verification"],
    },
  },
  {
    paper: {
      title: "Sustainable Blockchain Consensus: A Comparative Study of Energy-Efficient Protocols for Research Applications",
      authors: "Dr. Anna Kowalski, Dr. Raj Patel, Sofia Andersen",
      abstract: "This comparative study evaluates energy-efficient blockchain consensus mechanisms suitable for academic and research applications. We analyze Proof of Stake, Proof of Authority, Proof of History, and novel hybrid mechanisms in terms of energy consumption, throughput, and decentralization trade-offs.",
      price: "100000000000000",
      wallet: "0x5678efab1234cd565678efab1234cd565678efab",
    },
    article: {
      title: "Which Blockchain Consensus Is Greenest? A Head-to-Head Comparison",
      summary: "The most comprehensive comparison yet of energy-efficient blockchain consensus mechanisms reveals surprising results about which protocols are best suited for academic and research applications. Spoiler: the answer isn't always the most popular one.",
      takeaways: [
        "Proof of History consumes 99.97% less energy than Proof of Work",
        "Proof of Authority offers best throughput for private research networks",
        "Hybrid PoS/PoH shows optimal balance for public research blockchains",
        "Energy cost per transaction ranges from $0.0001 to $0.50 across protocols",
      ],
      body: `As blockchain technology finds increasing applications in scientific research, the environmental impact of consensus mechanisms has become a critical concern. A research lab running blockchain-verified experiments shouldn't need the energy consumption of a small country to maintain its ledger. This study provides the most thorough comparison yet of energy-efficient protocols for research use cases.

The research team evaluated five consensus mechanisms across seven metrics: energy consumption per transaction, maximum throughput, latency, degree of decentralization, fault tolerance, setup complexity, and cost per transaction. The analysis combined theoretical modeling with real-world benchmarking on identical hardware.

Proof of History (PoH), as used by Solana, emerged as the most energy-efficient option, consuming 99.97% less energy than traditional Proof of Work. Its cryptographic timestamp mechanism eliminates the need for energy-intensive mining entirely. However, it requires specialized hardware (SHA-256 VDF units) that may not be accessible to all research institutions.

Proof of Authority (PoA) offered the best raw throughput — 10,000+ transactions per second — making it ideal for private research networks where all participants are known and trusted. A pharmaceutical company running internal clinical trial verification, for example, would benefit most from PoA's speed and simplicity.

The most interesting finding was the performance of hybrid mechanisms. A Proof of Stake / Proof of History combination achieved the best overall balance for public research blockchains, where participants are unknown but need to collaborate. This hybrid approach delivered 5,000 TPS with energy consumption comparable to PoH while maintaining meaningful decentralization.

Cost analysis showed dramatic differences. Energy cost per transaction ranged from $0.0001 (PoH) to $0.50 (PoW). For a research institution processing 100,000 blockchain transactions per month, this translates to $10/month versus $50,000/month — a difference that could determine whether blockchain adoption is feasible.

The researchers have published their benchmarking framework as open-source, allowing any institution to evaluate consensus mechanisms for their specific use case.`,
      tags: ["consensus", "energy-efficiency", "sustainability", "blockchain", "research-infrastructure"],
    },
  },
];

// Clear existing data and reseed
db.prepare("DELETE FROM purchases").run();
db.prepare("DELETE FROM articles").run();
db.prepare("DELETE FROM papers").run();

// Re-insert the original 2 papers
const orig = [
  {
    paper: {
      title: "A Survey on Blockchain-based Decentralized Storage Systems",
      authors: "Dr. Sarah Chen, Marcus Williams, Dr. Aisha Patel",
      abstract: "This paper surveys decentralized storage systems built on blockchain technology, comparing architectures, consensus mechanisms, and performance characteristics of major platforms including IPFS, Filecoin, Arweave, and 0G Storage.",
      price: "1000000000000000",
      wallet: "0x1234567890abcdef1234567890abcdef12345678",
    },
    article: {
      title: "The Future of Data Storage: How Blockchain is Rewriting the Rules",
      summary: "A comprehensive survey reveals that blockchain-based storage systems are rapidly maturing, offering compelling alternatives to traditional cloud storage with better security, censorship resistance, and cost efficiency.",
      takeaways: [
        "Decentralized storage eliminates single points of failure inherent in cloud providers",
        "Filecoin leads in total storage capacity with over 15 EiB committed",
        "Content-addressed storage ensures data integrity without trusted third parties",
        "Hybrid architectures combining on-chain metadata with off-chain data show most promise",
      ],
      body: `A groundbreaking survey of blockchain-based storage systems reveals a rapidly maturing ecosystem that could fundamentally reshape how we store and retrieve data. The researchers analyzed four major platforms — IPFS, Filecoin, Arweave, and 0G Storage — examining everything from consensus mechanisms to real-world performance.

The findings are striking. Decentralized storage systems have evolved from theoretical curiosities into production-grade infrastructure. Filecoin alone now hosts over 15 exbibytes of committed storage capacity, rivaling traditional cloud providers in scale.

One of the most important insights is how content-addressed storage eliminates the need for trusted intermediaries. Instead of relying on a cloud provider to keep your data intact, the content itself becomes its own fingerprint. Any tampering is immediately detectable, making these systems inherently more trustworthy.

The researchers also identified a compelling cost advantage. While traditional cloud storage charges ongoing fees that scale linearly with data volume, many blockchain storage systems offer one-time payment models. Over a 5-year horizon, the cost savings can be substantial, particularly for archival data.

However, challenges remain. Retrieval latency is still higher than centralized alternatives, and the user experience lags behind the polish of established cloud services. The study notes that hybrid architectures — combining on-chain metadata with off-chain data storage — appear to offer the best balance of decentralization and performance.

Perhaps most exciting is the emergence of programmable storage, where smart contracts can automatically manage data lifecycle, replication, and access control. This opens possibilities that simply don't exist in traditional storage paradigms.

The researchers conclude that while decentralized storage won't replace cloud providers overnight, the technology has reached an inflection point. As developer tools improve and costs continue to decrease, expect accelerated adoption across enterprises and applications.`,
      tags: ["blockchain", "decentralized-storage", "ipfs", "filecoin", "web3"],
    },
  },
  {
    paper: {
      title: "Smart Contract Vulnerability Detection using Machine Learning",
      authors: "Dr. James Park, Dr. Elena Rossi, Kevin O'Brien",
      abstract: "This paper presents a novel approach to detecting vulnerabilities in Ethereum smart contracts using ensemble machine learning methods. The model achieves 94.2% accuracy on a dataset of 50,000 contracts, outperforming traditional static analysis tools.",
      price: "2000000000000000",
      wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
    },
    article: {
      title: "AI That Catches Bugs Before They Become Billion-Dollar Exploits",
      summary: "A new machine learning model achieves 94.2% accuracy in detecting smart contract vulnerabilities — potentially saving billions in prevented exploits. The research demonstrates that AI can outperform traditional security auditing tools.",
      takeaways: [
        "ML model achieves 94.2% vulnerability detection accuracy across 50,000 smart contracts",
        "Ensemble approach combining Random Forest, XGBoost, and BERT-based code analysis",
        "Detects reentrancy, integer overflow, and access control flaws with high precision",
        "Processes contracts 10x faster than traditional static analysis tools",
      ],
      body: `Smart contract vulnerabilities have cost the blockchain ecosystem billions of dollars. From the infamous DAO hack to more recent DeFi exploits, buggy code has been a persistent thorn in the side of Web3 development. Now, a team of researchers believes machine learning could be the answer.

Their approach uses an ensemble of three different machine learning techniques — Random Forest for pattern-based detection, XGBoost for feature-rich classification, and a BERT-based model that understands the semantic meaning of Solidity code. Together, these methods achieve a remarkable 94.2% accuracy rate.

What makes this particularly impressive is the dataset. The researchers compiled and manually verified 50,000 Ethereum smart contracts, labeling each with known vulnerability types. This is one of the largest labeled datasets of its kind, and it covers the most critical vulnerability categories: reentrancy attacks, integer overflows, and access control flaws.

The speed advantage is equally notable. Traditional static analysis tools can take minutes to scan a complex contract. This ML model processes the same contract in seconds — roughly 10x faster. For developers integrating security checks into CI/CD pipelines, this speed difference is a game-changer.

Interestingly, the researchers found that combining ML with traditional tools produces the best results. The ML model catches vulnerabilities that static analysis misses (particularly subtle logic flaws), while static analysis catches issues that require understanding of low-level EVM behavior.

The team has open-sourced both the model and the dataset, encouraging the community to build upon their work. They're also developing a VS Code extension that would provide real-time vulnerability warnings as developers write smart contracts.

While no automated tool can replace thorough security audits entirely, this research represents a significant step forward. As smart contracts become more complex and manage increasingly large value, AI-assisted security may become not just useful but essential.`,
      tags: ["smart-contracts", "machine-learning", "security", "ethereum", "vulnerability-detection"],
    },
  },
];

const allData = [...orig, ...mockData];

for (const item of allData) {
  const p = stmts.insertPaper.run(
    item.paper.title,
    item.paper.authors,
    item.paper.abstract,
    "",
    item.paper.price,
    item.paper.wallet
  );
  stmts.insertArticle.run(
    p.lastInsertRowid,
    item.article.title,
    item.article.summary,
    JSON.stringify(item.article.takeaways),
    item.article.body,
    JSON.stringify(item.article.tags),
    0
  );
}

const counts = {
  papers: db.prepare("SELECT COUNT(*) as c FROM papers").get().c,
  articles: db.prepare("SELECT COUNT(*) as c FROM articles").get().c,
};

console.log(`✅ Seeded ${counts.papers} papers and ${counts.articles} articles`);
db.close();
