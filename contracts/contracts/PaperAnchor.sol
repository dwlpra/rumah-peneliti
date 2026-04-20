// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaperAnchor
 * @notice Anchors research paper hashes on 0G blockchain for immutable verification
 * @dev Each paper upload is recorded with its storage hash, AI curation hash, and metadata
 */
contract PaperAnchor {
    struct PaperRecord {
        uint256 id;
        bytes32 storageRoot;        // 0G Storage Merkle root
        bytes32 curationHash;       // Hash of AI-curated article
        bytes32 metadataHash;       // Hash of paper metadata (title, authors, etc.)
        address author;
        uint256 timestamp;
        bool hasArticle;
        uint256 citationCount;
    }

    uint256 public nextId;
    mapping(uint256 => PaperRecord) public records;
    mapping(address => uint256[]) public authorPapers;
    mapping(bytes32 => uint256) public rootToId;

    event PaperAnchored(
        uint256 indexed id,
        bytes32 indexed storageRoot,
        bytes32 curationHash,
        bytes32 metadataHash,
        address author,
        uint256 timestamp
    );

    event ArticleAnchored(
        uint256 indexed paperId,
        bytes32 articleHash,
        uint256 timestamp
    );

    event PaperCited(
        uint256 indexed paperId,
        uint256 citationCount
    );

    /**
     * @notice Anchor a new paper to the blockchain
     * @param storageRoot 0G Storage Merkle root hash
     * @param curationHash Hash of the AI-curated article (can be empty initially)
     * @param metadataHash Hash of paper metadata (title, authors, abstract)
     */
    function anchorPaper(
        bytes32 storageRoot,
        bytes32 curationHash,
        bytes32 metadataHash
    ) external returns (uint256) {
        require(storageRoot != bytes32(0), "Storage root required");

        uint256 id = ++nextId;
        records[id] = PaperRecord({
            id: id,
            storageRoot: storageRoot,
            curationHash: curationHash,
            metadataHash: metadataHash,
            author: msg.sender,
            timestamp: block.timestamp,
            hasArticle: curationHash != bytes32(0),
            citationCount: 0
        });

        authorPapers[msg.sender].push(id);
        rootToId[storageRoot] = id;

        emit PaperAnchored(id, storageRoot, curationHash, metadataHash, msg.sender, block.timestamp);
        return id;
    }

    /**
     * @notice Update paper with AI curation result
     * @param paperId The paper ID
     * @param articleHash Hash of the curated article content
     */
    function setArticle(uint256 paperId, bytes32 articleHash) external {
        PaperRecord storage paper = records[paperId];
        require(paper.id != 0, "Paper not found");
        require(articleHash != bytes32(0), "Article hash required");

        paper.curationHash = articleHash;
        paper.hasArticle = true;

        emit ArticleAnchored(paperId, articleHash, block.timestamp);
    }

    /**
     * @notice Record a citation for a paper
     * @param paperId The paper being cited
     */
    function citePaper(uint256 paperId) external {
        require(records[paperId].id != 0, "Paper not found");
        records[paperId].citationCount++;
        emit PaperCited(paperId, records[paperId].citationCount);
    }

    /**
     * @notice Get all papers by an author
     */
    function getPapersByAuthor(address author) external view returns (uint256[] memory) {
        return authorPapers[author];
    }

    /**
     * @notice Get paper record by storage root
     */
    function getPaperByRoot(bytes32 storageRoot) external view returns (PaperRecord memory) {
        uint256 id = rootToId[storageRoot];
        require(id != 0, "Paper not found");
        return records[id];
    }

    /**
     * @notice Get paper record by ID
     */
    function getPaper(uint256 paperId) external view returns (PaperRecord memory) {
        require(records[paperId].id != 0, "Paper not found");
        return records[paperId];
    }

    /**
     * @notice Verify a paper's integrity by checking storage root
     */
    function verifyPaper(uint256 paperId, bytes32 storageRoot) external view returns (bool) {
        return records[paperId].storageRoot == storageRoot;
    }
}
