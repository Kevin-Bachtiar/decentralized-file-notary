require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { task } = require("hardhat/config");

// ✅ Custom task: lihat daftar akun
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

console.log("Private key loaded:", process.env.BUILDBEAR_PRIVATE_KEY ? "YES" : "NO");

module.exports = {
  solidity: "0.8.28",
  networks: {
    buildbear: {
      url: process.env.BUILDBEAR_RPC_URL,
      accounts: [process.env.BUILDBEAR_PRIVATE_KEY],
      chainId: 26839,
      gas: 10000000, // Optional, untuk menghindari gas terlalu kecil
      timeout: 200000, // Hindari timeout saat deploy
    },
  },
};
