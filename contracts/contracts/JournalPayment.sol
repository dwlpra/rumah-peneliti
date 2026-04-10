// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title JournalPayment
 * @notice Micropayment contract for RumahPeneliti.com
 * @dev Authors upload papers, readers pay micro amounts to access them.
 *      Payments go directly to author wallets.
 */
contract JournalPayment {
    struct Paper {
        address author;
        string title;
        string paperHash;      // 0G Storage content hash
        uint256 price;         // price in wei (micro payment)
        string articleHash;    // 0G Storage hash for curated article (set after AI kurasi)
        bool exists;
    }

    mapping(uint256 => Paper) public papers;
    mapping(uint256 => mapping(address => bool)) public hasPurchased;
    uint256 public paperCount;

    event PaperUploaded(uint256 indexed paperId, address indexed author, string title, string paperHash, uint256 price);
    event PaperPurchased(uint256 indexed paperId, address indexed reader, uint256 amount);
    event ArticleCreated(uint256 indexed paperId, string articleHash);

    /**
     * @notice Upload a new paper with price
     * @param _title Paper title
     * @param _paperHash 0G Storage content hash
     * @param _price Price in wei for readers to access
     */
    function uploadPaper(
        string calldata _title,
        string calldata _paperHash,
        uint256 _price
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_paperHash).length > 0, "Paper hash required");

        uint256 paperId = paperCount++;
        papers[paperId] = Paper({
            author: msg.sender,
            title: _title,
            paperHash: _paperHash,
            price: _price,
            articleHash: "",
            exists: true
        });

        emit PaperUploaded(paperId, msg.sender, _title, _paperHash, _price);
        return paperId;
    }

    /**
     * @notice Purchase access to a paper (micropayment)
     * @param _paperId ID of the paper to purchase
     */
    function purchasePaper(uint256 _paperId) external payable {
        Paper storage paper = papers[_paperId];
        require(paper.exists, "Paper not found");
        require(msg.value >= paper.price, "Insufficient payment");
        require(!hasPurchased[_paperId][msg.sender], "Already purchased");

        hasPurchased[_paperId][msg.sender] = true;

        // Payment goes directly to author
        (bool sent, ) = paper.author.call{value: msg.value}("");
        require(sent, "Payment failed");

        emit PaperPurchased(_paperId, msg.sender, msg.value);
    }

    /**
     * @notice Set the curated article hash for a paper (called by author or backend)
     * @param _paperId Paper ID
     * @param _articleHash 0G Storage hash of the curated article
     */
    function setArticle(uint256 _paperId, string calldata _articleHash) external {
        Paper storage paper = papers[_paperId];
        require(paper.exists, "Paper not found");
        require(msg.sender == paper.author, "Only author");
        require(bytes(_articleHash).length > 0, "Article hash required");

        paper.articleHash = _articleHash;
        emit ArticleCreated(_paperId, _articleHash);
    }

    /**
     * @notice Check if a reader has purchased a paper
     */
    function checkAccess(uint256 _paperId, address _reader) external view returns (bool) {
        return hasPurchased[_paperId][_reader] || papers[_paperId].author == _reader;
    }

    /**
     * @notice Get paper details
     */
    function getPaper(uint256 _paperId) external view returns (
        address author,
        string memory title,
        string memory paperHash,
        uint256 price,
        string memory articleHash,
        bool hasArticle
    ) {
        Paper storage p = papers[_paperId];
        require(p.exists, "Paper not found");
        return (p.author, p.title, p.paperHash, p.price, p.articleHash, bytes(p.articleHash).length > 0);
    }
}
