import { ethers } from "ethers";
import NotaryABI from "./NotaryABI.json";

const NOTARY_CONTRACT_ADDRESS = "0x9baab117304f7d6517048e371025db8f89a8dbe5"; // Replace with your contract address

export async function getNotaryContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected!");
  }

  // Updated provider initialization for ethers v6
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(NOTARY_CONTRACT_ADDRESS, NotaryABI, signer);
}

export async function notarizeFile(fileHash) {
  const notaryContract = await getNotaryContract();
  const tx = await notaryContract.notarize(fileHash);
  await tx.wait();
  return tx;
}

export async function verifyDocument(fileHash) {
  const notaryContract = await getNotaryContract();
  return await notaryContract.verifyDocument(fileHash);
}

export async function verifyDocumentPublic(fileHash) {
  const provider = new ethers.JsonRpcProvider("https://rpc.buildbear.io/exclusive-carnage-12b2998f");
  const notaryContract = new ethers.Contract(NOTARY_CONTRACT_ADDRESS, NotaryABI, provider);

  return await notaryContract.verifyDocument(fileHash);
}
