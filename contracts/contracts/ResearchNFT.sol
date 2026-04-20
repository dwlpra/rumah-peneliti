// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ResearchNFT
 * @notice NFT representing curated research papers on RumahPeneliti
 * @dev Each minted NFT links to a paper's 0G Storage hash and on-chain anchor
 */
contract ResearchNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct ResearchToken {
        uint256 tokenId;
        uint256 paperId;           // PaperAnchor on-chain ID
        bytes32 storageRoot;       // 0G Storage Merkle root
        bytes32 curationHash;      // Hash of AI-curated article
        string metadataURI;        // IPFS/0G metadata URI
        address researcher;
        uint256 mintedAt;
    }

    mapping(uint256 => ResearchToken) public tokens;
    mapping(uint256 => uint256) public paperToToken; // PaperAnchor ID => NFT Token ID

    event ResearchMinted(
        uint256 indexed tokenId,
        uint256 indexed paperId,
        bytes32 storageRoot,
        address researcher,
        uint256 timestamp
    );

    constructor() ERC721("RumahPeneliti Research", "RPR") Ownable(msg.sender) {}

    /**
     * @notice Mint a research NFT for a curated paper (gasless - backend sponsored)
     */
    function mintResearch(
        address to,
        uint256 paperId,
        bytes32 storageRoot,
        bytes32 curationHash,
        string calldata metadataURI
    ) external onlyOwner returns (uint256) {
        require(paperToToken[paperId] == 0, "Paper already minted");
        require(storageRoot != bytes32(0), "Storage root required");

        uint256 tokenId = ++_nextTokenId;

        tokens[tokenId] = ResearchToken({
            tokenId: tokenId,
            paperId: paperId,
            storageRoot: storageRoot,
            curationHash: curationHash,
            metadataURI: metadataURI,
            researcher: to,
            mintedAt: block.timestamp
        });

        paperToToken[paperId] = tokenId;
        _safeMint(to, tokenId);

        emit ResearchMinted(tokenId, paperId, storageRoot, to, block.timestamp);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token not found");
        return tokens[tokenId].metadataURI;
    }

    function getResearchToken(uint256 tokenId) external view returns (ResearchToken memory) {
        require(ownerOf(tokenId) != address(0), "Token not found");
        return tokens[tokenId];
    }

    function getTokenByPaper(uint256 paperId) external view returns (ResearchToken memory) {
        uint256 tokenId = paperToToken[paperId];
        require(tokenId != 0, "No NFT for this paper");
        return tokens[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
