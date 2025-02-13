// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./global-overrides.css"; // seu CSS de overrides
import './index.css';  // Import que injeta o Tailwind
import './polyfills';


import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';


window.process = { env: { NODE_ENV: process.env.NODE_ENV } };

// Endpoint do QuickNode
const network = "https://patient-empty-dust.solana-mainnet.quiknode.pro/b60b8f6153e897dba8fdfad2f597131dc4ae8a99/";

// Exibição amigável no frontend
const networkDisplayName = "Solana Mainnet";

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App networkDisplayName={networkDisplayName} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
