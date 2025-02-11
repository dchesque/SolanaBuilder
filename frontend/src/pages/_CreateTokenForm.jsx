// CreateTokenForm.js
import React, { useState } from "react";
import { ArrowRight } from "lucide-react"; // Ou outro ícone que você prefira
import CostEstimate from "./CostEstimate";

function CreateTokenForm() {
  const [nomeToken, setNomeToken] = useState("");
  const [ticker, setTicker] = useState("");
  const [supply, setSupply] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Criando token:", { nomeToken, ticker, supply });
    // ... lógica de criação de token ...
  };

  return (
    <div className="max-w-md w-full mx-auto bg-[#1a012c] bg-opacity-90 rounded-xl p-6 shadow-xl border border-[#512d5a] animate-fadeIn">
      {/* Título */}
      <h1 className="text-2xl font-bold mb-4 text-pink-300 text-center">
        Create Solana Token
      </h1>

      {/* Bloco de custo estimado */}
      <div className="mb-6 bg-[#2b1740] bg-opacity-50 rounded-lg p-4 border border-[#6e3d76] shadow-sm text-center">
        <CostEstimate />
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome do token */}
        <div>
          <label className="block text-sm mb-1 text-pink-200">
            Token Name
          </label>
          <input
            type="text"
            placeholder="Ex: My Awesome Token"
            value={nomeToken}
            onChange={(e) => setNomeToken(e.target.value)}
            className="w-full rounded-md bg-[#11001c] border border-[#3b2153] px-3 py-2 text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
          />
        </div>

        {/* Ticker */}
        <div>
          <label className="block text-sm mb-1 text-pink-200">Ticker</label>
          <input
            type="text"
            placeholder="Ex: MAT"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full rounded-md bg-[#11001c] border border-[#3b2153] px-3 py-2 text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
          />
        </div>

        {/* Supply */}
        <div>
          <label className="block text-sm mb-1 text-pink-200">Supply</label>
          <input
            type="number"
            placeholder="Ex: 1000000"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            className="w-full rounded-md bg-[#11001c] border border-[#3b2153] px-3 py-2 text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
          />
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition shadow-md"
        >
          Create Token <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default CreateTokenForm;
