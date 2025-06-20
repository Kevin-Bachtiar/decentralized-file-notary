import { useState } from 'react';

const VerifyDocument = ({ contract }) => {
  const [inputHash, setInputHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const verifyFile = async () => {
  if (!inputHash || !contract) return;
  
  try {
    console.log("Memanggil contract dengan hash:", inputHash);
    const [timestamp, owner] = await contract.verifyDocument(inputHash);
    console.log("Hasil:", { timestamp, owner }); // <-- Cek hasil di console browser
    
    setVerificationResult({
      exists: timestamp > 0,
      timestamp: new Date(timestamp * 1000).toLocaleString(),
      owner: owner
    });
  } catch (error) {
    console.error("Error saat verifikasi:", error); // <-- Cek error detail
    alert(`❌ ${error.reason || "Hash tidak ditemukan"}`);
  }
};

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Verifikasi Dokumen</h3>
      <input 
        type="text" 
        placeholder="Masukkan hash file" 
        value={inputHash}
        onChange={(e) => setInputHash(e.target.value)}
      />
      <button onClick={verifyFile}>Verifikasi</button>
      
      {verificationResult && (
        <div style={{ marginTop: '10px' }}>
          {verificationResult.exists ? (
            <>
              <p>✅ Dokumen terdaftar!</p>
              <p><strong>Pemilik:</strong> {verificationResult.owner}</p>
              <p><strong>Waktu Notarisasi:</strong> {verificationResult.timestamp}</p>
            </>
          ) : (
            <p>❌ Dokumen tidak ditemukan.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyDocument;