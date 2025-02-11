import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const WalletInfo = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);

  // Friendly name for the network
  const NETWORK_DISPLAY_NAME = "Solana Mainnet";

  useEffect(() => {
    if (publicKey) {
      connection
        .getBalance(publicKey)
        .then((lamports) => {
          setBalance(lamports / LAMPORTS_PER_SOL);
        })
        .catch((err) => console.error("Error fetching balance:", err));
    }
  }, [publicKey, connection]);

  // If the wallet is not connected, do not display anything
  if (!publicKey) return null;

  return (
    <div className="flex items-center gap-4 text-sm">
      <p className="text-purple-300">
        Network: <span className="text-white">{NETWORK_DISPLAY_NAME}</span>
      </p>
      <p className="text-purple-300">
        Balance:{" "}
        <span className="text-white">
          {balance !== null ? `${balance} SOL` : "Loading..."}
        </span>
      </p>
    </div>
  );
};

export default WalletInfo;
