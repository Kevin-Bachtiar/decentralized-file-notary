import { useState } from "react";
import { notarizeFile, verifyDocument } from "./contracts/NotaryInterface";

export default function NotarizationPage() {
  const [fileHash, setFileHash] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileHash("");
  };

  const calculateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) =>
            b.toString(16).padStart(2, "0")
          ).join("");
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setResult("Please select a file first");
      return;
    }

    setIsLoading(true);
    try {
      const hash = await calculateFileHash(selectedFile);
      setFileHash(hash);
      setResult(`File "${selectedFile.name}" hashed successfully: ${hash}`);
    } catch (error) {
      setResult(`Error calculating hash: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotarize = async () => {
    if (!fileHash) {
      setResult("Please upload a file first");
      return;
    }

    setIsLoading(true);
    try {
      await notarizeFile(fileHash);
      setResult(`File successfully notarized with hash: ${fileHash}`);
    } catch (error) {
      setResult(`Notarization failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!fileHash) {
      setResult("Please enter or generate a file hash first");
      return;
    }

    setIsLoading(true);
    try {
      const [timestamp, owner] = await verifyDocument(fileHash);
      setResult(
        `Document verified!\nTimestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()},\nOwner: ${owner}`
      );
    } catch (error) {
      setResult(`Verification failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const [dragActive, setDragActive] = useState(false);
  const [hashInputFocused, setHashInputFocused] = useState(false);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setFileHash("");
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f23 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    backgroundElements: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    },

    floatingOrb1: {
      position: 'absolute',
      top: '-100px',
      right: '-100px',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(139, 69, 255, 0.3) 0%, rgba(139, 69, 255, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'pulse 6s ease-in-out infinite'
    },

    floatingOrb2: {
      position: 'absolute',
      bottom: '-100px',
      left: '-100px',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'pulse 6s ease-in-out infinite 3s'
    },

    mainContent: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '800px',
      margin: '0 auto'
    },

    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },

    title: {
      fontSize: '48px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '12px',
      letterSpacing: '-1px'
    },

    subtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '18px',
      fontWeight: '400',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    },

    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },

    card: {
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
      overflow: 'hidden'
    },

    cardGlow: {
      position: 'absolute',
      inset: '-1px',
      background: 'linear-gradient(45deg, rgba(139, 69, 255, 0.2), rgba(59, 130, 246, 0.2))',
      borderRadius: '21px',
      filter: 'blur(10px)',
      opacity: 0.5,
      zIndex: -1
    },

    cardTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },

    uploadArea: {
      position: 'relative',
      border: `2px dashed ${dragActive ? '#8b45ff' : 'rgba(255, 255, 255, 0.2)'}`,
      borderRadius: '16px',
      padding: '40px 20px',
      textAlign: 'center',
      background: dragActive ? 'rgba(139, 69, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      marginBottom: '20px'
    },

    uploadIcon: {
      width: '48px',
      height: '48px',
      margin: '0 auto 16px',
      background: 'linear-gradient(135deg, #8b45ff, #3b82f6)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease'
    },

    uploadText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '8px'
    },

    uploadSubtext: {
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '14px'
    },

    hiddenInput: {
      display: 'none'
    },

    selectedFile: {
      background: 'rgba(139, 69, 255, 0.1)',
      border: '1px solid rgba(139, 69, 255, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },

    fileIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #8b45ff, #3b82f6)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    fileInfo: {
      flex: 1
    },

    fileName: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },

    fileSize: {
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '12px'
    },

    hashInput: {
      width: '100%',
      background: hashInputFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${hashInputFocused ? 'rgba(139, 69, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      fontSize: '14px',
      fontFamily: 'monospace',
      outline: 'none',
      transition: 'all 0.3s ease',
      marginBottom: '20px',
      boxSizing: 'border-box'
    },

    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },

    button: {
      position: 'relative',
      padding: '14px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflow: 'hidden',
      flex: 1,
      justifyContent: 'center',
      minWidth: '120px'
    },

    primaryButton: {
      background: 'linear-gradient(135deg, #8b45ff, #3b82f6)',
      color: 'white',
      boxShadow: '0 8px 20px rgba(139, 69, 255, 0.3)'
    },

    secondaryButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
    },

    warningButton: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
    },

    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 30px rgba(139, 69, 255, 0.4)'
    },

    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none'
    },

    buttonGlow: {
      position: 'absolute',
      inset: 0,
      background: 'inherit',
      filter: 'blur(15px)',
      opacity: 0.5,
      zIndex: -1
    },

    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    resultCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '24px',
      marginTop: '32px',
      position: 'relative',
      overflow: 'hidden'
    },

    resultHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },

    resultIcon: {
      width: '24px',
      height: '24px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    resultTitle: {
      color: 'white',
      fontSize: '18px',
      fontWeight: '600'
    },

    resultContent: {
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },

    resultText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '14px',
      fontFamily: 'monospace',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      margin: 0
    }
  };

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        width: '2px',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${4 + Math.random() * 6}s linear infinite ${Math.random() * 5}s`
      }}
    />
  ));

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
            33% { transform: translateY(-30px) rotate(120deg); opacity: 0.4; }
            66% { transform: translateY(15px) rotate(240deg); opacity: 0.3; }
          }
          
          .upload-hover:hover .upload-icon {
            transform: scale(1.1) rotate(5deg);
          }
          
          .button-hover:hover {
            transform: translateY(-2px);
          }
          
          .button-hover:active {
            transform: translateY(0px);
          }
        `}
      </style>

      {/* Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.floatingOrb1}></div>
        <div style={styles.floatingOrb2}></div>
        {particles}
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Document Notarization</h1>
          <p style={styles.subtitle}>
            Secure your documents on the blockchain with cryptographic proof of authenticity and timestamp verification
          </p>
        </div>

        {/* Card Grid */}
        <div style={styles.cardGrid}>
          {/* Upload Card */}
          <div style={styles.card}>
            <div style={styles.cardGlow}></div>
            
            <div style={styles.cardTitle}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </div>

            {!selectedFile ? (
              <div 
                style={styles.uploadArea}
                className="upload-hover"
                onClick={() => document.getElementById('file-input').click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div style={styles.uploadIcon} className="upload-icon">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div style={styles.uploadText}>
                  {dragActive ? 'Drop your file here' : 'Click to upload or drag & drop'}
                </div>
                <div style={styles.uploadSubtext}>
                  PDF, DOC, TXT, or any file type
                </div>
              </div>
            ) : (
              <div style={styles.selectedFile}>
                <div style={styles.fileIcon}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div style={styles.fileInfo}>
                  <div style={styles.fileName}>{selectedFile.name}</div>
                  <div style={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#fca5a5'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              style={styles.hiddenInput}
            />

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                ...(!selectedFile || isLoading ? styles.buttonDisabled : {})
              }}
              className="button-hover"
            >
              <div style={styles.buttonGlow}></div>
              {isLoading ? (
                <div style={styles.spinner}></div>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7Z" />
                </svg>
              )}
              {isLoading ? "Calculating..." : "Generate Hash"}
            </button>
          </div>

          {/* Hash Input Card */}
          <div style={styles.card}>
            <div style={styles.cardGlow}></div>
            
            <div style={styles.cardTitle}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Document Hash
            </div>

            <input
              type="text"
              value={fileHash}
              onChange={(e) => setFileHash(e.target.value)}
              placeholder="Enter file hash manually or generate from upload"
              style={styles.hashInput}
              onFocus={() => setHashInputFocused(true)}
              onBlur={() => setHashInputFocused(false)}
            />

            <div style={styles.buttonGroup}>
              <button
                onClick={handleNotarize}
                disabled={!fileHash || isLoading}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(!fileHash || isLoading ? styles.buttonDisabled : {})
                }}
                className="button-hover"
              >
                <div style={styles.buttonGlow}></div>
                {isLoading ? (
                  <div style={styles.spinner}></div>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {isLoading ? "Processing..." : "Notarize"}
              </button>

              <button
                onClick={handleVerify}
                disabled={!fileHash || isLoading}
                style={{
                  ...styles.button,
                  ...styles.warningButton,
                  ...(!fileHash || isLoading ? styles.buttonDisabled : {})
                }}
                className="button-hover"
              >
                <div style={styles.buttonGlow}></div>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div style={styles.resultCard}>
            <div style={styles.cardGlow}></div>
            
            <div style={styles.resultHeader}>
              <div style={styles.resultIcon}>
                <svg width="14" height="14" fill="white" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={styles.resultTitle}>Operation Result</div>
            </div>
            
            <div style={styles.resultContent}>
              <pre style={styles.resultText}>{result}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}