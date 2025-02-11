// Atualização de CreateTokenPage.js
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";

// Importe seus componentes conforme a estrutura do projeto
import WalletConnect from "../components/WalletConnect";
import WalletInfo from "../components/WalletInfo";
import CostEstimate from "../components/CostEstimate";
import CreateTokenForm from "../components/CreateTokenForm";

function TokenCreatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black animate-gradient flex flex-col text-white">
      {/* HEADER */}
      <header className="bg-black/50 border-b border-purple-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo / Nome */}
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-pink-400" />
            <span className="text-2xl font-bold text-pink-400">SolanaMint</span>
          </div>

          {/* Botão de conexão + Infos da carteira */}
          <div className="flex items-center gap-6">
            <WalletConnect />
            <WalletInfo />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center p-4">
        {/* Card principal */}
        <CreateTokenForm />
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

export default TokenCreatorPage;
