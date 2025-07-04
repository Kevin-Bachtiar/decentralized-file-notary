const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const ContractFactory = await hre.ethers.getContractFactory("Notary");
  console.log("⏳ Creating contract instance...");
  const contract = await ContractFactory.deploy();

  console.log("⏳ Waiting for deployment...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error("❌ Error when deployed:", error);
  process.exitCode = 1;
});
