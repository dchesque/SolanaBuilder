// WalletInfo.jsx
import React, { useEffect, useState } from "react"; 
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";

const WalletInfo = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();

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

  // Se a wallet não estiver conectada, não exibe nada
  if (!publicKey) return null;

  // Função para abreviar o endereço da wallet (ex: "5A3d...F6B9")
  const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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
      <p className="text-purple-300">
        Address:{" "}
        <span className="text-white font-mono">
          {shortenAddress(publicKey.toBase58())}
        </span>
      </p>
      {/* Botão My Tokens */}
      <button
        onClick={() => navigate("/my-tokens")}
        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
      >
        My Tokens
      </button>
    </div>
  );
};

export default WalletInfo;
