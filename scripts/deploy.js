const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const ContractFactory = await hre.ethers.getContractFactory("Notary");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error("❌ Error saat deploy:", error);
  process.exitCode = 1;
});
