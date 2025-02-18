import React from "react";
import { Link } from "react-router-dom";
import { 
  Coins, 
  LogOut, 
  LayoutGrid, 
  FileEdit,
  Plus,
  Wallet,
  Sparkles
} from "lucide-react";
import WalletConnect from "../components/WalletConnect";
import WalletInfo from "../components/WalletInfo";
import UserTokensList from "../components/UserTokensList";
import { useWallet } from "@solana/wallet-adapter-react";

export default function UserTokensPage() {
  const { publicKey, disconnect } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Background base */}
      <div className="fixed inset-0 bg-[#0B0120]" />
      
      {/* Gradientes abstratos */}
      <div className="fixed inset-0">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-purple-900/30 rounded-full blur-[120px]" />
        <div className="absolute -top-1/4 right-0 w-2/3 h-3/4 bg-pink-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-3/4 h-3/4 bg-purple-800/20 rounded-full blur-[130px]" />
      </div>
      
      {/* Pattern overlay */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-[#0B0120]/80 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SolanaMint
            </span>
          </Link>
        </div>
      </header>

      {/* Sub-header - WalletInfo */}
      {publicKey && (
        <div className="fixed top-16 left-0 right-0 bg-[#1D0F35]/80 backdrop-blur-md border-b border-purple-500/20 py-3 px-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-purple-300">Network:</span>
                <span className="text-sm text-white">Solana Mainnet</span>
              </div>
              <div className="w-px h-4 bg-purple-500/20" />
              <div className="flex items-center gap-4">
                <span className="text-sm text-purple-300">Balance:</span>
                <span className="text-sm text-white">0 SOL</span>
              </div>
              <div className="w-px h-4 bg-purple-500/20" />
              <div className="flex items-center gap-4">
                <span className="text-sm text-purple-300">Address:</span>
                <span className="text-sm text-white font-mono">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/token-creator"
                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Token
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
          {/* Title Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm text-purple-300 mb-6 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
              <span className="font-medium">Your Token Collection</span>
            </div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Manage Your Tokens
            </h1>
            <p className="text-xl text-purple-200/90">
              View and manage all your created tokens in one place. Update information, execute functions, and monitor your tokens.
            </p>
          </div>

          {!publicKey ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Wallet className="w-16 h-16 text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Connect Your Wallet
              </h2>
              <p className="text-center text-sm text-purple-200/80 mb-8 max-w-md">
                Connect your Solana wallet to view and manage your tokens.
              </p>
              <WalletConnect className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25" />
            </div>
          ) : (
            <UserTokensList />
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative bg-black/30 backdrop-blur-md border-t border-purple-500/20 py-8 px-4">
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