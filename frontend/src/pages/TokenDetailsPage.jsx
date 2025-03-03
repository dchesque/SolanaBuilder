// src/pages/TokenDetailsPage.jsx
// Token Details Page Component
// This component displays detailed information about a specific token, including its name, ticker, total supply, and token address.
// It also provides action buttons to view the token on Solscan, update its metadata, and generate a PDF with token details.

import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { 
  Coins,
  Copy,
  ExternalLink,
  RefreshCcw,
  FileEdit,
  Droplet,
  Edit2,
  Send,
  Lock,
  Users,
  List,
  Download,
  ArrowRight
} from "lucide-react";
import TokenDetailsPDFGenerator from '../components/pdf/TokenDetailsPDFGenerator';

const TokenDetailsPage = () => {
  // Retrieve token data passed via location state
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenAddress = "", tokenName = "Token", ticker = "TICK", supply = 0 } = location.state || {};

  // Function to copy token address to the clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenAddress);
    alert("Token address copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#0B0120]">
      {/* Background Gradients */}
      <div className="fixed inset-0">
        <div className="absolute -top-1/4 -left-1/4 w-2/3 h-1/2 bg-purple-900/40 rounded-full blur-[120px]" />
        <div className="absolute -top-1/4 right-0 w-2/4 h-2/3 bg-pink-900/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-purple-800/30 rounded-full blur-[160px]" />
      </div>

      {/* Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                {/* Solana Builder Logo */}
                <div className="flex items-center">
                  <img src="/img/logo_solanabuilder.png" alt="Solana Builder" className="h-7" />
                </div>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/token-creator"
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              Return to App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative pt-32 pb-20 px-4 text-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-500/30 text-sm text-green-300 mb-6 hover:bg-green-900/40 transition-all shadow-lg shadow-green-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
            <span className="font-medium">Token Successfully Created</span>
          </div>

          {/* Token Title */}
          <h1 className="text-4xl font-bold mb-8 leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            {tokenName} Token Details
          </h1>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Token Information */}
            <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-purple-300 block mb-2">Token Name</span>
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <span className="text-white">{tokenName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-purple-300 block mb-2">Token Ticker</span>
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <span className="text-white">{ticker}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-purple-300 block mb-2">Total Supply</span>
                <div className="bg-purple-900/30 p-3 rounded-lg">
                  <span className="text-white">{supply.toLocaleString()} Tokens</span>
                </div>
              </div>
              
              <div>
                <span className="text-purple-300 block mb-2">Token Address</span>
                <div className="bg-purple-900/30 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-white font-mono">
                    {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-10)}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Action Buttons */}
            <div className="space-y-4">
              <a
                href={`https://solscan.io/token/${tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-4 flex items-center justify-center gap-2 hover:bg-purple-900/30 transition-all"
              >
                <ExternalLink className="w-5 h-5 text-purple-400" />
                <span className="text-purple-200">View on Solscan</span>
              </a>

              <Link
                to="/update-metadata"
                state={{ tokenAddress, tokenName, ticker }}
                className="w-full bg-blue-900/20 backdrop-blur-md rounded-xl border border-blue-500/20 p-4 flex items-center justify-center gap-2 hover:bg-blue-900/30 transition-all"
              >
                <FileEdit className="w-5 h-5 text-blue-400" />
                <span className="text-purple-200">Update Metadata</span>
              </Link>

              <TokenDetailsPDFGenerator 
                tokenData={{
                  name: tokenName,
                  symbol: ticker,
                  mintAddress: tokenAddress,
                  supply: supply
                }}
              />
            </div>
          </div>

          {/* Token Possibilities */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">Token Possibilities</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Token Transfers */}
              <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <Send className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold text-purple-200">Token Transfers</h3>
                  </div>
                  <p className="text-sm text-purple-300 mb-4">
                    Send tokens to other wallets or use in decentralized applications.
                  </p>
                </div>
                <a 
                  href={`https://solscan.io/token/${tokenAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline flex items-center self-start"
                >
                  View Token Details <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>

              {/* Create Liquidity Pool */}
              <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <Droplet className="w-6 h-6 text-blue-400 mr-3" />
                    <h3 className="text-lg font-semibold text-purple-200">Create Liquidity Pool</h3>
                  </div>
                  <p className="text-sm text-purple-300 mb-4">
                    Enhance token accessibility by creating liquidity pools on DEXs like Raydium or Orca.
                  </p>
                </div>
                <a 
                  href="https://raydium.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center self-start"
                >
                  Create Pool <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>

              {/* Create Staking Program */}
              <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <Lock className="w-6 h-6 text-yellow-400 mr-3" />
                    <h3 className="text-lg font-semibold text-purple-200">Create Staking Program</h3>
                  </div>
                  <p className="text-sm text-purple-300 mb-4">
                    Incentivize holding by creating a staking mechanism for your token.
                  </p>
                </div>
                <Link 
                  to="/staking-setup" 
                  className="text-yellow-400 hover:underline flex items-center self-start"
                >
                  Setup Staking <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Customize Token Metadata */}
              <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <Edit2 className="w-6 h-6 text-green-400 mr-3" />
                    <h3 className="text-lg font-semibold text-purple-200">Customize Token Metadata</h3>
                  </div>
                  <p className="text-sm text-purple-300 mb-4">
                    Add logo, description, and social links to make your token more attractive.
                  </p>
                </div>
                <Link 
                  to="/update-metadata"
                  state={{ tokenAddress, tokenName, ticker }}
                  className="text-green-400 hover:underline flex items-center self-start"
                >
                  Update Metadata <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative bg-black/30 backdrop-blur-md border-t border-purple-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-purple-400">
            <div>© 2025 Solana Builder. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TokenDetailsPage;
