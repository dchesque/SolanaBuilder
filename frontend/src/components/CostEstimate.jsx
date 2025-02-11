import React, { useEffect, useState } from "react";

const CostEstimate = () => {
  const [solPrice, setSolPrice] = useState(null);

  // Obtém o valor base do .env e converte para número
  const fixedCostFromEnv = parseFloat(process.env.REACT_APP_SERVICE_FEE) || 0.01000;

  // Soma 0.0038 SOL ao valor do .env
  const totalCostSol = fixedCostFromEnv + 0.0038;

  // Função para buscar a cotação do SOL em USD
  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error("Error fetching SOL price:", error);
      setSolPrice(null);
    }
  };

  useEffect(() => {
    fetchSolPrice();
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <p className="text-purple-300">Estimated cost:</p>
      <p className="font-semibold text-white">{totalCostSol.toFixed(5)} SOL</p>
      {solPrice !== null ? (
        <p className="text-purple-300">~ ${(totalCostSol * solPrice).toFixed(2)} USD</p>
      ) : (
        <p className="text-purple-300">Calculating USD value...</p>
      )}
    </div>
  );
};

export default CostEstimate;
