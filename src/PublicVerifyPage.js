import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyDocumentPublic } from "./contracts/NotaryInterface";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export default function PublicVerifyPage() {
  const [fileHash, setFileHash] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const certificateRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (result?.fileHash) {
      const qrCodeUrl = `${window.location.origin}/verify?hash=${result.fileHash}`;
      QRCode.toDataURL(qrCodeUrl)
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error("QR code generation error", err));
    }
  }, [result]);

  const handleVerify = async () => {
    if (!fileHash) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const [timestamp, owner] = await verifyDocumentPublic(fileHash);
      if (!owner || owner === "0x0000000000000000000000000000000000000000") {
        setError("Dokumen tidak ditemukan pada blockchain.");
      } else {
        const date = new Date(Number(timestamp) * 1000);
        const formattedDate = date.toLocaleString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        setResult({
          fileHash,
          timestamp: formattedDate,
          owner,
          timestampRaw: timestamp,
        });
      }
    } catch (err) {
      setError("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const colors = {
      primary: [15, 23, 42],        // Deep navy
      secondary: [30, 41, 59],       // Slate
      accent: [79, 70, 229],         // Indigo
      gold: [217, 119, 6],          // Golden amber
      success: [5, 150, 105],        // Emerald
      text: [51, 65, 85],           // Dark gray
      lightGray: [148, 163, 184],   // Light slate
      background: [248, 250, 252],   // Off white
      border: [203, 213, 225]        // Border gray
    };

    pdf.setFillColor(...colors.background);
    pdf.rect(0, 0, 210, 297, 'F');

    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, 210, 50, 'F');
    
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text("BLOCKCHAIN AUTHENTICITY", 105, 22, { align: "center" });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.text("VERIFICATION CERTIFICATE", 105, 32, { align: "center" });

    pdf.setFillColor(...colors.gold);
    pdf.roundedRect(25, 58, 120, 14, 3, 3, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text("CERTIFICATE ID:", 30, 64);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`BCA-${result.fileHash.substring(0, 12).toUpperCase()}`, 30, 69);

    pdf.setFillColor(...colors.success);
    pdf.roundedRect(150, 58, 40, 14, 3, 3, 'F');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text("VERIFIED", 170, 66, { align: "center" });

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(20, 80, 170, 125, 2, 2, 'F');
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(20, 80, 170, 125, 2, 2, 'S');

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    pdf.text("This certificate validates the cryptographic integrity and", 105, 95, { align: "center" });
    pdf.text("immutable timestamp of the following digital asset", 105, 102, { align: "center" });
    pdf.text("as recorded on the Ethereum blockchain network.", 105, 109, { align: "center" });

    const verificationData = [
      {
        label: "DOCUMENT HASH",
        value: result.fileHash,
        color: colors.accent
      },
      {
        label: "BLOCKCHAIN TIMESTAMP",
        value: new Date(result.timestamp).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        }),
        color: colors.success
      },
      {
        label: "REGISTERED OWNER",
        value: result.owner,
        color: colors.gold
      },
      {
        label: "BLOCKCHAIN NETWORK",
        value: "Ethereum Mainnet",
        color: colors.primary
      }
    ];

    let yPosition = 125;
    verificationData.forEach((item, index) => {
      if (index > 0) {
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(0.3);
        pdf.line(25, yPosition - 5, 185, yPosition - 5);
      }

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...item.color);
      pdf.text(item.label, 25, yPosition);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.text);
      const splitValue = pdf.splitTextToSize(item.value, 155);
      pdf.text(splitValue, 25, yPosition + 7);
      
      yPosition += 18;
    });

    pdf.setFillColor(...colors.primary);
    pdf.roundedRect(20, 215, 170, 50, 3, 3, 'F');

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text("INSTANT VERIFICATION", 105, 228, { align: "center" });

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(145, 226, 35, 35, 2, 2, 'F');

    const qrCodeUrl = `${window.location.origin}/verify?hash=${result.fileHash}`;
    const qrCodeData = await QRCode.toDataURL(qrCodeUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });

    pdf.addImage(qrCodeData, "PNG", 147, 228, 31, 31);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(255, 255, 255);
    pdf.text("Scan QR code to verify", 25, 240);
    pdf.text("this certificate instantly", 25, 245);
    pdf.text("on the blockchain", 25, 250);

    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.text("Verification URL:", 25, 257);
    pdf.setFontSize(7);
    const shortUrl = qrCodeUrl.length > 45 ? qrCodeUrl.substring(0, 45) + "..." : qrCodeUrl;
    pdf.text(shortUrl, 25, 260);

    pdf.setDrawColor(...colors.accent);
    pdf.setLineWidth(1);
    pdf.line(20, 275, 190, 275);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text("SECURITY NOTICE:", 20, 283);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text("This certificate is cryptographically secured and tamper-evident.", 20, 287);

    pdf.setFontSize(8);
    pdf.setTextColor(...colors.lightGray);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 293);
    pdf.text("Blockchain Notary Service v2.0", 190, 293, { align: "right" });

    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`blockchain-certificate-${result.fileHash.substring(0, 8)}-${timestamp}.pdf`);

  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate certificate. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/notarize")}
          className="mb-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          🔙 Kembali ke Notarisasi
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center">🔍 Public Verification</h1>

        <input
          type="text"
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          placeholder="Enter file hash..."
          className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading || !fileHash}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div 
            ref={certificateRef} 
            className="mt-8 bg-gray-900 p-8 rounded-xl border border-gray-700"
            style={{
              width: '210mm',
              minHeight: '297mm',
              boxSizing: 'border-box'
            }}
          >
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-blue-400 mb-2">BLOCKCHAIN VERIFICATION CERTIFICATE</h1>
              <p className="text-gray-400">This document certifies the authenticity and timestamp of your file on the blockchain</p>
            </div>

            {/* Verification Seal */}
            <div className="border-t border-b border-gray-700 py-4 my-6 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <span className="block">VERIFICATION ID:</span>
                <span className="font-mono text-white">{result.fileHash.substring(0, 16)}...</span>
              </div>
              <div className="bg-red-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                VERIFIED
              </div>
            </div>

            {/* Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">DOCUMENT HASH</h3>
                <p className="font-mono break-all text-sm">{result.fileHash}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">BLOCKCHAIN TIMESTAMP</h3>
                <p>{result.timestamp}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">REGISTERED OWNER</h3>
                <p className="font-mono break-all text-sm">{result.owner}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">BLOCKCHAIN NETWORK</h3>
                <p>Ethereum Mainnet</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold mb-4">VERIFICATION QR CODE</h3>
              <p className="text-gray-400 text-sm mb-4">Scan this QR code to verify this certificate online</p>
              
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Verification QR Code" 
                      width={150} 
                      height={150}
                    />
                  ) : (
                    <div className="w-[150px] h-[150px] bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Loading QR code...</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-gray-400 text-sm break-all">
                {`${window.location.origin}/verify?hash=${result.fileHash}`}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Generated on: {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    This certificate is cryptographically secured on the Ethereum blockchain
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
              >
                📄 Download Verification Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}