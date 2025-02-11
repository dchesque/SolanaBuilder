// MyTokensPage.jsx
import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import WalletConnect from "../components/WalletConnect";
import WalletInfo from "../components/WalletInfo";

// Função para formatar números com abreviações (K, M, B, T)
const formatSupply = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + " K";
  return num.toString();
};

// Função simulada para buscar metadados do token a partir do mint (token address)
// Em produção, substitua por uma chamada via @metaplex-foundation/js ou por uma API.
const fetchTokenMetadata = async (mint) => {
  // Retorna dados dummy baseados no endereço
  return {
    name: "Token " + mint.slice(0, 4),
    symbol: "SYM",
    image: "https://via.placeholder.com/300x150.png?text=Token+Image",
    website: "https://example.com",
    twitter: "https://twitter.com/example",
    telegram: "https://t.me/example",
    supply: 1000000000, // Exemplo: 1 bilhão
  };
};

const MyTokensPage = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    const fetchTokens = async () => {
      try {
        // Busca as contas de tokens da carteira
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Mapeia os dados básicos de cada token
        const tokensData = tokenAccounts.value.map(({ pubkey, account }) => {
          const parsedInfo = account.data.parsed.info;
          return {
            pubkey: pubkey.toString(),
            mint: parsedInfo.mint, // Este é o token address
            balance: parsedInfo.tokenAmount.uiAmount,
            decimals: parsedInfo.tokenAmount.decimals,
            rawAmount: parsedInfo.tokenAmount.amount,
          };
        });

        // Para cada token, busca os metadados e agrega ao objeto
        const tokensDataWithMetadata = await Promise.all(
          tokensData.map(async (token) => {
            const metadata = await fetchTokenMetadata(token.mint);
            return {
              ...token,
              metadata,
            };
          })
        );

        setTokens(tokensDataWithMetadata);
      } catch (err) {
        console.error("Error fetching tokens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [publicKey, connection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black animate-gradient flex flex-col text-white">
      {/* HEADER */}
      <header className="bg-black/50 border-b border-purple-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-pink-400" />
            <span className="text-2xl font-bold text-pink-400">SolanaMint</span>
          </div>
          {/* Componentes de conexão e informações da carteira */}
          <div className="flex items-center gap-6">
            <WalletConnect />
            <WalletInfo />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">My Tokens</h1>

          {/* Botão para voltar à página de criação */}
          <div className="mb-4">
            <Link
              to="/token-creator"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md"
            >
              Back to Token Creator
            </Link>
          </div>

          {loading ? (
            <p className="text-center">Loading tokens...</p>
          ) : tokens.length === 0 ? (
            <p className="text-center">No tokens found for this wallet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tokens.map((token, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 flex flex-row"
                >
                  {/* Coluna da Imagem */}
                  <div className="w-1/3">
                    <img
                      src={token.metadata.image}
                      alt={token.metadata.name}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  {/* Coluna das Informações */}
                  <div className="w-2/3 p-4 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {token.metadata.name}
                      </h2>
                      <p className="text-gray-300">
                        Ticker:{" "}
                        <span className="font-semibold">
                          {token.metadata.symbol}
                        </span>
                      </p>
                      <p className="text-gray-300 break-all">
                        Token Address:{" "}
                        <span className="font-mono">{token.mint}</span>
                      </p>
                      <p className="text-gray-300">
                        Total Supply:{" "}
                        <span className="font-semibold">
                          {formatSupply(token.metadata.supply)}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        Your Balance:{" "}
                        <span className="font-semibold">
                          {token.balance ?? 0}
                        </span>
                      </p>
                    </div>
                    {/* Botões para website, Twitter, Telegram e Solscan */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {token.metadata.website && (
                        <a
                          href={token.metadata.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm"
                        >
                          Website
                        </a>
                      )}
                      {token.metadata.twitter && (
                        <a
                          href={token.metadata.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-sm"
                        >
                          Twitter
                        </a>
                      )}
                      {token.metadata.telegram && (
                        <a
                          href={token.metadata.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm"
                        >
                          Telegram
                        </a>
                      )}
                      <a
                        href={`https://solscan.io/token/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm"
                      >
                        Solscan
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
        <p className="text-purple-300 mt-4">
          &copy; 2025 SolanaMint. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MyTokensPage;
