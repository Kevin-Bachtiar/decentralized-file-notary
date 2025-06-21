  require("@nomicfoundation/hardhat-toolbox");
  require("dotenv").config();

  /** @type import('hardhat/config').HardhatUserConfig */

  console.log("Private key loaded:", process.env.SEPOLIA_PRIVATE_KEY ? "YES" : "NO");

  module.exports = {
    solidity: "0.8.28",
    networks: {
      sepolia: {
        url: "https://eth-sepolia.g.alchemy.com/v2/tAoiOjQ8Ngx543gDq48uNrHapsq0Z9Sd",
        accounts: [process.env.SEPOLIA_PRIVATE_KEY],
        timeout: 200000, // opsional, biar gak timeout
      },
    },
  };
