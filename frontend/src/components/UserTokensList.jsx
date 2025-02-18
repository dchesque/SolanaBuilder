import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Coins,
  Globe,
  Twitter,
  Send as Telegram,
  Github,
  Link as LinkIcon,
  Copy,
  LayoutGrid,
  Settings,
  Sparkles,
  Loader2,
  Flame as BurnIcon
} from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

// Componente principal da lista de tokens
export default function UserTokensList() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActions, setShowActions] = useState({});

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Adicionar notificação de sucesso
  };

  // Funções para manipular tokens
  const handleMint = async (token) => {
    // Implementar lógica de mint
  };

  const handleBurn = async (token) => {
    // Implementar lógica de burn
  };

  const handlePause = async (token) => {
    // Implementar lógica de pause
  };

  const handleAction = async (action, token) => {
    // Implementar lógica de ações
    switch (action) {
      case 'mint':
        await handleMint(token);
        break;
      case 'burn':
        await handleBurn(token);
        break;
      case 'pause':
        await handlePause(token);
        break;
    }
  };

  // Efeito para carregar os tokens
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!publicKey) return;
    
      try {
        setLoading(true);
        setError(null);
    
        // Inicializa o Metaplex
        const metaplex = new Metaplex(connection);
        metaplex.use(walletAdapterIdentity(wallet));

        // Buscar todos os Mints da wallet usando getParsedTokenAccountsByOwner
        const ownedTokens = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        console.log('Wallet publicKey:', publicKey.toString());
        console.log('Token accounts found:', ownedTokens.value.length);

        // Array para armazenar as mint addresses únicas
        const uniqueMints = new Set();

        // Buscar informações de cada token
        const myTokens = await Promise.all(
          ownedTokens.value.map(async ({ account }) => {
            try {
              const tokenData = account.data.parsed.info;
              const mintAddress = new PublicKey(tokenData.mint);

              // Pular se já processamos este mint
              if (uniqueMints.has(mintAddress.toString())) {
                return null;
              }

              // Verificar se a wallet é mint authority
              const mintInfo = await connection.getParsedAccountInfo(mintAddress);
              if (!mintInfo.value) return null;
              
              const mintData = mintInfo.value.data.parsed.info;
              
              // Verificar se a wallet é mint authority
              if (mintData.mintAuthority !== publicKey.toString()) {
                return null;
              }

              uniqueMints.add(mintAddress.toString());

              try {
                // Buscar metadata do token usando Metaplex
                const nft = await metaplex.nfts().findByMint({ mintAddress });
                console.log('Token metadata:', nft);
                
                // Buscar dados extras do URI se existir
                let externalMetadata = {};
                if (nft.uri) {
                  try {
                    const response = await fetch(nft.uri);
                    externalMetadata = await response.json();
                    console.log('External metadata:', externalMetadata);
                  } catch (err) {
                    console.error('Error fetching token external metadata:', err);
                  }
                }

                return {
                  name: nft.name || 'Unknown Token',
                  symbol: nft.symbol || '',
                  address: mintAddress.toString(),
                  supply: parseInt(mintData.supply) / Math.pow(10, mintData.decimals),
                  createdAt: new Date(),
                  imageUrl: externalMetadata.image || null,
                  website: externalMetadata.external_url || externalMetadata.links?.website || null,
                  twitter: externalMetadata.links?.twitter || null,
                  telegram: externalMetadata.links?.telegram || null,
                  github: externalMetadata.links?.github || null,
                  isMintable: true,
                  isBurnable: true,
                  isPausable: false,
                  isPaused: false
                };
              } catch (metaplexErr) {
                console.error('Error loading token metadata from Metaplex:', metaplexErr);
                
                // Método alternativo usando Metadata PDA
                try {
                  const metadataPDA = await Metadata.getPDA(mintAddress);
                  const metadata = await Metadata.load(connection, metadataPDA);
                  
                  return {
                    name: metadata.data.data.name || 'Unknown Token',
                    symbol: metadata.data.data.symbol || '',
                    address: mintAddress.toString(),
                    supply: parseInt(mintData.supply) / Math.pow(10, mintData.decimals),
                    createdAt: new Date(),
                    imageUrl: null,
                    website: null,
                    twitter: null,
                    telegram: null,
                    github: null,
                    isMintable: true,
                    isBurnable: true,
                    isPausable: false,
                    isPaused: false
                  };
                } catch (pdaErr) {
                  console.error('Error loading token metadata from PDA:', pdaErr);
                  return {
                    name: 'Unknown Token',
                    symbol: '',
                    address: mintAddress.toString(),
                    supply: parseInt(mintData.supply) / Math.pow(10, mintData.decimals),
                    createdAt: new Date(),
                    imageUrl: null,
                    website: null,
                    twitter: null,
                    telegram: null,
                    github: null,
                    isMintable: true,
                    isBurnable: true,
                    isPausable: false,
                    isPaused: false
                  };
                }
              }
            } catch (err) {
              console.error('Error processing token account:', err);
              return null;
            }
          })
        );
    
        // Remover tokens que falharam ao carregar metadata
        const validTokens = myTokens.filter(token => token !== null);
        console.log('Valid tokens found:', validTokens.length);
        setTokens(validTokens);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to load tokens. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTokens();
  }, [connection, publicKey, wallet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-[#1D0F35]/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Loading your tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-[#1D0F35]/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Tokens</h3>
        <p className="text-purple-300 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/20 text-white font-semibold hover:bg-purple-500/30 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm text-purple-300">
            {tokens.length} {tokens.length === 1 ? 'Token' : 'Tokens'} Found
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-all">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#1D0F35]/30 backdrop-blur-sm rounded-2xl border border-purple-500/20">
          <div className="bg-purple-900/30 p-4 rounded-full mb-6">
            <Coins className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Tokens Found</h3>
          <p className="text-purple-300 text-center mb-8 max-w-md">
            You haven't created any tokens yet. Start by creating your first token.
          </p>
          <Link
            to="/token-creator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Token
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <div key={token.address} className="group">
              <div className="bg-[#1D0F35]/30 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-300 h-full">
                {/* Token Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-900/30 flex-shrink-0">
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt={token.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coins className="w-8 h-8 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{token.name}</h3>
                        <span className="px-2 py-0.5 bg-purple-500/20 rounded-md text-sm font-medium text-purple-300">
                          {token.symbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-300 text-sm">
                        <span className="font-mono truncate max-w-[150px]">{token.address}</span>
                        <button
                          onClick={() => copyToClipboard(token.address)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title="Copy address"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowActions(prev => ({ ...prev, [token.address]: !prev[token.address] }))}
                    className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                {/* Token Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-900/20 rounded-xl p-4">
                    <div className="text-sm text-purple-300 mb-1">Supply</div>
                    <div className="font-medium text-white">
                      {token.supply.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-900/20 rounded-xl p-4">
                    <div className="text-sm text-purple-300 mb-1">Created</div>
                    <div className="font-medium text-white">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {(token.website || token.twitter || token.telegram || token.github) && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-purple-900/20 rounded-xl">
                    {token.website && (
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-all"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {token.twitter && (
                      <a
                        href={token.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-all"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {token.telegram && (
                      <a
                        href={token.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-all"
                      >
                        <Telegram className="w-4 h-4" />
                      </a>
                    )}
                    {token.github && (
                      <a
                        href={token.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-all"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Token Actions */}
                {showActions[token.address] && (
                  <div className="mt-6">
                    <Link
                      to={`/update-metadata?tokenAddress=${token.address}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-white font-medium transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Update Token Info
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}