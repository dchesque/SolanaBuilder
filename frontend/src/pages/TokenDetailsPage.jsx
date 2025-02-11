// TokenDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const TokenDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenAddress, tokenName, ticker, supply } = location.state || {};

  // Hooks para acessar a carteira e a conexão com a rede Solana
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  // Estado para armazenar os tokens encontrados e o loading
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // Busca os tokens da carteira assim que o componente é montado
  useEffect(() => {
    if (!publicKey) {
      setLoadingTokens(false);
      return;
    }
    const fetchTokens = async () => {
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );
        const tokensData = tokenAccounts.value.map(({ pubkey, account }) => {
          const parsedInfo = account.data.parsed.info;
          return {
            pubkey: pubkey.toString(),
            mint: parsedInfo.mint,
            tokenAmount: parsedInfo.tokenAmount,
          };
        });
        setTokens(tokensData);
      } catch (err) {
        console.error("Erro ao buscar tokens:", err);
      } finally {
        setLoadingTokens(false);
      }
    };

    fetchTokens();
  }, [publicKey, connection]);

  // Função para copiar o endereço do token recém-criado
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenAddress);
    alert("Token address copied to clipboard!");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-[#1a012c] bg-opacity-90 rounded-xl p-6 shadow-xl border border-[#512d5a]">
      {/* Seção dos detalhes do token recém-criado */}
      <h1 className="text-3xl font-extrabold text-center mb-4 text-pink-300">
        Token Created Successfully!
      </h1>

      <div className="text-center mb-6">
        <p className="text-lg text-white mb-2">
          <strong>Name:</strong> {tokenName}
        </p>
        <p className="text-lg text-white mb-2">
          <strong>Ticker:</strong> {ticker}
        </p>
        <p className="text-lg text-white mb-2">
          <strong>Supply:</strong> {supply.toLocaleString()} Tokens
        </p>

        <div className="mt-4">
          <p className="text-lg text-white">
            <strong>Token Address:</strong>
          </p>
          <p className="text-yellow-300 text-sm break-all">{tokenAddress}</p>
          <button
            onClick={copyToClipboard}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-md"
          >
            Copy Address
          </button>
        </div>

        <div className="mt-6">
          <a
            href={`https://solscan.io/token/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-md"
          >
            View on Solscan 🔍
          </a>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/token-creator")}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-md"
          >
            Create Another Token 🔄
          </button>
        </div>
      </div>

      {/* Seção para listar os tokens da carteira */}
      <div>
        <h2 className="text-2xl font-bold text-center text-pink-300 mb-4">
          Your Tokens
        </h2>
        {loadingTokens ? (
          <p className="text-white text-center">Loading tokens...</p>
        ) : tokens.length > 0 ? (
          <div className="space-y-4">
            {tokens.map((token, index) => (
              <div
                key={index}
                className="bg-[#11001c] p-4 rounded-md border border-[#3b2153]"
              >
                <p className="text-white">
                  <strong>Mint:</strong> {token.mint}
                </p>
                <p className="text-white">
                  <strong>Balance:</strong> {token.tokenAmount.uiAmount} (raw:{" "}
                  {token.tokenAmount.amount})
                </p>
                <a
                  href={`https://solscan.io/token/${token.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View on Solscan
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center">
            No tokens found for this wallet.
          </p>
        )}
      </div>
    </div>
  );
};

export default TokenDetailsPage;
