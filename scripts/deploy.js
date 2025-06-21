const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const ContractFactory = await hre.ethers.getContractFactory("Notary"); // Ganti dengan nama kontrak kamu
  const contract = await ContractFactory.deploy(); // <- deploy dari factory
  await contract.waitForDeployment(); // << GANTI INI, bukan .deployed()

  const contractAddress = await contract.getAddress(); // << ambil alamat
  console.log("✅ Contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error("❌ Error saat deploy:", error);
  process.exitCode = 1;
});
