// PublicVerifyPageWithCertificate.js
import { useState } from "react";
import { verifyDocumentPublic } from "./contracts/NotaryInterface";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React, { useRef } from "react";
import QRCode from "react-qr-code";

export default function PublicVerifyPage() {
  const [fileHash, setFileHash] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setResult({
          fileHash,
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
          owner,
        });
      }
    } catch (err) {
      setError("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

    const certificateRef = useRef();

    const handleDownloadPDF = async () => {
  const element = certificateRef.current;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("verification_certificate.pdf");
  } catch (err) {
    console.error("PDF generation failed", err);
    alert("Gagal membuat PDF.");
  }
};



  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center justify-start">
      <h1 className="text-3xl font-bold mb-6">🔍 Public Verification</h1>

      <input
        type="text"
        value={fileHash}
        onChange={(e) => setFileHash(e.target.value)}
        placeholder="Enter file hash..."
        className="w-full max-w-xl p-3 rounded bg-gray-800 border border-gray-600 text-white mb-4"
      />

      <button
        onClick={handleVerify}
        disabled={loading || !fileHash}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div
                ref={certificateRef}
                className="mt-8 bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-2xl"
            >
          <h2 className="text-2xl font-semibold mb-4">🎟️ Verification Certificate</h2>
          <p><strong>File Hash:</strong> {result.fileHash}</p>
          <p><strong>Verified At:</strong> {result.timestamp}</p>
          <p><strong>Owner Address:</strong> {result.owner}</p>

          <div className="mt-4">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              Download PDF
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">Shareable Link:</p>
            <a
              href={`${window.location.origin}/verify?hash=${result.fileHash}`}
              className="text-blue-400 underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${window.location.origin}/verify?hash=${result.fileHash}`}
            </a>
            <div className="mt-4 bg-white p-2 inline-block">
              <QRCode value={`${window.location.origin}/verify?hash=${result.fileHash}`} size={128} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
