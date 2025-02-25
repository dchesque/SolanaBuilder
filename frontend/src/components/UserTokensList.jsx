import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Coins,
  Globe,
  Twitter,
  Send as Telegram,
  Github,
  Copy,
  LayoutGrid,
  Settings,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

// Função para tentar obter a data de criação do token usando o histórico de assinaturas da conta mint
async function getTokenCreationDate(mintAddress, connection) {
  try {
    const signatures = await connection.getSignaturesForAddress(mintAddress, { limit: 100 });
    if (signatures && signatures.length > 0) {
      const oldestSignature = signatures[signatures.length - 1];
      const blockTime = await connection.getBlockTime(oldestSignature.signature);
      if (blockTime) {
        return new Date(blockTime * 1000);
      }
    }
    return null;
  } catch (err) {
    console.error('Error fetching token creation date from RPC:', err);
    return null;
  }
}

export default function UserTokensList() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for general text filter
  const [filter, setFilter] = useState("");
  // Additional filter states
  const [filterWithMetadata, setFilterWithMetadata] = useState(false);
  const [filterWithHolders, setFilterWithHolders] = useState(false);
  // Sorting order: "new" for Newest First, "old" for Oldest First
  const [sortOrder, setSortOrder] = useState("new");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Add success notification
  };

  // Function to fetch token holders count using Solscan
  async function getHoldersCount(mintAddress) {
    const solscanUrl = `https://public-api.solscan.io/token/holders?tokenAddress=${mintAddress.toString()}`;
    try {
      const response = await fetch(solscanUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.length;
      } else if (data.total) {
        return data.total;
      }
      return 0;
    } catch (err) {
      console.error('Error fetching holders count:', err);
      return 0;
    }
  }

  // Effect to load tokens
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!publicKey) return;
    
      try {
        setLoading(true);
        setError(null);
    
        const metaplex = new Metaplex(connection);
        metaplex.use(walletAdapterIdentity(wallet));

        const ownedTokens = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Set to store unique mint addresses
        const uniqueMints = new Set();

        const myTokens = await Promise.all(
          ownedTokens.value.map(async ({ account }) => {
            try {
              const tokenData = account.data.parsed.info;
              const mintAddress = new PublicKey(tokenData.mint);

              if (uniqueMints.has(mintAddress.toString())) {
                return null;
              }

              const mintInfo = await connection.getParsedAccountInfo(mintAddress);
              if (!mintInfo.value) return null;
              
              const mintData = mintInfo.value.data.parsed.info;
              
              if (mintData.mintAuthority !== publicKey.toString()) {
                return null;
              }

              uniqueMints.add(mintAddress.toString());
              
              // Tenta obter a data de criação via RPC; se não obtiver, usa null
              const creationDate = await getTokenCreationDate(mintAddress, connection);

              // Fetch holders count
              const holdersCount = await getHoldersCount(mintAddress);

              try {
                const nft = await metaplex.nfts().findByMint({ mintAddress });
                
                let externalMetadata = {};
                if (nft.uri) {
                  try {
                    const response = await fetch(nft.uri);
                    externalMetadata = await response.json();
                  } catch (err) {
                    console.error('Error fetching token external metadata:', err);
                  }
                }

                return {
                  name: nft.name || 'Unknown Token',
                  symbol: nft.symbol || '',
                  address: mintAddress.toString(),
                  supply: parseInt(mintData.supply) / Math.pow(10, mintData.decimals),
                  createdAt: creationDate, // Pode ser null se não obtido
                  imageUrl: externalMetadata.image || null,
                  website: externalMetadata.external_url || externalMetadata.links?.website || null,
                  twitter: externalMetadata.links?.twitter || null,
                  telegram: externalMetadata.links?.telegram || null,
                  github: externalMetadata.links?.github || null,
                  isMintable: true,
                  isBurnable: true,
                  isPausable: false,
                  isPaused: false,
                  holders: holdersCount
                };
              } catch (metaplexErr) {
                console.error('Error loading token metadata from Metaplex:', metaplexErr);
                try {
                  const metadataPDA = await Metadata.getPDA(mintAddress);
                  const metadata = await Metadata.load(connection, metadataPDA);
                  
                  return {
                    name: metadata.data.data.name || 'Unknown Token',
                    symbol: metadata.data.data.symbol || '',
                    address: mintAddress.toString(),
                    supply: parseInt(mintData.supply) / Math.pow(10, mintData.decimals),
                    createdAt: creationDate,
                    imageUrl: null,
                    website: null,
                    twitter: null,
                    telegram: null,
                    github: null,
                    isMintable: true,
                    isBurnable: true,
                    isPausable: false,
                    isPaused: false,
                    holders: holdersCount
                  };
                } catch (pdaErr) {
                  console.error('Error loading token metadata from PDA:', pdaErr);
                  return {
                    name: 'Unknown Token',
                    symbol: '',
                    address: mintAddress.toString(),
                    supply: parseInt(mintData.supply) / Math.pow(10, mintData.decimals),
                    createdAt: creationDate,
                    imageUrl: null,
                    website: null,
                    twitter: null,
                    telegram: null,
                    github: null,
                    isMintable: true,
                    isBurnable: true,
                    isPausable: false,
                    isPaused: false,
                    holders: holdersCount
                  };
                }
              }
            } catch (err) {
              console.error('Error processing token account:', err);
              return null;
            }
          })
        );
    
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

  // Apply filters: general text filter, metadata filter, and holders filter
  const filteredTokens = tokens.filter(token => {
    // General text filter
    const textMatch =
      token.name.toLowerCase().includes(filter.toLowerCase()) ||
      token.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      token.address.toLowerCase().includes(filter.toLowerCase());
    if (!textMatch) return false;

    // Filter: Only tokens with metadata – agora checa se o nome não é "Unknown Token"
    if (filterWithMetadata) {
      if (token.name === 'Unknown Token' || !token.name) {
        return false;
      }
    }

    // Filter: Only tokens with holders (holders > 0)
    if (filterWithHolders) {
      if (token.holders <= 0) return false;
    }

    return true;
  });

  // Sorting tokens based on creation date
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    if (sortOrder === 'new') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

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
      {/* General Text Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter tokens (name, symbol or address)"
          className="w-full px-4 py-2 rounded-lg bg-purple-900/20 text-white placeholder-purple-300"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Additional Filters *
      <div className="mb-6 flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={filterWithMetadata}
            onChange={(e) => setFilterWithMetadata(e.target.checked)}
            className="form-checkbox"
          />
          Only tokens with metadata
        </label>
        <label className="inline-flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={filterWithHolders}
            onChange={(e) => setFilterWithHolders(e.target.checked)}
            className="form-checkbox"
          />
          Only tokens with holders
        </label>
        <label className="inline-flex items-center gap-2 text-white">
          Sort by:
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-purple-900/20 text-white rounded-lg px-2 py-1"
          >
            <option value="new">Newest First</option>
            <option value="old">Oldest First</option>
          </select>
        </label>
      </div>/}

      {/* View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm text-purple-300">
            {sortedTokens.length} {sortedTokens.length === 1 ? 'Token Found' : 'Tokens Found'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-all">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {sortedTokens.length === 0 ? (
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
          {sortedTokens.map((token) => (
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
                      {/* Name and symbol in separate lines */}
                      <div className="mb-1">
                        <h3 className="text-xl font-bold text-white">{token.name}</h3>
                        <span className="block mt-1 px-2 py-0.5 bg-purple-500/20 rounded-md text-sm font-medium text-purple-300">
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
                    <div className="text-sm text-purple-300 mb-1">Created At</div>
                    <div className="font-medium text-white">
                      {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-purple-900/20 rounded-xl p-4">
                    <div className="text-sm text-purple-300 mb-1">Holders</div>
                    <div className="font-medium text-white">
                      {token.holders.toLocaleString()}
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

                {/* Button to view token on Solscan */}
                <div className="mb-4">
                  <a
                    href={`https://solscan.io/token/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-white font-medium transition-all"
                  >
                    View on Solscan
                  </a>
                </div>

                {/* Update Token Info Button */}
                <div className="mt-6">
                  <Link
                    to={`/update-metadata?tokenAddress=${token.address}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-white font-medium transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Update Token Info
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
