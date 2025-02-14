import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnect from "../components/WalletConnect";
import WalletInfo from "../components/WalletInfo";
import CreateTokenForm from "../components/CreateTokenForm";

import { 
  Coins, 
  ArrowRight, 
  Shield, 
  FileEdit, 
  LayoutGrid 
} from "lucide-react";

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-2 text-sm bg-black/90 text-white rounded-lg -top-2 left-full ml-2">
          {text}
        </div>
      )}
    </div>
  );
};

function TokenCreatorPage() {
  return (
    <div className="min-h-screen bg-[#0B0120] text-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SolanaMint
            </span>
          </Link>

          {/* Wallet Area */}
          <div className="flex items-center gap-4">
            <WalletConnect />
            <WalletInfo />
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-32 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-pink-900/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0120] via-transparent to-transparent" />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Information */}
            <div>
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm text-purple-300 mb-6 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
                <span className="font-medium">Ready to Create Your Token</span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              Create Your Solana Token or MemeCoin in Seconds

              </h1>

              {/* Description */}
              <p className="text-xl text-purple-200/90 mb-8 leading-relaxed">
                Whether you're launching the next viral memecoin or creating a serious project token, 
                we make it easy on Solana. No coding needed – just customize, deploy, and watch your token moon! 🚀
              </p>

  {/* Stats - Métricas menores e mais 2 métricas */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                <div className="group bg-purple-900/10 backdrop-blur-sm px-2 py-1.5 rounded-lg hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                  <div className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transform transition-all">
                    {"<1 MIN"}
                  </div>
                  <div className="text-[10px] font-medium text-purple-300/80">
                    Creation Time
                  </div>
                </div>
                
                <div className="group bg-purple-900/10 backdrop-blur-sm px-2 py-1.5 rounded-lg hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                  <div className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transform transition-all">
                    {"<0.05 SOL"}
                  </div>
                  <div className="text-[10px] font-medium text-purple-300/80">
                    Total Fees
                  </div>
                </div>

                <div className="group bg-purple-900/10 backdrop-blur-sm px-2 py-1.5 rounded-lg hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                  <div className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transform transition-all">
                    {"1000+"}
                  </div>
                  <div className="text-[10px] font-medium text-purple-300/80">
                    Tokens Created
                  </div>
                </div>

                <div className="group bg-purple-900/10 backdrop-blur-sm px-2 py-1.5 rounded-lg hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                  <div className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transform transition-all">
                    {"100%"}
                  </div>
                  <div className="text-[10px] font-medium text-purple-300/80">
                    Success Rate
                  </div>
                </div>
              </div>


              {/* Mini Tutorial */}

              <div className="space-y-1 mb-2 ">
                <h3 className="text-lg font-semibold text-purple-300 mb-2leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  How to Create Your Own Solana Token:
                  </h3>
              </div>
              <div className="mb-10">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-purple-400">1</span>
                    </div>
                    <span className="text-purple-200">Connect Wallet</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-purple-400">2</span>
                    </div>
                    <span className="text-purple-200">Configure Token</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-purple-400">3</span>
                    </div>
                    <span className="text-purple-200">Review & Confirm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-purple-400">4</span>
                    </div>
                    <span className="text-purple-200">Deploy on Solana</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Tooltip text="Update your token's metadata, logo, and social links">
                  <Link 
                    to="/update-metadata"
                    className="group flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                  >
                    <FileEdit className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-purple-200">Update Token Details</span>
                  </Link>
                </Tooltip>

                <Tooltip text="View and manage all your created tokens">
                  <Link 
                    to="/my-tokens"
                    className="group flex items-center justify-center gap-2 px-6 py-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                  >
                    <LayoutGrid className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="text-purple-200">Manage My Tokens</span>
                  </Link>
                </Tooltip>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-400">Secure & Verified</div>
                  <div className="text-xs text-green-500/80">All transactions are verified on Solana blockchain</div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-8">
              <CreateTokenForm />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-purple-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-purple-400">
            <div>© 2025 SolanaMint. All rights reserved.</div>
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
}

export default TokenCreatorPage;