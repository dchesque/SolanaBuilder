// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TokenCreatorPage from "./pages/TokenCreatorPage";
import TokenDetailsPage from "./pages/TokenDetailsPage";
import UpdateMetadataPage from "./pages/UpdateMetadataPage";  // Caminho atualizado
import UserTokensPage from "./pages/UserTokensPage";  // Nova importação
import ReactDOM from "react-dom/client";
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

      </Routes>
    </Router>
  );
}

export default App;