import React, { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { MINT_SIZE } from "@solana/spl-token";

const CostEstimate = ({ step = 1 }) => {
  const { connection } = useConnection();
  const [solPrice, setSolPrice] = useState(null);
  const [rentValues, setRentValues] = useState({
    mintAccount: 0,
    ataAccount: 0,
    metadataAccount: 0.01512 // Valor fixo observado nas transações reais
  });
  const [isLoading, setIsLoading] = useState(true);

  // Obtém o valor base do .env e converte para número
  const serviceFee = parseFloat(process.env.REACT_APP_SERVICE_FEE) || 0.001;
  const networkFee = 0.000008; // Taxa de rede aproximada por transação

  // Função para buscar a cotação do SOL em USD
  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error("Erro ao buscar preço do SOL:", error);
      setSolPrice(null);
    }
  };

  // Função para calcular os custos de rent exemption (apenas para mint e ATA)
  const calculateRentExemptions = async () => {
    try {
      setIsLoading(true);
      
      // 1. Rent para a conta do token (Mint Account)
      const mintAccountRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // 2. Rent para a Associated Token Account (ATA)
      const ataAccountRent = await connection.getMinimumBalanceForRentExemption(165); // Tamanho aproximado da ATA
      
      // 3. Rent para a conta de metadados - Usando valor fixo observado nas transações reais
      // Não precisamos calcular, pois estamos usando um valor fixo
      
      setRentValues(prev => ({
        ...prev,
        mintAccount: mintAccountRent / 1_000_000_000, // Convert lamports to SOL
        ataAccount: ataAccountRent / 1_000_000_000
        // Mantemos o valor fixo para metadados
      }));
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao calcular rent exemptions:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolPrice();
    calculateRentExemptions();
    
    // Atualizar o preço do SOL a cada 5 minutos
    const interval = setInterval(fetchSolPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Calcula os custos totais
  const calculateTotalCosts = () => {
    // A forma correta de calcular é somar todos os componentes
    const totalNetworkFees = networkFee * 3; // 3 transações
    const totalRent = rentValues.mintAccount + rentValues.ataAccount + rentValues.metadataAccount;
    
    return serviceFee + totalRent + totalNetworkFees;
  };

  const totalCost = calculateTotalCosts();
  const totalUsdCost = solPrice ? totalCost * solPrice : null;

  // Formatações
  const formatSol = (value) => value.toFixed(6);
  const formatUsd = (value) => value.toFixed(2);

  return (
    <div className="space-y-3">
      <h3 className="text-purple-200 font-medium text-sm mb-2">Estimativa de Custos</h3>
      
      {isLoading ? (
        <div className="flex items-center text-sm text-purple-300">
          <div className="w-4 h-4 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin mr-2"></div>
          Calculando custos...
        </div>
      ) : (
        <div className="space-y-2">
          {/* Etapa 1: Taxa de Serviço */}
          <div className="flex justify-between text-xs">
            <span className="text-purple-300">Taxa de Serviço:</span>
            <span className="text-white font-medium">{formatSol(serviceFee)} SOL</span>
          </div>
          
          {/* Etapa 2: Custos de criação do token */}
          <div className="flex justify-between text-xs">
            <span className="text-purple-300">Rent - Conta do Token:</span>
            <span className="text-white font-medium">{formatSol(rentValues.mintAccount)} SOL</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-purple-300">Rent - Conta Associada:</span>
            <span className="text-white font-medium">{formatSol(rentValues.ataAccount)} SOL</span>
          </div>
          
          {/* Etapa 3: Custos de metadados */}
          <div className="flex justify-between text-xs">
            <span className="text-purple-300">Rent - Metadados:</span>
            <span className="text-white font-medium">{formatSol(rentValues.metadataAccount)} SOL</span>
          </div>
          
          {/* Taxas de rede */}
          <div className="flex justify-between text-xs">
            <span className="text-purple-300">Taxas de Rede (3 tx):</span>
            <span className="text-white font-medium">{formatSol(networkFee * 3)} SOL</span>
          </div>
          
          {/* Separador */}
          <div className="border-t border-purple-500/20 my-2"></div>
          
          {/* Total */}
          <div className="flex justify-between text-sm">
            <span className="text-purple-300 font-medium">Custo Total:</span>
            <div className="text-right">
              <div className="text-white font-semibold">{formatSol(totalCost)} SOL</div>
              {solPrice && <div className="text-purple-300 text-xs">≈ ${formatUsd(totalUsdCost)} USD</div>}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-purple-500/10 rounded-lg p-2 mt-2">
        <p className="text-purple-300 text-xs">
          Aproximadamente <span className="text-white">{formatSol(rentValues.mintAccount + rentValues.ataAccount + rentValues.metadataAccount)} SOL</span> são depósitos para reservar espaço na blockchain (tecnicamente recuperáveis).
        </p>
      </div>
    </div>
  );
};

export default CostEstimate;