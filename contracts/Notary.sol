// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Notary {
    struct Document {
        string fileHash;
        uint256 timestamp;
        address owner;
    }

    mapping(string => Document) public documents;
    event DocumentNotarized(string fileHash, uint256 timestamp, address owner);

    function notarizeFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "File hash cannot be empty");
        require(documents[_fileHash].timestamp == 0, "File already notarized");

        documents[_fileHash] = Document({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        emit DocumentNotarized(_fileHash, block.timestamp, msg.sender);
    }

    function verifyDocument(string memory _fileHash) public view returns (uint256, address) {
        require(documents[_fileHash].timestamp != 0, "Document not found");
        return (documents[_fileHash].timestamp, documents[_fileHash].owner);
    }
}