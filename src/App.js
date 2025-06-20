import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import FileUpload from './FileUpload';
import VerifyDocument from './VerifyDocument';
import NotaryABI from './contracts/Notary.json'; // sesuaikan path

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // isi dengan address kontrakmu

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, NotaryABI.abi, signer);
        setContract(contractInstance);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="App">
      <h1>Decentralized File Notary</h1>

      {!account ? (
        <button onClick={connectMetaMask}>Connect MetaMask</button>
      ) : (
        <p>Connected Account: {account}</p>
      )}

      {account && contract && (
        <>
          <FileUpload contract={contract} account={account} />
          <VerifyDocument contract={contract} />
        </>
      )}
    </div>
  );
}

export default App;
