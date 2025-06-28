import { useEffect, useState } from "react";

const BUILDBEAR_CHAIN_ID = "0x68d7"; // 26839 in hex

export default function ConnectWallet({ onConnected }) {
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask tidak ditemukan. Silakan install terlebih dahulu.");
      return;
    }

    setIsConnecting(true);
    try {
      // Minta akses ke akun
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Ganti jaringan ke BuildBear jika belum sesuai
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChainId !== BUILDBEAR_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BUILDBEAR_CHAIN_ID }],
          });
        } catch (switchError) {
          // Jika jaringan belum terdaftar, tambahkan jaringan BuildBear
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: BUILDBEAR_CHAIN_ID,
                    chainName: "BuildBear",
                    rpcUrls: ["https://rpc.buildbear.io/exclusive-carnage-12b2998f"],
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://rpc.buildbear.io/exclusive-carnage-12b2998f"],
                  },
                ],
              });
            } catch (addError) {
              setError("Gagal menambahkan jaringan BuildBear.");
              return;
            }
          } else {
            setError("Gagal switch ke jaringan BuildBear.");
            return;
          }
        }
      }

      onConnected(); // Beri tahu App.js bahwa wallet sudah terkoneksi
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyambungkan wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f23 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
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
      top: '-160px',
      right: '-160px',
      width: '320px',
      height: '320px',
      background: 'radial-gradient(circle, rgba(139, 69, 255, 0.4) 0%, rgba(139, 69, 255, 0.1) 70%, transparent 100%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 4s ease-in-out infinite'
    },
    
    floatingOrb2: {
      position: 'absolute',
      bottom: '-160px',
      left: '-160px',
      width: '320px',
      height: '320px',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'pulse 4s ease-in-out infinite 2s'
    },
    
    floatingOrb3: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '240px',
      height: '240px',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.05) 70%, transparent 100%)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'pulse 4s ease-in-out infinite 1s'
    },
    
    mainCard: {
      position: 'relative',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '0',
      maxWidth: '420px',
      width: '100%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(139, 69, 255, 0.1)',
      overflow: 'hidden'
    },
    
    cardGlow: {
      position: 'absolute',
      inset: '-2px',
      background: 'linear-gradient(45deg, rgba(139, 69, 255, 0.3), rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))',
      borderRadius: '26px',
      filter: 'blur(20px)',
      opacity: 0.3,
      zIndex: -1,
      animation: 'glow 3s ease-in-out infinite alternate'
    },
    
    cardInner: {
      position: 'relative',
      background: 'rgba(15, 15, 35, 0.8)',
      borderRadius: '24px',
      padding: '40px 32px',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    
    iconContainer: {
      position: 'relative',
      marginBottom: '20px'
    },
    
    icon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #8b45ff 0%, #3b82f6 100%)',
      borderRadius: '20px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(139, 69, 255, 0.3)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    
    iconHover: {
      transform: 'scale(1.1) rotate(5deg)',
      boxShadow: '0 15px 40px rgba(139, 69, 255, 0.5)'
    },
    
    statusDot: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '24px',
      height: '24px',
      background: '#10b981',
      borderRadius: '50%',
      border: '3px solid rgba(15, 15, 35, 0.8)',
      animation: 'ping 2s infinite'
    },
    
    title: {
      fontSize: '32px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    
    subtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '14px',
      fontWeight: '400'
    },
    
    connectButton: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #8b45ff 0%, #3b82f6 50%, #6366f1 100%)',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
      padding: '16px 24px',
      borderRadius: '16px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '24px',
      boxShadow: '0 10px 25px rgba(139, 69, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    
    connectButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 35px rgba(139, 69, 255, 0.4)'
    },
    
    connectButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none'
    },
    
    buttonGlow: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #8b45ff, #3b82f6, #6366f1)',
      borderRadius: '16px',
      filter: 'blur(20px)',
      opacity: 0.5,
      transition: 'opacity 0.3s ease',
      zIndex: -1
    },
    
    buttonGlowHover: {
      opacity: 0.8
    },
    
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    
    errorContainer: {
      marginTop: '24px',
      padding: '16px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      animation: 'shake 0.5s ease-in-out'
    },
    
    errorContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px'
    },
    
    errorText: {
      color: '#fca5a5',
      fontSize: '14px',
      fontWeight: '500',
      margin: 0,
      lineHeight: '1.4'
    },
    
    networkInfo: {
      marginTop: '24px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    
    networkHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    
    networkStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    networkDot: {
      width: '8px',
      height: '8px',
      background: 'linear-gradient(135deg, #8b45ff, #3b82f6)',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    
    networkName: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    chainId: {
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '12px'
    },
    
    securityBadge: {
      marginTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '12px'
    }
  };

  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        width: '2px',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${3 + Math.random() * 4}s linear infinite ${Math.random() * 5}s`
      }}
    />
  ));

  const [isHovered, setIsHovered] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);

  return (
    <div style={styles.container}>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          @keyframes glow {
            0% { opacity: 0.3; }
            100% { opacity: 0.6; }
          }
          
          @keyframes ping {
            0% { transform: scale(1); opacity: 1; }
            75%, 100% { transform: scale(1.5); opacity: 0; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            33% { transform: translateY(-20px) rotate(120deg); opacity: 0.6; }
            66% { transform: translateY(10px) rotate(240deg); opacity: 0.4; }
          }
        `}
      </style>

      {/* Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.floatingOrb1}></div>
        <div style={styles.floatingOrb2}></div>
        <div style={styles.floatingOrb3}></div>
        {particles}
      </div>

      {/* Main Card */}
      <div style={styles.mainCard}>
        <div style={styles.cardGlow}></div>
        
        <div style={styles.cardInner}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <div 
                style={{
                  ...styles.icon,
                  ...(iconHovered ? styles.iconHover : {})
                }}
                onMouseEnter={() => setIconHovered(true)}
                onMouseLeave={() => setIconHovered(false)}
              >
                <svg width="40" height="40" fill="white" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={styles.statusDot}></div>
            </div>
            
            <h2 style={styles.title}>Connect Wallet</h2>
            <p style={styles.subtitle}>Secure connection to BuildBear Network</p>
          </div>

          {/* Connect Button */}
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              ...styles.connectButton,
              ...(isHovered && !isConnecting ? styles.connectButtonHover : {}),
              ...(isConnecting ? styles.connectButtonDisabled : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div style={{
              ...styles.buttonGlow,
              ...(isHovered ? styles.buttonGlowHover : {})
            }}></div>
            
            {isConnecting ? (
              <>
                <div style={styles.spinner}></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div style={styles.errorContainer}>
              <div style={styles.errorContent}>
                <svg width="20" height="20" fill="none" stroke="#fca5a5" viewBox="0 0 24 24" style={{flexShrink: 0, marginTop: '1px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p style={styles.errorText}>{error}</p>
              </div>
            </div>
          )}

          {/* Network Info */}
          <div style={styles.networkInfo}>
            <div style={styles.networkHeader}>
              <div style={styles.networkStatus}>
                <div style={styles.networkDot}></div>
                <span style={styles.networkName}>BuildBear Network</span>
              </div>
              <div style={styles.chainId}>Chain ID: 26839</div>
            </div>
            
            <div style={styles.securityBadge}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secured by MetaMask</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}