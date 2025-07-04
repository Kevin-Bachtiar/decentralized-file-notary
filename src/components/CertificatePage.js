import { useEffect } from "react";

export default function CertificatePage({ data, onBack }) {
  const { fileHash, timestamp, owner } = data;

  const downloadPDF = () => {
    const content = `
      Certificate of Notarization

      File Hash:
      ${fileHash}

      Timestamp:
      ${new Date(Number(timestamp) * 1000).toLocaleString()}

      Owner Address:
      ${owner}
    `;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notarization_certificate.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">📄 Certificate of Notarizationn</h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-2xl">
        <p><strong>File Hash:</strong></p>
        <p className="break-all mb-4">{fileHash}</p>

        <p><strong>Timestamp:</strong></p>
        <p className="mb-4">{new Date(Number(timestamp) * 1000).toLocaleString()}</p>

        <p><strong>Owner:</strong></p>
        <p className="break-all">{owner}</p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded"
          onClick={downloadPDF}
        >
          Download PDF
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
}
