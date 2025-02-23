import React, { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { MINT_SIZE } from "@solana/spl-token";
import { Coins } from "lucide-react";

const CostEstimate = ({ step = 1 }) => {
  const { connection } = useConnection();
  const [solPrice, setSolPrice] = useState(null);
  const [rentValues, setRentValues] = useState({
    mintAccount: 0,
    ataAccount: 0,
    metadataAccount: 0.01512
  });
  const [isLoading, setIsLoading] = useState(true);

  const serviceFee = parseFloat(process.env.REACT_APP_SERVICE_FEE) || 0.001;
  const networkFee = 0.000008;

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

  const calculateRentExemptions = async () => {
    try {
      setIsLoading(true);
      
      const mintAccountRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      const ataAccountRent = await connection.getMinimumBalanceForRentExemption(165);
      
      setRentValues(prev => ({
        ...prev,
        mintAccount: mintAccountRent / 1_000_000_000,
        ataAccount: ataAccountRent / 1_000_000_000
      }));
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error calculating rent exemptions:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolPrice();
    calculateRentExemptions();
    
    const interval = setInterval(fetchSolPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotalCosts = () => {
    const totalNetworkFees = networkFee * 3;
    const totalRent = rentValues.mintAccount + rentValues.ataAccount + rentValues.metadataAccount;
    return serviceFee + totalRent + totalNetworkFees;
  };

  const totalCost = calculateTotalCosts();
  const totalUsdCost = solPrice ? totalCost * solPrice : null;

  const formatSol = (value) => value.toFixed(6);
  const formatUsd = (value) => value.toFixed(2);

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-purple-500/20">
          <Coins className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="text-purple-200 font-medium">Cost Estimate</h3>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-12 text-sm text-purple-300">
          <div className="w-4 h-4 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin mr-2"></div>
          Calculating costs...
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2">
          <span className="text-purple-300">Total Cost:</span>
          <div className="text-right">
            <div className="text-white font-semibold text-lg">{formatSol(totalCost)} SOL</div>
            {solPrice && (
              <div className="text-purple-300/80 text-xs">
                ≈ ${formatUsd(totalUsdCost)} USD
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostEstimate;