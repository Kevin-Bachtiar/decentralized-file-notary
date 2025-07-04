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
        setError("Document not found on blockchain");
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
      setError("Error: " + err.message);
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
  <div style={{
    minHeight: '100vh',
    background: 'radial-gradient(circle at 10% 20%, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 1) 90%)',
    color: '#f8fafc',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, sans-serif",
    overflowX: 'hidden'
  }}>
    {/* Floating blockchain nodes animation */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {[...Array(15)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: `hsl(${Math.random() * 60 + 200}, 80%, 60%)`,
          opacity: 0.7,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          boxShadow: `0 0 15px hsl(${Math.random() * 60 + 200}, 80%, 60%)`,
          animation: `float ${Math.random() * 10 + 10}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`
        }} />
      ))}
    </div>

    <div style={{
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Cyberpunk-style header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
      }}>
        <button
          onClick={() => navigate("/notarize")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.3))',
            color: '#e0e7ff',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)',
            backdropFilter: 'blur(5px)',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          <span style={{ fontSize: '20px' }}>←</span>
          Back to Notarization
        </button>
        
        <div style={{
          textAlign: 'right',
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#818cf8',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>BLOCKCHAIN VERIFICATION</div>
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            fontFamily: "'Roboto Mono', monospace"
          }}></div>
        </div>
      </div>

      {/* Holographic card effect */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        borderRadius: '16px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: `
          0 0 0 1px rgba(199, 210, 254, 0.1),
          0 10px 30px -15px rgba(0, 0, 0, 0.5),
          inset 0 0 20px rgba(99, 102, 241, 0.1)
        `,
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(10px)',
        marginBottom: '40px'
      }}>
        {/* Glowing header */}
        <div style={{
          background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 65%, rgba(255,255,255,0.1) 75%, transparent 85%)',
            animation: 'shine 3s infinite linear',
            transform: 'rotate(30deg)'
          }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #fff, #c7d2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            position: 'relative'
          }}>DOCUMENT VERIFICATION</h1>
          <p style={{
            color: '#c7d2fe',
            fontSize: '16px',
            fontWeight: '500',
            position: 'relative'
          }}>Verify blockchain authenticity in real-time</p>
        </div>

        {/* Input section with neon effect */}
        <div style={{ padding: '28px' }}>
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '12px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              <span style={{ color: '#818cf8' }}>▷</span> ENTER DOCUMENT HASH
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={fileHash}
                onChange={(e) => setFileHash(e.target.value)}
                placeholder="0x2fd4e1c67a2d28fced84..."
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  outline: 'none',
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#f8fafc',
                  fontSize: '16px',
                  boxShadow: '0 0 0 1px rgba(199, 210, 254, 0.1), inset 0 0 10px rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s'
                }}
              />
              <button
                onClick={handleVerify}
                disabled={loading || !fileHash}
                style={{
                  padding: '0 28px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '16px',
                  color: 'white',
                  background: loading || !fileHash 
                    ? 'linear-gradient(145deg, rgba(71, 85, 105, 0.7), rgba(51, 65, 85, 0.9))' 
                    : 'linear-gradient(145deg, #6366f1, #4f46e5)',
                  border: 'none',
                  cursor: loading || !fileHash ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: loading || !fileHash 
                    ? 'none' 
                    : '0 4px 15px rgba(79, 70, 229, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      VERIFYING...
                    </span>
                  </>
                ) : (
                  <span style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      width: 'calc(100% + 20px)',
                      height: 'calc(100% + 20px)',
                      background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.3) 50%, transparent 55%)',
                      animation: 'shine 3s infinite linear',
                      opacity: 0.7
                    }} />
                    VERIFY
                  </span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: '28px',
              padding: '16px',
              background: 'linear-gradient(145deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.3))',
              borderLeft: '4px solid #ef4444',
              borderRadius: '0 8px 8px 0',
              boxShadow: 'inset 0 0 10px rgba(220, 38, 38, 0.2)',
              animation: 'pulseError 2s infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  color: '#fca5a5',
                  fontWeight: 'bold',
                  marginRight: '12px',
                  fontSize: '20px'
                }}>⚠️</div>
                <div>
                  <p style={{
                    fontSize: '16px',
                    color: '#fecaca',
                    fontWeight: '500',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div style={{
              marginTop: '28px',
              paddingTop: '28px',
              borderTop: '1px solid rgba(100, 116, 139, 0.3)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#e2e8f0',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                position: 'relative',
                display: 'inline-block'
              }}>
                <span style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: 0,
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #818cf8, #4f46e5)',
                  borderRadius: '2px'
                }} />
                VERIFICATION RESULTS
              </h2>
              
              {/* Hexagon grid layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '100%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent 65%, rgba(129, 140, 248, 0.1) 75%, transparent 85%)',
                    animation: 'shine 6s infinite linear',
                    transform: 'rotate(30deg)',
                    opacity: 0.5
                  }} />
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#818cf8',
                    marginBottom: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>DOCUMENT HASH</h3>
                  <p style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: '14px',
                    color: '#e2e8f0',
                    wordBreak: 'break-all',
                    lineHeight: '1.6'
                  }}>{result.fileHash}</p>
                </div>
                
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#34d399',
                    marginBottom: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>BLOCKCHAIN TIMESTAMP</h3>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>{result.timestamp}</p>
                </div>
                
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#f59e0b',
                    marginBottom: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>REGISTERED OWNER</h3>
                  <p style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: '14px',
                    color: '#e2e8f0',
                    wordBreak: 'break-all',
                    lineHeight: '1.6'
                  }}>{result.owner}</p>
                </div>
                
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#ec4899',
                    marginBottom: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>NETWORK</h3>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>Ethereum Mainnet</p>
                </div>
              </div>

              {/* Glowing verification badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, transparent 65%, rgba(16, 185, 129, 0.1) 75%, transparent 85%)',
                  animation: 'shine 6s infinite linear',
                  opacity: 0.3
                }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.5))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                  }}>
                    <span style={{
                      color: '#a7f3d0',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      textShadow: '0 0 10px rgba(16, 185, 129, 0.7)'
                    }}>✓</span>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#a7f3d0',
                      marginBottom: '4px',
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}>DOCUMENT VERIFIED</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6ee7b7',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>This hash is permanently recorded on the blockchain</p>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.5))',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#ecfdf5',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                }}>
                  VALID
                </div>
              </div>

              {/* Holographic QR section */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.5)',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, transparent 45%, rgba(129, 140, 248, 0.1) 50%, transparent 55%)',
                  animation: 'shine 6s infinite linear',
                  opacity: 0.2
                }} />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }}>
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Verification QR Code" 
                        style={{
                          width: '180px',
                          height: '180px',
                          display: 'block',
                          imageRendering: 'crisp-edges'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '180px',
                        height: '180px',
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: '12px'
                      }}>
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#e2e8f0',
                      marginBottom: '12px',
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}>
                      <span style={{ color: '#818cf8' }}>◈</span> INSTANT VERIFICATION <span style={{ color: '#818cf8' }}>◈</span>
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: '#cbd5e1',
                      marginBottom: '20px',
                      maxWidth: '500px',
                      lineHeight: '1.6'
                    }}>
                      Scan this holographic QR code to verify this document's authenticity anytime. 
                      The code contains a direct link to these verification results on the blockchain.
                    </p>
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      boxShadow: 'inset 0 0 10px rgba(99, 102, 241, 0.1)',
                      margin: '0 auto',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      <p style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: '12px',
                        color: '#a5b4fc',
                        wordBreak: 'break-all',
                        textAlign: 'center'
                      }}>
                        {`${window.location.origin}/verify?hash=${result.fileHash}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cyber download button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '18px 36px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#f8fafc',
                    background: 'linear-gradient(145deg, #7c3aed, #4f46e5)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 5px 25px rgba(79, 70, 229, 0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.3) 50%, transparent 55%)',
                    animation: 'shine 3s infinite linear',
                    transform: 'rotate(30deg)',
                    opacity: 0.7
                  }} />
                  <span style={{ position: 'relative' }}>
                    Download Blockchain Certificate
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cyber footer */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#94a3b8',
        position: 'relative',
        padding: '20px 0',
        borderTop: '1px solid rgba(100, 116, 139, 0.3)'
      }}>
        <p style={{
          margin: 0,
          fontWeight: '500',
          letterSpacing: '1px'
        }}>
          <span style={{ color: '#818cf8', fontWeight: '700' }}>BLOCKCHAIN NOTARY SERVICE</span> • POWERED BY ETHEREUM
        </p>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
  (Running on BuildBear Testnet)
</div>
      </div>
    </div>

    {/* Global animations */}
    <style>{`
      @keyframes shine {
        to {
          transform: translateX(100%) rotate(30deg);
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0) translateX(0);
        }
        50% {
          transform: translateY(-20px) translateX(10px);
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulseError {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `}</style>
  </div>
);
}