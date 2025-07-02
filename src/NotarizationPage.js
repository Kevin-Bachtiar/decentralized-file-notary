import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notarizeFile, verifyDocument } from "./contracts/NotaryInterface";

function NotarizationPage() {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const navigate = useNavigate();

  const calculateHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    return hex;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const hash = await calculateHash(selectedFile);
      setFileHash(hash);
    }
  };

  const handleNotarize = async () => {
  if (!fileHash) {
    setResult("Please upload a file first");
    return;
  }

  setIsLoading(true);
  try {
    const [timestamp] = await verifyDocument(fileHash);
    if (timestamp.toString() !== "0") {
      setResult("File ini sudah pernah dinotariskan.");
      setIsLoading(false);
      return;
    }

    await notarizeFile(fileHash);
    const [ts, owner] = await verifyDocument(fileHash);
    setCertificateData({ fileHash, timestamp: ts, owner });
    navigate(`/certificate/${fileHash}`);
  } catch (error) {
    console.error(error);
    setResult(`Notarization failed: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div>
      <h2>Notarize Document</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleNotarize} disabled={isLoading}>
        {isLoading ? "Processing..." : "Notarize"}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}

export default NotarizationPage;
