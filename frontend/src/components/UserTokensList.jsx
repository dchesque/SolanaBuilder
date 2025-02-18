import React, { useState, useEffect } from 'react';
import { 
  Coins,
  Globe,
  Twitter,
  Send as Telegram,
  Github,
  Link as LinkIcon,
  Copy,
  ArrowRightCircle,
  Flame as BurnIcon,
  Settings,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

// Componente do Card do Token
const TokenCard = ({ token, onMint, onBurn, onPause }) => {
  const [showActions, setShowActions] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Adicionar notificação de sucesso
  };

  const handleAction = async (action) => {
    setLoadingAction(action);
    try {
      switch (action) {
        case 'mint':
          await onMint(token);
          break;
        case 'burn':
          await onBurn(token);
          break;
        case 'pause':
          await onPause(token);
          break;
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      // TODO: Adicionar notificação de erro
    }
    setLoadingAction('');
  };

  return (
    <div className="bg-[#1D0F35]/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-300">
      <div className="flex items-start gap-6">
        {/* Token Image */}
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-purple-900/30 flex-shrink-0">
          {token.imageUrl ? (
            <img
              src={token.imageUrl}
              alt={token.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Coins className="w-12 h-12 text-purple-400" />
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{token.name}</h3>
              <div className="flex items-center gap-2 text-purple-300 text-sm mb-3">
                <span className="font-mono">{token.symbol}</span>
                <button 
                  onClick={() => copyToClipboard(token.address)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Token Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-purple-300">Supply:</div>
              <div className="font-medium text-white">{token.supply.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-purple-300">Created:</div>
              <div className="font-medium text-white">{new Date(token.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 mb-4">
            {token.website && (
              <a
                href={token.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {token.twitter && (
              <a
                href={token.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {token.telegram && (
              <a
                href={token.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Telegram className="w-4 h-4" />
              </a>
            )}
            {token.github && (
              <a
                href={token.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Token Functions */}
          {showActions && (
            <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
              <div className="text-sm font-medium text-purple-300 mb-3">Token Actions:</div>
              <div className="grid grid-cols-2 gap-3">
                {token.isMintable && (
                  <button
                    onClick={() => handleAction('mint')}
                    disabled={!!loadingAction}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAction === 'mint' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Mint Tokens
                  </button>
                )}
                {token.isBurnable && (
                  <button
                    onClick={() => handleAction('burn')}
                    disabled={!!loadingAction}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAction === 'burn' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BurnIcon className="w-4 h-4" />
                    )}
                    Burn Tokens
                  </button>
                )}
                {token.isPausable && (
                  <button
                    onClick={() => handleAction('pause')}
                    disabled={!!loadingAction}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAction === 'pause' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    {token.isPaused ? 'Unpause Token' : 'Pause Token'}
                  </button>
                )}
                <Link
                  to={`/update-metadata?tokenAddress=${token.address}`}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Update Info
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal da lista de tokens
export default function UserTokensList() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Efeito para carregar os tokens
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!publicKey) return;
    
      try {
        setLoading(true);
        setError(null);
    
        const metaplex = new Metaplex(connection);
        metaplex.use(walletAdapterIdentity(wallet));
        
        // Buscar todos os tokens que o usuário tem
        const allTokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );
    
        // Filtrar e mapear os tokens
        const myTokens = await Promise.all(
          allTokenAccounts.value
            .filter(tokenAccount => {
              const tokenData = tokenAccount.account.data.parsed.info;
              // Verificar se é owner do token (tem mint authority)
              return tokenData.tokenAmount.amount !== "0";
            })
            .map(async (tokenAccount) => {
              const tokenData = tokenAccount.account.data.parsed.info;
              const tokenMint = new PublicKey(tokenData.mint);
    
              try {
                // Buscar metadata do token
                const metadataPDA = await Metadata.getPDA(tokenMint);
                const metadata = await Metadata.load(connection, metadataPDA);
                
                // Buscar dados extras do URI se existir
                let externalMetadata = {};
                if (metadata.data.data.uri) {
                  try {
                    const response = await fetch(metadata.data.data.uri);
                    externalMetadata = await response.json();
                  } catch (err) {
                    console.error('Error fetching token external metadata:', err);
                  }
                }
    
                return {
                  name: metadata.data.data.name || 'Unknown Token',
                  symbol: metadata.data.data.symbol || '',
                  address: tokenMint.toString(),
                  supply: tokenData.tokenAmount.uiAmount,
                  createdAt: new Date(), // Pode buscar o timestamp da criação se necessário
                  imageUrl: externalMetadata.image || null,
                  website: externalMetadata.external_url || externalMetadata.links?.website || null,
                  twitter: externalMetadata.links?.twitter || null,
                  telegram: externalMetadata.links?.telegram || null,
                  github: externalMetadata.links?.github || null,
                  isMintable: true, // Verificar mint authority
                  isBurnable: true,
                  isPausable: false,
                  isPaused: false
                };
              } catch (err) {
                console.error('Error loading token metadata:', err);
                return null;
              }
            })
        );
    
        // Remover tokens que falharam ao carregar metadata
        const validTokens = myTokens.filter(token => token !== null);
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
    <div className="space-y-6">
      {tokens.length === 0 ? (
        <div className="text-center py-12 bg-[#1D0F35]/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <Coins className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Tokens Found</h3>
          <p className="text-purple-300 mb-6">You haven't created any tokens yet.</p>
          <Link
            to="/token-creator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <ArrowRightCircle className="w-5 h-5" />
            Create Your First Token
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tokens.map((token) => (
            <TokenCard 
              key={token.address} 
              token={token}
              onMint={handleMint}
              onBurn={handleBurn}
              onPause={handlePause}
            />
          ))}
        </div>
      )}
    </div>
  );
}