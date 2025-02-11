// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TokenCreatorPage from "./pages/TokenCreatorPage";
import TokenDetailsPage from "./pages/TokenDetailsPage";
import MyTokensPage from "./pages/MyTokensPage";
import ReactDOM from "react-dom/client";
import "./global-overrides.css"; // seu CSS de overrides
import "./index.css";  // Import que injeta o Tailwind

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

        {/* Página para listar todos os tokens que a carteira possui */}
        <Route path="/my-tokens" element={<MyTokensPage />} />
      </Routes>
    </Router>
  );
}

export default App;
