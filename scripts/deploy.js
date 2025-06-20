const hre = require("hardhat");

async function main() {
  const Notary = await hre.ethers.getContractFactory("Notary");
  const notary = await Notary.deploy();
  await notary.waitForDeployment();

  const address = await notary.getAddress();
  console.log("✅ Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
