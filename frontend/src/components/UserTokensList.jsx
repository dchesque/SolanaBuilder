import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Edit2, ExternalLink, Copy, Loader2 } from "lucide-react";

const TokenCard = ({ token, formatBalance, formatDate, onUpdateMetadata }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard");
  };

  const handleUpdateMetadata = () => {
    window.open(`/update-metadata?tokenAddress=${token.address}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-[#2a0538] to-[#1a012c] 
      border border-purple-900/50 rounded-2xl 
      shadow-lg shadow-purple-900/30 
      transition-all duration-300 
      hover:scale-[1.02] hover:shadow-xl 
      hover:border-pink-600/50 
      overflow-hidden"
    >
      {/* Header with ownership indicator */}
      <div className="bg-gradient-to-r from-green-600/20 to-green-600/10 
        px-4 py-2 flex items-center justify-between text-green-300">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-medium">Token Owner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              onClick={handleUpdateMetadata}
              className="hover:bg-purple-800/30 p-1.5 rounded-md transition"
            >
              <Edit2 className="w-4 h-4 text-pink-400" />
            </button>
            <div className="absolute z-10 bg-black text-white text-xs 
              p-2 rounded-md bottom-full left-1/2 transform -translate-x-1/2 
              opacity-0 group-hover:opacity-100 transition-opacity 
              pointer-events-none whitespace-nowrap">
              Edit token metadata
            </div>
          </div>
          <a
            href={`https://explorer.solana.com/address/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-purple-800/30 p-1.5 rounded-md transition"
            title="View on Solana Explorer"
          >
            <ExternalLink className="w-4 h-4 text-pink-400" />
          </a>
        </div>
      </div>

      {/* Token Details */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-pink-200 mb-1">
                {`Token ${token.address.slice(0, 4)}...`}
              </h3>
              <p className="text-sm text-pink-400">{token.symbol}</p>
            </div>
            {!token.hasMetadata && (
              <div className="bg-yellow-500/20 text-yellow-300 
                px-2 py-1 rounded-md text-xs">
                Metadata Pending
              </div>
            )}
          </div>
        </div>

        {/* Token Metrics */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-pink-300 text-sm">Balance</span>
            <span className="text-white font-semibold text-base">
              {formatBalance(token.balance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-pink-300 text-sm">Decimals</span>
            <span className="text-white font-semibold text-base">
              {token.decimals || "0"}
            </span>
          </div>
          {token.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-pink-300 text-sm">Created</span>
              <span className="text-white font-semibold text-base">
                {formatDate(token.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Token Address */}
        <div className="bg-purple-900/30 rounded-lg p-3 flex items-center justify-between mb-4">
          <div className="text-xs text-pink-200/60 truncate max-w-[calc(100%-40px)]">
            {token.address}
          </div>
          <button 
            onClick={() => copyToClipboard(token.address)}
            className="hover:bg-purple-800/50 p-1.5 rounded-md transition"
            title="Copy address"
          >
            <Copy className="w-4 h-4 text-pink-400" />
          </button>
        </div>

        {/* Add Metadata Button */}
        <div className="relative group">
          <button
            onClick={handleUpdateMetadata}
            className="w-full bg-pink-600 hover:bg-pink-700 
              text-white py-2 rounded-md transition-colors 
              flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Add Token Metadata
          </button>
          <div className="absolute z-10 bg-black text-white text-xs 
            p-2 rounded-md bottom-full left-1/2 transform -translate-x-1/2 
            opacity-0 group-hover:opacity-100 transition-opacity 
            pointer-events-none whitespace-nowrap">
            Add details like name, image, ticker, etc.
          </div>
        </div>
      </div>
    </div>
  );
};

function UserTokensList() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  const formatBalance = (balance) => {
    const num = Number(balance);
    if (isNaN(num) || num <= 0) return "0";
    
    const formatted = num.toLocaleString();
    let suffix = "";
    
    if (num >= 1_000_000_000_000) {
      suffix = ` (${(num / 1_000_000_000_000).toFixed(2)}T)`;
    } else if (num >= 1_000_000_000) {
      suffix = ` (${(num / 1_000_000_000).toFixed(2)}B)`;
    } else if (num >= 1_000_000) {
      suffix = ` (${(num / 1_000_000).toFixed(2)}M)`;
    } else if (num >= 1_000) {
      suffix = ` (${(num / 1_000).toFixed(2)}K)`;
    }
    
    return formatted + suffix;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const endpoint = connection.rpcEndpoint;
        const isMainnet = endpoint.includes("mainnet");
        const networkType = isMainnet ? "Solana Mainnet" : "Solana Devnet";
        setNetworkInfo(networkType);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );

        const tokenDetails = await Promise.all(
          tokenAccounts.value.map(async (account) => {
            try {
              const accountData = account.account.data.parsed.info;
              const mintAddress = new PublicKey(accountData.mint);

              const mintInfo = await connection.getParsedAccountInfo(mintAddress);
              const mintData = mintInfo.value?.data.parsed?.info;

              const isOwner = mintData?.freezeAuthority === publicKey.toString() || 
                             mintData?.mintAuthority === publicKey.toString();

              if (!isOwner) return null;

              return {
                address: mintAddress.toString(),
                name: `Token ${mintAddress.toString().slice(0, 4)}...`,
                symbol: "TOKEN",
                supply: accountData.tokenAmount.uiAmount,
                decimals: accountData.tokenAmount.decimals,
                balance: accountData.tokenAmount.uiAmount,
                isOwner,
                hasMetadata: false,
                createdAt: null
              };
            } catch (err) {
              console.error("Error processing token:", err);
              return null;
            }
          })
        );

        const uniqueTokens = tokenDetails.filter(token => token !== null);
        setTokens(uniqueTokens);
      } catch (err) {
        console.error("Error fetching tokens:", err);
        setError("Failed to load your tokens. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTokens();
  }, [connection, publicKey]);

  if (!publicKey) {
    return (
      <div className="bg-[#1a012c] bg-opacity-90 rounded-xl p-6 border border-[#512d5a]">
        <p className="text-center text-pink-200">
          Please connect your wallet to view your tokens.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a012c] bg-opacity-90 rounded-xl p-6 border border-[#512d5a]">
        <p className="text-center text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-[#1a012c] bg-opacity-90 rounded-xl p-6 border border-[#512d5a]">
        <p className="text-center text-pink-200">
          You don't own any tokens yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {networkInfo && (
        <div className="mb-6 text-sm text-pink-200 
          bg-purple-900/30 p-3 rounded-lg flex 
          items-center justify-between">
          <span>
            Network: <span className="font-bold">{networkInfo}</span>
          </span>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token) => (
          <TokenCard 
            key={token.address} 
            token={token} 
            formatBalance={formatBalance}
            formatDate={formatDate}
            onUpdateMetadata={() => window.open(`/update-metadata?tokenAddress=${token.address}`, '_blank')}
          />
        ))}
      </div>
    </div>
  );
}

export default UserTokensList;