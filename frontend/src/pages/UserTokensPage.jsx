import React from "react";
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import WalletConnect from "../components/WalletConnect";
import WalletInfo from "../components/WalletInfo";
import UserTokensList from "../components/UserTokensList";

function UserTokensPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black animate-gradient flex flex-col text-white">
      {/* HEADER */}
      <header className="bg-black/50 border-b border-purple-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-pink-400" />
            <span className="text-2xl font-bold text-pink-400">SolanaMint</span>
          </div>

          <div className="flex items-center gap-6">
            <WalletConnect />
            <WalletInfo />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-pink-300">Your Tokens</h1>
            <Link 
              to="/token-creator" 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-500 hover:to-pink-500 transition"
            >
              Create New Token
            </Link>
          </div>
          <UserTokensList />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black/50 border-t border-purple-500/20 px-6 py-6 text-center text-sm">
        <div className="flex items-center justify-center gap-4">
          <Link to="/terms" className="hover:text-pink-200 transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-pink-200 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/contact" className="hover:text-pink-200 transition-colors">
            Contact
          </Link>
        </div>
        <p className="text-purple-300 mt-4">&copy; 2025 SolanaMint. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UserTokensPage;