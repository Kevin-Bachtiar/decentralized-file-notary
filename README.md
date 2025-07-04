# 🔐 Blockchain File Notarization DApp

A simple and intuitive decentralized application (DApp) for notarizing files on the Ethereum blockchain. This project allows users to prove that a file existed at a certain time and was owned by a specific wallet, secured by cryptographic hashing and immutability of blockchain.

## 🎯 Key Use Case

Whether it's legal documents, digital artworks, certificates, or any sensitive file, this app provides a way to prove **"I had this file first, and here's proof on-chain."**

---

## 🛠️ Built With

| Tech            | Role                                     |
|-----------------|------------------------------------------|
| **Solidity**    | Smart Contract (developed via Remix IDE) |
| **React**       | Frontend UI                              |
| **MetaMask**    | Wallet Integration for interaction       |
| **BuildBear**   | Testnet Environment (EVM-compatible)     |
| **jsPDF**       | Generate PDF-based blockchain certificate |
| **qrcode**      | Generate QR code for instant verification |
| **ethers.js**   | Communicate with smart contract          |

---

## ⚠️ Known Limitations

- 🔐 Currently no IPFS or file storage: only the file hash is stored, not the actual file.
- 🔁 No protection against duplicate notarization (can be added).
- 📉 No gas optimization or batching (each notarization is a separate tx).
- 🌍 Only supports one network (BuildBear) — Mainnet/Testnet toggle could be added.
- 🧾 No transaction hash shown in PDF (could be included in future).
- 📂 File size or format validation not yet implemented.
- 👤 No user history or dashboard yet for notarized docs.

These limitations are noted for improvement in future versions.

## 🧭 Roadmap

- [ ] Add IPFS support for optional file backup
- [ ] Show TX hash & contract explorer link in PDF
- [ ] Add feature to prevent duplicate hash submissions
- [ ] Deploy version to testnet/mainnet toggle
- [ ] Implement user dashboard for submitted notarizations
- [ ] Add localization (EN/ID)

## 🧩 How It Works

### 🔒 Notarization Flow

1. User uploads a file (any format).
2. File is hashed locally using `SHA-256` (no file leaves your machine).
3. The hash is sent to the smart contract and recorded immutably.
4. User receives a downloadable certificate (PDF) containing:
   - File hash
   - Blockchain timestamp
   - Wallet address
   - QR Code to verify publicly

### 🔍 Verification Flow

1. Anyone can visit `/verify` route.
2. Enter the file or paste the hash.
3. If it’s notarized, show full details (timestamp, owner, etc).
4. No wallet required for verification.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MetaMask browser extension
- Testnet ETH (from BuildBear faucet)

### Installation

```bash
git clone https://github.com/your-username/blockchain-notary.git
cd blockchain-notary
npm install


