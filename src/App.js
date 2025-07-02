import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import ConnectWallet from "./ConnectWallet";
import NotarizationPage from "./NotarizationPage";
import PublicVerifyPage from "./PublicVerifyPage";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isConnected ? (
              <Navigate to="/notarize" />
            ) : (
              <ConnectWallet onConnected={() => setIsConnected(true)} />
            )
          }
        />
        <Route
          path="/notarize"
          element={
            isConnected ? <NotarizationPage /> : <Navigate to="/" />
          }
        />
        <Route path="/verify" element={<PublicVerifyPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
