// Modificação no App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TokenCreatorPage from "./pages/TokenCreatorPage";
import TokenDetailsPage from "./pages/TokenDetailsPage";
import UpdateMetadataPage from "./pages/UpdateMetadataPage";
import UserTokensPage from "./pages/UserTokensPage";
import AdminPage from "./pages/AdminPage";
import { useWallet } from "@solana/wallet-adapter-react";
import "./global-overrides.css";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<LandingPage />} />

        {/* Página de criação de tokens */}
        <Route path="/token-creator" element={<TokenCreatorPage />} />

        {/* Página com os detalhes do token criado */}
        <Route path="/token-details" element={<TokenDetailsPage />} />

        {/* Rota para atualização de metadados */}
        <Route path="/update-metadata" element={<UpdateMetadataPage />} />

        {/* Rota para lista de tokens do usuário */}
        <Route path="/my-tokens" element={<UserTokensPage />} />
        
        {/* Rota para admin - não protegida inicialmente para permitir a tela de login */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;