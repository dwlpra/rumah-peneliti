// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentNFT
 * @notice ERC-7857 inspired on-chain AI Agent Identity
 * @dev Each minted NFT represents a registered AI agent with verifiable on-chain metadata.
 *      Inspired by ERC-7857 (Agent Token Standard) for the RumahPeneliti platform.
 */
contract AgentNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    enum AgentType { Kurator, Scorer, Summarizer, Tagger, Reviewer, Custom }

    struct Agent {
        uint256 tokenId;
        string name;
        string description;
        AgentType agentType;
        string model;
        string capabilities;
        address creator;
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }

    mapping(uint256 => Agent) public agents;
    mapping(string => uint256) public nameToToken;

    event AgentMinted(
        uint256 indexed tokenId,
        string name,
        AgentType agentType,
        string model,
        address creator,
        uint256 timestamp
    );

    event AgentUpdated(uint256 indexed tokenId, string name, uint256 timestamp);
    event AgentDeactivated(uint256 indexed tokenId, uint256 timestamp);

    constructor() ERC721("RumahPeneliti Agent", "RPAG") Ownable(msg.sender) {}

    function mintAgent(
        address to,
        string calldata name,
        string calldata description,
        AgentType agentType,
        string calldata model,
        string calldata capabilities
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(nameToToken[name] == 0, "Agent name already exists");

        uint256 tokenId = ++_nextTokenId;

        agents[tokenId] = Agent({
            tokenId: tokenId,
            name: name,
            description: description,
            agentType: agentType,
            model: model,
            capabilities: capabilities,
            creator: to,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });

        nameToToken[name] = tokenId;
        _safeMint(to, tokenId);

        emit AgentMinted(tokenId, name, agentType, model, to, block.timestamp);
        return tokenId;
    }

    function updateAgent(
        uint256 tokenId,
        string calldata description,
        AgentType agentType,
        string calldata model,
        string calldata capabilities
    ) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Agent not found");

        Agent storage agent = agents[tokenId];
        agent.description = description;
        agent.agentType = agentType;
        agent.model = model;
        agent.capabilities = capabilities;
        agent.updatedAt = block.timestamp;

        emit AgentUpdated(tokenId, agent.name, block.timestamp);
    }

    function deactivateAgent(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Agent not found");
        agents[tokenId].active = false;
        agents[tokenId].updatedAt = block.timestamp;
        emit AgentDeactivated(tokenId, block.timestamp);
    }

    function getAgent(uint256 tokenId) external view returns (Agent memory) {
        require(ownerOf(tokenId) != address(0), "Agent not found");
        return agents[tokenId];
    }

    function getAgentByName(string calldata name) external view returns (Agent memory) {
        uint256 tokenId = nameToToken[name];
        require(tokenId != 0, "Agent name not found");
        return agents[tokenId];
    }

    function agentCount() external view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Agent not found");
        Agent memory a = agents[tokenId];
        return string(abi.encodePacked(
            '{"name":"', a.name,
            '","description":"', a.description,
            '","model":"', a.model,
            '","type":', uint2str(uint256(a.agentType)),
            ',"active":', a.active ? "true" : "false",
            '}'
        ));
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) { length++; j /= 10; }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
}
