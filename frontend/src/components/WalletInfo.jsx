import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";

const WalletInfo = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const navigate = useNavigate();

  // Friendly name for the network
  const NETWORK_DISPLAY_NAME = "Solana Mainnet";

  useEffect(() => {
    // Log connection and wallet details for debugging
    console.log("Connection Object:", connection);
    console.log("Wallet Object:", wallet);
    console.log("Public Key:", publicKey?.toBase58());

    const fetchBalance = async () => {
      // Extensive logging and error checking
      if (!publicKey) {
        console.warn("No public key available");
        setBalance(null);
        return;
      }

      if (!connection) {
        console.error("No Solana connection established");
        setError("No Solana connection");
        return;
      }

      try {
        // Log connection details
        const rpcEndpoint = connection.rpcEndpoint;
        setConnectionDetails(`Connected to: ${rpcEndpoint}`);
        console.log(`Fetching balance for ${publicKey.toBase58()}`);

        // Fetch balance with more robust error handling
        const lamports = await connection.getBalance(publicKey, 'confirmed');
        
        if (lamports === undefined || lamports === null) {
          throw new Error("Balance fetch returned undefined");
        }

        const solBalance = lamports / LAMPORTS_PER_SOL;
        
        console.log(`Raw Balance (lamports): ${lamports}`);
        console.log(`SOL Balance: ${solBalance}`);

        // Round to 4 decimal places for readability
        setBalance(solBalance.toFixed(4));
        setError(null);
      } catch (err) {
        console.error("Detailed Error fetching balance:", err);
        setError(`Unable to fetch balance: ${err.message}`);
        setBalance(null);
      }
    };

    // Fetch balance immediately and set up interval to refresh
    fetchBalance();
    const intervalId = setInterval(fetchBalance, 30000); // Refresh every 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [publicKey, connection]);

  // If no wallet is connected, don't render anything
  if (!publicKey) return null;

  // Function to shorten wallet address
  const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <p className="text-purple-300">
        Network: <span className="text-white">{NETWORK_DISPLAY_NAME}</span>
      </p>
      
      {/* Debug Connection Details */}
      {connectionDetails && (
        <p className="text-purple-300 text-xs">
          {connectionDetails}
        </p>
      )}

      <p className="text-purple-300">
        Balance:{" "}
        <span className="text-white">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : balance !== null ? (
            `${balance} SOL`
          ) : (
            "Loading..."
          )}
        </span>
      </p>
      <p className="text-purple-300">
        Address:{" "}
        <span className="text-white font-mono">
          {shortenAddress(publicKey.toBase58())}
        </span>
      </p>
      {/* My Tokens Button */}
      <button
        onClick={() => navigate("/my-tokens")}
        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
      >
        My Tokens
      </button>
    </div>
  );
};

export default WalletInfo;