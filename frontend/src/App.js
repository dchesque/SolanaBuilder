// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TokenCreatorPage from "./pages/TokenCreatorPage";
import ReactDOM from 'react-dom/client';
import "./global-overrides.css"; // seu CSS de overrides
import './index.css';  // Import que injeta o Tailwind



function App() {
  return (
    <Router>
      <Routes>
        {/* Rota raiz (página inicial) */}
        <Route path="/" element={<LandingPage />} />

        {/* Rota para a página de criação de tokens */}
        <Route path="/token-creator" element={<TokenCreatorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
