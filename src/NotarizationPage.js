import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notarizeFile, verifyDocument, NOTARY_CONTRACT_ADDRESS } from "./contracts/NotaryInterface";
import jsPDF from "jspdf";
import QRCode from "qrcode";

function NotarizationPage() {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const handleVerifyClick = () => {
    navigate("/verify");
  };

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

  const processFile = async (selectedFile) => {
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
      setResult("✅ Document successfully notarized on blockchain!");
    } catch (error) {
      console.error(error);
      setResult(`❌ Notarization failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    { label: "Network:", value: "BuildBear Testnet" },
    { label: "Contract Address:", value: NOTARY_CONTRACT_ADDRESS }
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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
      padding: "20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(0, 255, 0, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: "none",
        zIndex: 1
      }} />
      
      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          padding: "20px 0"
        }}>
          <div>
            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #00ffff, #ff00ff, #00ff00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
              letterSpacing: "-0.02em"
            }}>
              🔗 BlockNotary
            </h1>
            <p style={{
              color: "#8892b0",
              fontSize: "1.1rem",
              margin: "5px 0 0 0",
              fontWeight: "300"
            }}>
              Immutable Document Certification on Blockchain
            </p>
          </div>
          
          <button
            onClick={handleVerifyClick}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            🔍 Verify Document
          </button>
        </div>

        {/* Main Content */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "40px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "40px"
          }}>
            <h2 style={{
              fontSize: "1.8rem",
              color: "#ffffff",
              margin: "0 0 10px 0",
              fontWeight: "600"
            }}>
              Document Notarization
            </h2>
            <p style={{
              color: "#8892b0",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              margin: 0
            }}>
              Upload your document to create an immutable proof of authenticity on the blockchain
            </p>
          </div>

          {/* File Upload Area */}
          <div
            style={{
              border: `2px dashed ${isDragOver ? '#00ffff' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              marginBottom: "30px",
              background: isDragOver ? "rgba(0, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden"
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div style={{
              fontSize: "3rem",
              marginBottom: "20px",
              opacity: 0.7
            }}>
              📁
            </div>
            <h3 style={{
              color: "#ffffff",
              fontSize: "1.3rem",
              margin: "0 0 10px 0",
              fontWeight: "500"
            }}>
              {file ? file.name : "Drop your file here or click to browse"}
            </h3>
            <p style={{
              color: "#8892b0",
              fontSize: "1rem",
              margin: 0
            }}>
              Supports all file formats • Maximum 10MB
            </p>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* File Hash Display */}
          {fileHash && (
            <div style={{
              background: "rgba(0, 255, 255, 0.05)",
              border: "1px solid rgba(0, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px"
            }}>
              <h4 style={{
                color: "#00ffff",
                fontSize: "1.1rem",
                margin: "0 0 10px 0",
                fontWeight: "600"
              }}>
                🔒 Document Hash (SHA-256)
              </h4>
              <code style={{
                background: "rgba(0, 0, 0, 0.3)",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                wordBreak: "break-all",
                display: "block",
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {fileHash}
              </code>
            </div>
          )}

          {/* Certificate or Notarize Button */}
          {certificateData ? (
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 0, 0.05))",
              border: "1px solid rgba(0, 255, 0, 0.3)",
              borderRadius: "16px",
              padding: "30px",
              marginBottom: "20px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00ff00, #00cc00)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}>
                  ✅
                </div>
                <div>
                  <h3 style={{
                    color: "#00ff00",
                    fontSize: "1.4rem",
                    margin: 0,
                    fontWeight: "600"
                  }}>
                    Document Already Notarized
                  </h3>
                  <p style={{
                    color: "#8892b0",
                    fontSize: "1rem",
                    margin: "5px 0 0 0"
                  }}>
                    This document has been verified on the blockchain
                  </p>
                </div>
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "25px"
              }}>
                <div style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "15px",
                  borderRadius: "10px"
                }}>
                  <p style={{
                    color: "#8892b0",
                    fontSize: "0.9rem",
                    margin: "0 0 5px 0",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Notarization Date
                  </p>
                  <p style={{
                    color: "#ffffff",
                    fontSize: "1.1rem",
                    margin: 0,
                    fontWeight: "500"
                  }}>
                    {new Date(Number(certificateData.timestamp) * 1000).toLocaleString("en-US")}
                  </p>
                </div>
                <div style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "15px",
                  borderRadius: "10px"
                }}>
                  <p style={{
                    color: "#8892b0",
                    fontSize: "0.9rem",
                    margin: "0 0 5px 0",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Owner Address
                  </p>
                  <p style={{
                    color: "#ffffff",
                    fontSize: "1.1rem",
                    margin: 0,
                    fontWeight: "500",
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {formatAddress(certificateData.owner)}
                  </p>
                </div>
              </div>

              <div style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={handleVerifyClick}
                  style={{
                    flex: "1",
                    minWidth: "150px",
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #00ffff, #0080ff)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(0, 255, 255, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(0, 255, 255, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(0, 255, 255, 0.3)";
                  }}
                >
                  🔍 Verify Document
                </button>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    flex: "1",
                    minWidth: "150px",
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #ff6b6b, #ff8e8e)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)";
                  }}
                >
                  📄 Download Certificate
                </button>
              </div>
            </div>
          ) : fileHash ? (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleNotarize}
                disabled={isLoading}
                style={{
                  padding: "16px 32px",
                  background: isLoading
                    ? "rgba(255, 255, 255, 0.1)"
                    : "linear-gradient(135deg, #ff6b6b, #ff8e8e)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: isLoading
                    ? "none"
                    : "0 4px 15px rgba(255, 107, 107, 0.3)",
                  opacity: isLoading ? 0.6 : 1,
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)";
                  }
                }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      borderTop: "2px solid #ffffff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                    Processing on Blockchain...
                  </span>
                ) : (
                  "🚀 Notarize Document"
                )}
              </button>
            </div>
          ) : null}

          {/* Result Message */}
          {result && (
            <div style={{
              marginTop: "30px",
              padding: "20px",
              borderRadius: "12px",
              background: result.startsWith("✅")
                ? "linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 0, 0.05))"
                : "linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.05))",
              border: `1px solid ${result.startsWith("✅") ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"}`,
              color: result.startsWith("✅") ? "#00ff00" : "#ff6b6b",
              fontSize: "1.1rem",
              fontWeight: "500",
              textAlign: "center"
            }}>
              {result}
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NotarizationPage;
