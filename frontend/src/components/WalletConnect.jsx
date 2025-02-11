// src/components/WalletConnect.jsx
import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletConnect = () => {
  const { connected } = useWallet();

  return (
    <WalletMultiButton
      className="
        !py-2
        !px-5
        !rounded-md
        !bg-gradient-to-r
        !from-purple-500
        !to-pink-500
        !hover:from-purple-600
        !hover:to-pink-600
        !text-white
        !font-bold
        !shadow-lg
        !hover:shadow-xl
        !transition
      "
    >
      {/* Se a carteira estiver conectada, mostra a bolinha verde + texto. Caso contrário, apenas “Connect Wallet”. */}
      {connected ? (
        <div className="flex items-center gap-2">
          {/* Bolinha com efeito pulsante (Tailwind animate-ping) */}
          
          <span>Wallet Connected</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      ) : (
        "Connect Wallet"
      )}
    </WalletMultiButton>
  );
};

export default WalletConnect;
