-- ============================================================
--  RumahPeneliti Database Dump
--  Generated: 2026-04-29T09:08:59.602Z
--  Import: node -e "const db=require("better-sqlite3")("data/rumahpeneliti.db"); db.exec(require("fs").readFileSync("scripts/db-seed.sql","utf8"))"
-- ============================================================

-- SCHEMA
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL UNIQUE,
    curated_title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    key_takeaways TEXT DEFAULT '[]',
    body TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    created_date TEXT DEFAULT (datetime('now')),
    is_mock INTEGER DEFAULT 0, ai_score TEXT DEFAULT NULL, classification TEXT DEFAULT NULL, agent_meta TEXT DEFAULT NULL,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );

CREATE TABLE papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT DEFAULT '',
    abstract TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    upload_date TEXT DEFAULT (datetime('now')),
    price_wei TEXT DEFAULT '0',
    author_wallet TEXT DEFAULT ''
  , storage_hash TEXT DEFAULT '');

CREATE TABLE purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    buyer_wallet TEXT NOT NULL,
    tx_hash TEXT DEFAULT '',
    amount TEXT DEFAULT '0',
    purchase_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );


-- DATA
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (1, 1, 'The Future of Data Storage: How Blockchain is Rewriting the Rules', 'A comprehensive survey reveals that blockchain-based storage systems are rapidly maturing, offering compelling alternatives to traditional cloud storage with better security, censorship resistance, and cost efficiency.', '["Decentralized storage eliminates single points of failure inherent in cloud providers","Filecoin leads in total storage capacity with over 15 EiB committed","Content-addressed storage ensures data integrity without trusted third parties","Hybrid architectures combining on-chain metadata with off-chain data show most promise"]', 'A groundbreaking survey of blockchain-based storage systems reveals a rapidly maturing ecosystem that could fundamentally reshape how we store and retrieve data. The researchers analyzed four major platforms — IPFS, Filecoin, Arweave, and 0G Storage — examining everything from consensus mechanisms to real-world performance.

The findings are striking. Decentralized storage systems have evolved from theoretical curiosities into production-grade infrastructure. Filecoin alone now hosts over 15 exbibytes of committed storage capacity, rivaling traditional cloud providers in scale.

One of the most important insights is how content-addressed storage eliminates the need for trusted intermediaries. Instead of relying on a cloud provider to keep your data intact, the content itself becomes its own fingerprint. Any tampering is immediately detectable, making these systems inherently more trustworthy.

The researchers also identified a compelling cost advantage. While traditional cloud storage charges ongoing fees that scale linearly with data volume, many blockchain storage systems offer one-time payment models. Over a 5-year horizon, the cost savings can be substantial, particularly for archival data.

However, challenges remain. Retrieval latency is still higher than centralized alternatives, and the user experience lags behind the polish of established cloud services. The study notes that hybrid architectures — combining on-chain metadata with off-chain data storage — appear to offer the best balance of decentralization and performance.

Perhaps most exciting is the emergence of programmable storage, where smart contracts can automatically manage data lifecycle, replication, and access control. This opens possibilities that simply don''t exist in traditional storage paradigms.

The researchers conclude that while decentralized storage won''t replace cloud providers overnight, the technology has reached an inflection point. As developer tools improve and costs continue to decrease, expect accelerated adoption across enterprises and applications.', '["blockchain","decentralized-storage","ipfs","filecoin","web3"]', '2026-04-18 18:27:42', 0, '{"novelty":88,"clarity":82,"methodology":79,"impact":91,"reasoning_novelty":"Comprehensive survey covering multiple platforms, breaking new ground in comparative analysis","reasoning_clarity":"Well-structured with clear categorization of storage architectures","reasoning_methodology":"Systematic comparison across 4 platforms with quantitative metrics","reasoning_impact":"Highly relevant as decentralized storage adoption accelerates"}', '{"domain":"Computer Science","subdomain":"Distributed Systems","research_type":"survey","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":5088,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (2, 2, 'AI That Catches Bugs Before They Become Billion-Dollar Exploits', 'A new machine learning model achieves 94.2% accuracy in detecting smart contract vulnerabilities — potentially saving billions in prevented exploits. The research demonstrates that AI can outperform traditional security auditing tools.', '["ML model achieves 94.2% vulnerability detection accuracy across 50,000 smart contracts","Ensemble approach combining Random Forest, XGBoost, and BERT-based code analysis","Detects reentrancy, integer overflow, and access control flaws with high precision","Processes contracts 10x faster than traditional static analysis tools"]', 'Smart contract vulnerabilities have cost the blockchain ecosystem billions of dollars. From the infamous DAO hack to more recent DeFi exploits, buggy code has been a persistent thorn in the side of Web3 development. Now, a team of researchers believes machine learning could be the answer.

Their approach uses an ensemble of three different machine learning techniques — Random Forest for pattern-based detection, XGBoost for feature-rich classification, and a BERT-based model that understands the semantic meaning of Solidity code. Together, these methods achieve a remarkable 94.2% accuracy rate.

What makes this particularly impressive is the dataset. The researchers compiled and manually verified 50,000 Ethereum smart contracts, labeling each with known vulnerability types. This is one of the largest labeled datasets of its kind, and it covers the most critical vulnerability categories: reentrancy attacks, integer overflows, and access control flaws.

The speed advantage is equally notable. Traditional static analysis tools can take minutes to scan a complex contract. This ML model processes the same contract in seconds — roughly 10x faster. For developers integrating security checks into CI/CD pipelines, this speed difference is a game-changer.

Interestingly, the researchers found that combining ML with traditional tools produces the best results. The ML model catches vulnerabilities that static analysis misses (particularly subtle logic flaws), while static analysis catches issues that require understanding of low-level EVM behavior.

The team has open-sourced both the model and the dataset, encouraging the community to build upon their work. They''re also developing a VS Code extension that would provide real-time vulnerability warnings as developers write smart contracts.

While no automated tool can replace thorough security audits entirely, this research represents a significant step forward. As smart contracts become more complex and manage increasingly large value, AI-assisted security may become not just useful but essential.', '["smart-contracts","machine-learning","security","ethereum","vulnerability-detection"]', '2026-04-18 18:27:42', 0, '{"novelty":76,"clarity":91,"methodology":85,"impact":88,"reasoning_novelty":"Novel ensemble ML approach for smart contract security","reasoning_clarity":"Excellent writing quality with clear experimental methodology","reasoning_methodology":"Large dataset (50K contracts) with rigorous validation","reasoning_impact":"Directly applicable to DeFi security, potentially saving billions"}', '{"domain":"Computer Science","subdomain":"Machine Learning","research_type":"experimental","difficulty":"advanced"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":3516,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (3, 3, 'Deep Dive: 0G Storage Integration Test', 'A groundbreaking study on "0G Storage Integration Test" presents exciting new perspectives. Focusing on Testing 0G Storage upload from RumahPeneliti backend... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "0G Storage Integration Test" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications. Practitioners can adopt these findings to improve efficiency and effectiveness.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration, particularly regarding scalability and generalizability of results.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies that could deepen our understanding of this topic.', '["research","innovation","technology","academic"]', '2026-04-20 05:10:56', 1, '{"novelty":72,"clarity":68,"methodology":65,"impact":75,"reasoning_novelty":"Practical integration of 0G Storage for academic papers","reasoning_clarity":"Technical but accessible, good for developers","reasoning_methodology":"Integration-focused rather than experimental","reasoning_impact":"Useful reference for 0G Storage integration patterns"}', '{"domain":"Computer Science","subdomain":"Distributed Storage","research_type":"applied","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":5115,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (4, 4, 'Deep Dive: 0G Storage Real Upload Test', 'A groundbreaking study on "0G Storage Real Upload Test" presents exciting new perspectives. Focusing on Testing real 0G Storage upload... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "0G Storage Real Upload Test" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications. Practitioners can adopt these findings to improve efficiency and effectiveness.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration, particularly regarding scalability and generalizability of results.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies that could deepen our understanding of this topic.', '["research","innovation","technology","academic"]', '2026-04-20 05:23:38', 1, '{"novelty":70,"clarity":74,"methodology":68,"impact":72,"reasoning_novelty":"Novel use of DA layer for academic data integrity","reasoning_clarity":"Clear explanation of DA proof mechanism","reasoning_methodology":"Standard integration testing approach","reasoning_impact":"Demonstrates practical DA layer usage for data verification"}', '{"domain":"Computer Science","subdomain":"Blockchain","research_type":"applied","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":4367,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (5, 5, 'Deep Dive: Decentralized Academic Publishing: A Blockchain-Based Approach', 'A groundbreaking study on "Decentralized Academic Publishing: A Blockchain-Based Approach" presents exciting new perspectives. Focusing on A decentralized journal platform leveraging blockchain and AI... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "Decentralized Academic Publishing: A Blockchain-Based Approach" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 11:25:46', 1, '{"novelty":82,"clarity":86,"methodology":78,"impact":85,"reasoning_novelty":"First known implementation of full 0G pipeline for academic publishing","reasoning_clarity":"Well-documented with clear pipeline visualization","reasoning_methodology":"Comprehensive 6-step integration testing","reasoning_impact":"Could serve as blueprint for other 0G-based publishing platforms"}', '{"domain":"Computer Science","subdomain":"Web3 Infrastructure","research_type":"applied","difficulty":"advanced"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":4707,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (6, 6, 'Deep Dive: NFT Minting Test Paper', 'A groundbreaking study on "NFT Minting Test Paper" presents exciting new perspectives. Focusing on Testing NFT minting in pipeline... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "NFT Minting Test Paper" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 11:29:28', 1, '{"novelty":75,"clarity":80,"methodology":73,"impact":78,"reasoning_novelty":"Combining on-chain anchoring with AI curation for academic works","reasoning_clarity":"Good explanation of anchor + NFT flow","reasoning_methodology":"Sequential transaction approach to avoid nonce conflicts","reasoning_impact":"Relevant for academic integrity and verifiable research"}', '{"domain":"Computer Science","subdomain":"Smart Contracts","research_type":"experimental","difficulty":"advanced"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":3340,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (7, 7, 'Deep Dive: Full Pipeline E2E Test', 'A groundbreaking study on "Full Pipeline E2E Test" presents exciting new perspectives. Focusing on End-to-end test of complete 6-step pipeline... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "Full Pipeline E2E Test" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 11:34:12', 1, '{"novelty":79,"clarity":77,"methodology":76,"impact":82,"reasoning_novelty":"Gasless NFT minting model for academic certificates","reasoning_clarity":"Clear explanation of backend-sponsored gas mechanism","reasoning_methodology":"Solid implementation of ERC-721 with gas optimization","reasoning_impact":"Practical model for making NFTs accessible to researchers"}', '{"domain":"Computer Science","subdomain":"NFT & Digital Assets","research_type":"applied","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":3736,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (8, 8, 'Deep Dive: NFT Final Test', 'A groundbreaking study on "NFT Final Test" presents exciting new perspectives. Focusing on Final NFT mint test... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "NFT Final Test" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 11:37:20', 1, '{"novelty":71,"clarity":73,"methodology":70,"impact":74,"reasoning_novelty":"Integration of Ponder indexer for real-time blockchain data","reasoning_clarity":"Technical focus, could be more accessible","reasoning_methodology":"PGLite embedded approach reduces complexity","reasoning_impact":"Useful pattern for other 0G dApps needing event indexing"}', '{"domain":"Computer Science","subdomain":"Data Engineering","research_type":"applied","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":4168,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (9, 9, 'Deep Dive: E2E Test: Full Pipeline Verification', 'A groundbreaking study on "E2E Test: Full Pipeline Verification" presents exciting new perspectives. Focusing on Testing complete 6-step pipeline... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "E2E Test: Full Pipeline Verification" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 17:41:10', 1, '{"novelty":68,"clarity":72,"methodology":66,"impact":70,"reasoning_novelty":"AI quality scoring for academic papers","reasoning_clarity":"Clear scoring dimensions","reasoning_methodology":"Multi-dimensional assessment approach","reasoning_impact":"Could standardize AI-based research quality evaluation"}', '{"domain":"Computer Science","subdomain":"Artificial Intelligence","research_type":"experimental","difficulty":"advanced"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":4094,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (10, 10, 'Deep Dive: E2E Test: Full Pipeline Verification', 'A groundbreaking study on "E2E Test: Full Pipeline Verification" presents exciting new perspectives. Focusing on Testing complete 6-step pipeline... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "E2E Test: Full Pipeline Verification" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 17:42:28', 1, '{"novelty":65,"clarity":70,"methodology":64,"impact":68,"reasoning_novelty":"Profile-based research dashboard","reasoning_clarity":"Good presentation of author-centric data","reasoning_methodology":"Aggregation of on-chain + off-chain data","reasoning_impact":"Useful for researcher reputation building"}', '{"domain":"Computer Science","subdomain":"Information Systems","research_type":"applied","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":4193,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (11, 11, 'Deep Dive: E2E Test: Full Pipeline Verification', 'A groundbreaking study on "E2E Test: Full Pipeline Verification" presents exciting new perspectives. Focusing on Testing complete 6-step pipeline... The findings could fundamentally change how we understand this topic.', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "E2E Test: Full Pipeline Verification" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-21 17:43:50', 1, '{"novelty":62,"clarity":67,"methodology":60,"impact":65,"reasoning_novelty":"Verification page for on-chain research data","reasoning_clarity":"Simple and intuitive hash verification","reasoning_methodology":"Multi-contract search across indexed events","reasoning_impact":"Important for trust and transparency in academic publishing"}', '{"domain":"Computer Science","subdomain":"Cryptography","research_type":"applied","difficulty":"intermediate"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":3969,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (12, 12, 'Transforming Academic Publishing: How Multi-Agent AI Meets Blockchain', 'A revolutionary platform combines multi-agent AI with 0G blockchain infrastructure to create a transparent, verifiable academic publishing system.', '["Multi-agent AI reduces processing by 60%","Four 0G components integrated in 6-step pipeline","Gasless NFT minting removes barriers for researchers","Ponder indexer enables real-time on-chain data access"]', 'A groundbreaking paper presents RumahPeneliti, a decentralized academic publishing platform that leverages 0G Network infrastructure for transparent, verifiable research publishing.

The researchers propose a multi-agent AI architecture where specialized agents handle different aspects of paper analysis: one agent generates accessible summaries, another scores quality across multiple dimensions, and a third handles classification and tagging.

The system integrates four 0G components in a six-step pipeline that covers everything from decentralized storage upload through on-chain anchoring to gasless NFT minting. Each step is designed to be verifiable and transparent.

One of the key innovations is the parallel execution of AI agents, which reduces processing time by approximately 60% compared to sequential approaches. The quality scoring system evaluates papers on novelty, clarity, methodology, and impact dimensions.

The smart contract architecture includes three contracts handling payments, anchoring, and NFT minting respectively. The gasless NFT model is particularly noteworthy, removing a significant barrier for academic researchers who may not be familiar with cryptocurrency.

Looking forward, this research opens exciting possibilities for transforming academic publishing from a centralized, slow process into a decentralized, AI-powered ecosystem.', '["blockchain","multi-agent-ai","academic-publishing","0g-network","decentralized-storage"]', '2026-04-23 11:09:02', 1, '{"novelty":91,"clarity":87,"methodology":83,"impact":94,"reasoning_novelty":"First known multi-agent AI pipeline on 0G for academic publishing","reasoning_clarity":"Well-structured with clear pipeline description","reasoning_methodology":"Comprehensive integration of 4 0G components","reasoning_impact":"Could transform academic publishing globally"}', '{"domain":"Computer Science","subdomain":"Web3 Infrastructure","research_type":"applied","difficulty":"advanced"}', '{"agents_used":["Summarizer","Scorer","Tagger"],"pipeline_time_ms":3200,"total_agents":3,"successful_agents":3}');
INSERT OR IGNORE INTO articles (id, paper_id, curated_title, summary, key_takeaways, body, tags, created_date, is_mock, ai_score, classification, agent_meta) VALUES (13, 13, 'Deep Dive: Zero-Knowledge Proofs for Decentralized Identity Verification', 'A groundbreaking study on "Zero-Knowledge Proofs for Decentralized Identity Verification" presents exciting new perspectives. Focusing on Novel ZKP-based decentralized identity verification on 0G Network...', '["An innovative new approach to research methodology","Experimental results show significant improvements","Opens new directions for further research","Practical implications relevant to industry"]', 'The research titled "Zero-Knowledge Proofs for Decentralized Identity Verification" represents an important contribution to the academic world. This work introduces a fresh approach that challenges established paradigms.

The research team used a rigorous and well-designed methodology. With an innovative experimental design, they successfully collected comprehensive data to support their hypotheses.

One of the most exciting findings is how this approach overcomes the limitations of previous methods. The results show significant improvements compared to existing baselines.

The implications of this research are far-reaching. Not only does it impact the academic community, but it also opens up opportunities for real-world applications.

However, like any research, this work has its limitations. The researchers acknowledge that there is still room for further exploration.

Looking ahead, this research raises many exciting new questions. The scientific community will certainly look forward to follow-up studies.', '["research","innovation","technology","academic"]', '2026-04-23 11:12:33', 1, '{"novelty":79,"clarity":75,"methodology":84,"impact":60,"reasoning_novelty":"Automated assessment — AI agents unavailable","reasoning_clarity":"Automated assessment — AI agents unavailable","reasoning_methodology":"Automated assessment — AI agents unavailable","reasoning_impact":"Automated assessment — AI agents unavailable"}', '{"domain":"General","subdomain":"Interdisciplinary","research_type":"applied","difficulty":"intermediate"}', NULL);

INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (1, 'A Survey on Blockchain-based Decentralized Storage Systems', 'Dr. Sarah Chen, Marcus Williams, Dr. Aisha Patel', 'This paper surveys decentralized storage systems built on blockchain technology, comparing architectures, consensus mechanisms, and performance characteristics of major platforms including IPFS, Filecoin, Arweave, and 0G Storage.', '', '2026-04-18 18:27:42', '1000000000000000', '0x1234567890abcdef1234567890abcdef12345678', '');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (2, 'Smart Contract Vulnerability Detection using Machine Learning', 'Dr. James Park, Dr. Elena Rossi, Kevin O''Brien', 'This paper presents a novel approach to detecting vulnerabilities in Ethereum smart contracts using ensemble machine learning methods. The model achieves 94.2% accuracy on a dataset of 50,000 contracts, outperforming traditional static analysis tools.', '', '2026-04-18 18:27:42', '2000000000000000', '0xabcdef1234567890abcdef1234567890abcdef12', '');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (3, '0G Storage Integration Test', 'Diva Oracle', 'Testing 0G Storage upload from RumahPeneliti backend', '/app/uploads/009e1484-b258-407c-a815-a1000343ba48-test-paper.txt', '2026-04-20 05:10:54', '1000000000000000', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (4, '0G Storage Real Upload Test', 'akzmee', 'Testing real 0G Storage upload', '/app/uploads/ddeaa112-97b2-47a5-88c5-be13988bbbe1-test-paper.txt', '2026-04-20 05:23:37', '1000000000000000', '', '0x412ee871dae015adedac28570f9e6bd30d19ed9780145e108204c3906c829261');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (5, 'Decentralized Academic Publishing: A Blockchain-Based Approach', 'akzmee, Diva Oracle', 'A decentralized journal platform leveraging blockchain and AI', '/app/uploads/3b0b851b-8c13-43be-9df6-8681997ba5bc-test-paper.txt', '2026-04-21 11:25:44', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8262dd289a7271b016ab773b47b3ab60c5738a3a4f0b33431b881962f9bbba9b');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (6, 'NFT Minting Test Paper', 'akzmee', 'Testing NFT minting in pipeline', '/app/uploads/e2a0dcaa-d9aa-4f2d-91c9-328726249ad5-test-paper.txt', '2026-04-21 11:29:25', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8262dd289a7271b016ab773b47b3ab60c5738a3a4f0b33431b881962f9bbba9b');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (7, 'Full Pipeline E2E Test', 'akzmee', 'End-to-end test of complete 6-step pipeline', '/app/uploads/016f55ee-65cb-4f8e-a8e0-e1d032cc9773-test-paper.txt', '2026-04-21 11:34:09', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8262dd289a7271b016ab773b47b3ab60c5738a3a4f0b33431b881962f9bbba9b');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (8, 'NFT Final Test', 'akzmee', 'Final NFT mint test', '/app/uploads/52ad0864-d002-4eed-9b59-885f41f85fe8-test-paper.txt', '2026-04-21 11:37:17', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8262dd289a7271b016ab773b47b3ab60c5738a3a4f0b33431b881962f9bbba9b');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (9, 'E2E Test: Full Pipeline Verification', 'akzmee, Diva Oracle', 'Testing complete 6-step pipeline', '/app/uploads/9375c98d-a35c-4f61-86f8-58848718e283-e2e-test-paper.txt', '2026-04-21 17:41:08', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8aec0433296acb5d956850ba6052d7f2f12f33096bb4fa8c5228c58727d4773c');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (10, 'E2E Test: Full Pipeline Verification', 'akzmee, Diva Oracle', 'Testing complete 6-step pipeline', '/app/uploads/71ae90f5-04b2-4de5-91df-f22d4150a2ab-e2e-test-paper.txt', '2026-04-21 17:42:25', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8aec0433296acb5d956850ba6052d7f2f12f33096bb4fa8c5228c58727d4773c');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (11, 'E2E Test: Full Pipeline Verification', 'akzmee, Diva Oracle', 'Testing complete 6-step pipeline', '/app/uploads/f961afdb-e955-4e98-8220-86833b612f1d-e2e-test-paper.txt', '2026-04-21 17:43:49', '0', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x8aec0433296acb5d956850ba6052d7f2f12f33096bb4fa8c5228c58727d4773c');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (12, 'Decentralized Academic Publishing: A Multi-Agent AI Approach Using 0G Network', 'Dr. Akzmee, Diva Oracle', 'This paper presents RumahPeneliti, a decentralized academic publishing platform leveraging 0G Network.', '/app/uploads/64a75bd2-e25e-44bc-b954-eb152c4c2742-test-paper.txt', '2026-04-23 11:09:00', '1000000000000000', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0x56a586ab038d93ca7eb80c5a1fd7ecd5658f6faf8b9e4f5ec6cbcf8d7965a071');
INSERT OR IGNORE INTO papers (id, title, authors, abstract, file_path, upload_date, price_wei, author_wallet, storage_hash) VALUES (13, 'Zero-Knowledge Proofs for Decentralized Identity Verification', 'Dr. Akzmee', 'Novel ZKP-based decentralized identity verification on 0G Network', '/app/uploads/d6e4c113-3a43-42d3-8ea9-146b09ca613b-test-paper2.txt', '2026-04-23 11:12:30', '500000000000000', '0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55', '0xa5683b422d041c97a889c8fd63ea0dd7ecdbe28f73923261f62ea0f65b5d7d5b');

INSERT OR IGNORE INTO purchases (id, paper_id, buyer_wallet, tx_hash, amount, purchase_date) VALUES (1, 1, '0x1234567890123456789012345678901234567890', '0xabc123', '1000000000000000000', '2026-04-21 17:39:18');
INSERT OR IGNORE INTO purchases (id, paper_id, buyer_wallet, tx_hash, amount, purchase_date) VALUES (2, 1, '0x1234567890123456789012345678901234567890', '0xabc123', '1000000000000000000', '2026-04-21 17:39:34');
INSERT OR IGNORE INTO purchases (id, paper_id, buyer_wallet, tx_hash, amount, purchase_date) VALUES (3, 1, '0x1234567890123456789012345678901234567890', '0xabc123', '1000000000000000000', '2026-04-21 17:40:00');
INSERT OR IGNORE INTO purchases (id, paper_id, buyer_wallet, tx_hash, amount, purchase_date) VALUES (4, 1, '0x1234567890123456789012345678901234567890', '0xabc123', '1000000000000000000', '2026-04-21 17:41:23');
INSERT OR IGNORE INTO purchases (id, paper_id, buyer_wallet, tx_hash, amount, purchase_date) VALUES (5, 1, '0x1234567890123456789012345678901234567890', '0xabc123', '1000000000000000000', '2026-04-21 17:42:40');
INSERT OR IGNORE INTO purchases (id, paper_id, buyer_wallet, tx_hash, amount, purchase_date) VALUES (6, 1, '0x1234567890123456789012345678901234567890', '0xabc123', '1000000000000000000', '2026-04-21 17:44:04');

