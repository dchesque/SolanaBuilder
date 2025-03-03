// src/pages/TokenCreatorPage.js
// Token Creator Page Component
// This component allows users to create a new Solana token (or MemeCoin).
// It includes background effects, a header with logo, a sub-header with wallet information,
// a tutorial on how to create a token, and action buttons to update token details or manage tokens.

import React from "react";
import { Link } from "react-router-dom";
import WalletInfo from "../components/WalletInfo";
import CreateTokenForm from "../components/CreateTokenForm";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Coins,
  LogOut,
  LayoutGrid,
  FileEdit,
  Shield
} from "lucide-react";

export default function TokenCreatorPage() {
  const { publicKey, disconnect } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Background Base */}
      <div className="fixed inset-0 bg-[#0B0120]" />
      
      {/* Abstract Gradients */}
      <div className="fixed inset-0">
        {/* First Gradient - Top Left */}
        <div className="absolute -top-1/4 -left-1/4 w-2/3 h-1/2 bg-purple-900/40 rounded-full blur-[120px]" /> {/* Changed from /20 to /30 */}
        
        {/* Second Gradient - Top Right */}
        <div className="absolute -top-1/4 right-0 w-2/4 h-2/3 bg-pink-900/30 rounded-full blur-[120px]" /> {/* Changed from /10 to /20 */}
        
        {/* Third Gradient - Center */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-purple-800/30 rounded-full blur-[160px]" /> {/* Changed from /10 to /20 */}
      </div>
      
      {/* Pattern Overlay with Reduced Opacity */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-[#0B0120]/80 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            {/* Solana Builder Logo */}
            <div className="flex items-center">
              <img src="/img/logo_solanabuilder.png" alt="Solana Builder" className="h-7" />
            </div>
          </Link>
        </div>
      </header>

      {/* Sub-header for WalletInfo - Only appears when connected */}
      {publicKey && (
        <div className="fixed top-16 left-0 right-0 bg-[#1D0F35]/80 backdrop-blur-md border-b border-purple-500/20 py-3 px-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <WalletInfo />
            <div className="flex items-center gap-4">
              <Link
                to="/my-tokens"
                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                <LayoutGrid className="w-4 h-4" />
                Manage My Tokens
              </Link>
              
              <Link
                to="/update-metadata"
                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                <FileEdit className="w-4 h-4" />
                Update Token Information
              </Link>

              <button
                onClick={disconnect}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`relative pt-32 ${publicKey ? 'mt-8' : ''} pb-20 px-4 text-white`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Information */}
            <div>
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm text-purple-300 mb-6 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
                <span className="font-medium">Ready to Create Your Token</span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                Launch Your Solana Token or MemeCoin in Seconds
              </h1>

              <h3 className="text-2xl font-bold mb-4 leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                No Code, No Limits!
              </h3>

              {/* Description */}
              <p className="text-xl text-purple-200/90 mb-8 leading-relaxed">
                Turn your idea into reality instantly. Customize, deploy, and dominate the market—effortless and powerful! 🚀
              </p>

              {/* Mini Tutorial */}
              <div className="space-y-1 mb-2">
                <h3 className="text-lg font-semibold text-purple-300 mb-2 leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
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
                <Link 
                  to="/update-metadata"
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  <FileEdit className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-purple-200">Update Token Details</span>
                </Link>

                <Link 
                  to="/my-tokens"
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
                >
                  <LayoutGrid className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-purple-200">Manage My Tokens</span>
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-400">Secure & Verified</div>
                  <div className="text-xs text-green-500/80">
                    All transactions are verified on Solana blockchain
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-8 md:sticky md:top-32">
              <CreateTokenForm />
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
}