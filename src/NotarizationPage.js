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
        // Not yet notarized
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
      setResult("✅ Dokumen berhasil dinotariskan!");
    } catch (error) {
      console.error(error);
      setResult(`❌ Notarization failed: ${error.message}`);
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
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📝 <span style={{ fontWeight: "bold" }}>Notarisasi Dokumen</span></h2>
        <button onClick={() => navigate("/verify")} style={{
          padding: "6px 14px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          🔍 Verifikasi Dokumen
        </button>
      </div>

      <p style={{ color: "#555", fontSize: "0.95rem" }}>
        Unggah file Anda untuk dicatat secara permanen di blockchain sebagai bukti keaslian.
      </p>

      <input type="file" onChange={handleFileChange} style={{ margin: "20px 0" }} />

      {fileHash && (
        <>
          <p><strong>Hash File:</strong> <code>{fileHash}</code></p>

          {certificateData ? (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: "green" }}>✅ File ini sudah dinotariskan sebelumnya.</p>
              <p><strong>Tanggal:</strong> {new Date(Number(certificateData.timestamp) * 1000).toLocaleString("en-US")}</p>
              <p><strong>Owner:</strong> {certificateData.owner}</p>

              <div style={{ marginTop: 10 }}>
                <button onClick={() => alert("Verifikasi sukses ✔️")} style={{ marginRight: 10 }}>
                  🔍 Verifikasi File
                </button>
                <button onClick={handleDownloadPDF}>📄 Download Sertifikat PDF</button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleNotarize}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? "#ccc" : "#388e3c",
                color: "#fff",
                padding: "10px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
            >
              {isLoading ? "Memproses..." : "🚀 Notarize Sekarang"}
            </button>
          )}
        </>
      )}

      {result && (
        <p style={{ marginTop: 20, color: result.startsWith("✅") ? "green" : "red" }}>
          {result}
        </p>
      )}
    </div>
  );
}

export default NotarizationPage;
