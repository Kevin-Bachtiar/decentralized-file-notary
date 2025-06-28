import { useState } from "react";
import ConnectWallet from "./ConnectWallet";
import NotarizationPage from "./NotarizationPage";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return isConnected ? (
    <NotarizationPage />
  ) : (
    <ConnectWallet onConnected={() => setIsConnected(true)} />
  );
}

export default App;
