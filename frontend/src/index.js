// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./global-overrides.css"; // CSS overrides
import './index.css';  // Tailwind CSS injection
import './polyfills';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// Set process for environment variables
window.process = { env: { NODE_ENV: process.env.NODE_ENV } };

// QuickNode endpoint (Solana RPC)
const network = "https://patient-empty-dust.solana-mainnet.quiknode.pro/b60b8f6153e897dba8fdfad2f597131dc4ae8a99/";

// User-friendly display name for the network
const networkDisplayName = "Solana Mainnet";

// Custom wallet adapter configurations
// This setup is required for proper signAndSendTransaction method support
const phantomWalletAdapter = new PhantomWalletAdapter({
  appName: "Solana Builder",
  network: network
});

const solflareWalletAdapter = new SolflareWalletAdapter({ 
  network: network 
});

// Array of supported wallet adapters
const wallets = [
  phantomWalletAdapter,
  solflareWalletAdapter
];

// Wallet provider configuration with error handling
const walletProviderConfig = {
  wallets,
  autoConnect: true,
  onError: (error) => {
    console.error('Wallet error:', error);
    // You can implement more sophisticated error handling here,
    // such as displaying a toast or notification to the user
    
    // Example of error type identification
    if (error.name === 'WalletSignTransactionError') {
      console.warn('Transaction was rejected by the user');
    } else if (error.name === 'WalletConnectionError') {
      console.warn('Error connecting to wallet. Please try again.');
    }
  }
};

// Render application with wallet and connection providers
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider {...walletProviderConfig}>
        <WalletModalProvider>
          <App networkDisplayName={networkDisplayName} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);