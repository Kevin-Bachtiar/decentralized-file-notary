import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notarizeFile, verifyDocument } from "./contracts/NotaryInterface";
import jsPDF from "jspdf";
import QRCode from "qrcode";

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
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult("");
    setCertificateData(null);

    if (selectedFile) {
      const hash = await calculateHash(selectedFile);
      setFileHash(hash);

      try {
        const [ts, owner] = await verifyDocument(hash);
        if (ts && ts.toString() !== "0") {
          setCertificateData({ fileHash: hash, timestamp: ts, owner });
        }
      } catch (err) {
        // Not yet notarized, don't set certificateData
      }
    }
  };

  const handleNotarize = async () => {
    if (!fileHash) {
      setResult("Please upload a file first.");
      return;
    }

    setIsLoading(true);
    try {
      await notarizeFile(fileHash);
      const [ts, owner] = await verifyDocument(fileHash);
      setCertificateData({ fileHash, timestamp: ts, owner });
      setResult("Berhasil dinotariskan!");
    } catch (error) {
      console.error(error);
      setResult(`Notarization failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
  if (!certificateData) return;

  const { fileHash, timestamp, owner } = certificateData;

  const date = new Date(Number(timestamp) * 1000);
  const options = { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  };
  const formattedDate = date.toLocaleString("en-US", options);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    filters: ["ASCIIHexEncode"]
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 53, 147);
  doc.text("BLOCKCHAIN DOCUMENT NOTARIZATION", 105, 40, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text("Certificate of Authenticity", 105, 48, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(30, 55, 180, 55);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("DOCUMENT FINGERPRINT", 30, 70);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text(fileHash, 30, 77, { maxWidth: 150, align: "left" });

  doc.setFont("helvetica", "bold");
  doc.text("NOTARIZATION DETAILS", 30, 95);
  
  const metadata = [
    { label: "Timestamp:", value: formattedDate },
    { label: "Blockchain Address:", value: owner },
    { label: "Network:", value: "Ethereum Sepolia Testnet" },
    { label: "Contract Address:", value: "0x9bAaB117304f7D6517048e371025dB8f89a8DbE5" }
  ];

  let y = 102;
  metadata.forEach(item => {
    doc.setFont("helvetica", "bold");
    doc.text(item.label, 30, y);
    doc.setFont("helvetica", "normal");
    doc.text(item.value, 70, y);
    y += 7;
  });

  doc.setFont("helvetica", "bold");
  doc.text("VERIFICATION", 30, y + 15);
  
  const verifyUrl = `${window.location.origin}/verify?hash=${fileHash}`;
  const qrSize = 50;
  const qrX = 30;
  const qrY = y + 20;
  
  const qrImage = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#283593', 
      light: '#ffffff' 
    }
  });
  
  doc.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Scan to verify document on blockchain", qrX, qrY + qrSize + 5);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("This certificate is cryptographically secured on the Ethereum blockchain.", 105, 280, { align: "center" });
  doc.text(`Transaction Hash: ${certificateData.txHash || 'N/A'}`, 105, 285, { align: "center" });

  doc.setFontSize(60);
  doc.setTextColor(230, 230, 230);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.text("BLOCKCHAIN", 105, 150, { angle: 45, align: "center" });

  doc.save(`Blockchain-Notarization-${fileHash.slice(0, 8)}.pdf`);
};

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Notarisasi Dokumen</h2>
      <input type="file" onChange={handleFileChange} />
      <br /><br />

      {fileHash && (
        <>
          <p><strong>Hash File:</strong> {fileHash}</p>

          {certificateData ? (
            <div>
              <p>✅ File ini sudah dinotariskan.</p>
              <p><strong>Tanggal:</strong> {new Date(Number(certificateData.timestamp) * 1000).toLocaleString()}</p>
              <p><strong>Owner:</strong> {certificateData.owner}</p>
              <button onClick={() => alert("Verifikasi sukses ✔️")}>🔍 Verifikasi File</button>
              <button onClick={handleDownloadPDF}>📄 Download Sertifikat PDF</button>
            </div>
          ) : (
            <button onClick={handleNotarize} disabled={isLoading}>
              {isLoading ? "Memproses..." : "🚀 Notarize Sekarang"}
            </button>
          )}
        </>
      )}

      {result && <p style={{ color: "green" }}>{result}</p>}
    </div>
  );
}

export default NotarizationPage;
