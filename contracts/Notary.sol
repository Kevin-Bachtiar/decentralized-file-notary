pragma solidity ^0.8.0;

contract Notary {
    struct Document {
        uint256 timestamp;
        address owner;
    }

    mapping(bytes32 => Document) public documents;

    function notarizeFile(string memory hash) external {
        bytes32 hashed = keccak256(abi.encodePacked(hash));
        require(documents[hashed].timestamp == 0, "Already notarized");
        documents[hashed] = Document(block.timestamp, msg.sender);
    }

    function verifyDocument(string memory hash) external view returns (uint256, address) {
        bytes32 hashed = keccak256(abi.encodePacked(hash));
        Document memory doc = documents[hashed];
        return (doc.timestamp, doc.owner);
    }
}