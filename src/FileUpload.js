import { useState } from 'react';

const FileUpload = ({ contract, account }) => {
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');

  // Hitung hash SHA-256 dari file
  const calculateHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    const hash = await calculateHash(file);
    setFileHash(hash);
  };

  const notarizeFile = async () => {
    if (!fileHash || !contract) return;
    
    try {
      const tx = await contract.notarizeFile(fileHash);
      await tx.wait();
      alert(`✅ File "${fileName}" berhasil di-notarisasi!\nHash: ${fileHash}`);
    } catch (error) {
      alert(`❌ Gagal: ${error.message}`);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Notarisasi File</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={notarizeFile} disabled={!fileHash}>
        Notarisasi di Blockchain
      </button>
      {fileHash && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>File:</strong> {fileName}</p>
          <p><strong>Hash:</strong> {fileHash}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;