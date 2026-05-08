// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title AgentTipJar
 * @notice On-chain tip jar for AI agents registered as NFTs.
 * @dev Users tip agents by tokenId. Agent NFT owner can withdraw accumulated tips.
 *      Cumulative total is tracked even after withdrawal for stats display.
 *      Part of the RumahPeneliti Agentic Economy — agents earn to fund their own compute.
 */
contract AgentTipJar {
    IERC721 public immutable agentNFT;

    // Current withdrawable balance per agent
    mapping(uint256 => uint256) public agentBalance;
    // Cumulative tips received (never decreases, even after withdrawal)
    mapping(uint256 => uint256) public agentTotalTips;
    // Number of tip transactions per agent
    mapping(uint256 => uint256) public agentTipCount;

    event AgentTipped(uint256 indexed tokenId, address indexed tipper, uint256 amount, string message);
    event Withdrawn(uint256 indexed tokenId, address indexed owner, uint256 amount);

    constructor(address _agentNFT) {
        require(_agentNFT != address(0), "Invalid NFT address");
        agentNFT = IERC721(_agentNFT);
    }

    /**
     * @notice Tip an AI agent by its NFT tokenId
     * @param tokenId The agent NFT token ID
     * @param message Optional message from tipper
     */
    function tipAgent(uint256 tokenId, string calldata message) external payable {
        require(msg.value > 0, "Tip must be > 0");
        require(agentNFT.ownerOf(tokenId) != address(0), "Agent does not exist");

        agentBalance[tokenId] += msg.value;
        agentTotalTips[tokenId] += msg.value;
        agentTipCount[tokenId] += 1;

        emit AgentTipped(tokenId, msg.sender, msg.value, message);
    }

    /**
     * @notice Withdraw accumulated tips for an agent (only NFT owner)
     * @param tokenId The agent NFT token ID
     */
    function withdraw(uint256 tokenId) external {
        require(agentNFT.ownerOf(tokenId) == msg.sender, "Not agent owner");
        uint256 amount = agentBalance[tokenId];
        require(amount > 0, "No balance to withdraw");

        agentBalance[tokenId] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Withdrawal failed");

        emit Withdrawn(tokenId, msg.sender, amount);
    }

    /**
     * @notice Get tip stats for an agent
     * @param tokenId The agent NFT token ID
     * @return balance Current withdrawable balance
     * @return totalTips Cumulative tips received (all-time)
     * @return tipCount Number of tip transactions
     */
    function getAgentStats(uint256 tokenId) external view returns (
        uint256 balance,
        uint256 totalTips,
        uint256 tipCount
    ) {
        return (agentBalance[tokenId], agentTotalTips[tokenId], agentTipCount[tokenId]);
    }
}
