import React, { useState } from "react";
import { ArrowRight, FileEdit, Wallet, HelpCircle } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import WalletConnect from "./WalletConnect";
import CostEstimate from "./CostEstimate";
import { ExternalLink } from 'lucide-react';
import TokenPDFGenerator from '../components/pdf/TokenPDFGenerator';
import { 
  Transaction,
  SystemProgram,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export default function CreateTokenForm() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const navigate = useNavigate();

  const [nomeToken, setNomeToken] = useState("");
  const [ticker, setTicker] = useState("");
  const [supply, setSupply] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenFeatures, setTokenFeatures] = useState({
    mintable: false,
    burnable: false,
    freezable: false,
  });

  // Adicione aqui os novos métodos de validação
const validateTokenName = (name) => {
  if (!name) return "";
  if (name.length > 32) {
    return "Token name must be 32 characters or less.";
  }
  return "";
};

// Chame a validação antes de usar
const tokenNameError = validateTokenName(nomeToken);

  // Variables to store the created token data
  const [createdTokenData, setCreatedTokenData] = useState(null);

  const validateTicker = (ticker) => {
    if (!ticker) return "";
    if (ticker.length > 6) {
      return "Ticker must be at most 6 characters.";
    }
    return "";
  };

  const formatSupply = (supply) => {
    const num = Number(supply);
    if (isNaN(num) || num <= 0) return "";
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
    return num.toString();
  };

  const tickerError = validateTicker(ticker);
  const formattedSupply = formatSupply(supply);

  // STEP 1: Confirm details and process service fee
  const handleConfirmDetails = async (e) => {
    e.preventDefault();
  
    // Detailed logs for verification
    console.log('Environment Variables Check:');
    console.log('SERVICE_WALLET:', SERVICE_WALLET);
    console.log('SERVICE_WALLET type:', typeof SERVICE_WALLET);
    console.log('SERVICE_FEE:', SERVICE_FEE);
    console.log('SERVICE_FEE type:', typeof SERVICE_FEE);
  
    // Environment variable checks
    if (!SERVICE_WALLET) {
      setMessage("Error: Service wallet address not configured.");
      return;
    }
  
    if (!SERVICE_FEE || isNaN(SERVICE_FEE)) {
      setMessage("Error: Invalid service fee.");
      return;
    }
  
    if (!publicKey) {
      setMessage("Please connect your wallet to continue.");
      return;
    }
  
    try {
      setLoading(true);
      setMessage("Confirming details and processing service fee...");
  
      // Convert service fee to lamports (1 SOL = 1 billion lamports)
      const serviceFeeInLamports = Math.ceil(SERVICE_FEE * 1_000_000_000);
  
      const walletBalance = await connection.getBalance(publicKey);
      const balanceInSOL = walletBalance / 1_000_000_000; // Convert lamports to SOL
  
      console.log('Wallet Balance Details:');
      console.log('Balance in Lamports:', walletBalance);
      console.log('Balance in SOL:', balanceInSOL);
      console.log('Service Fee in Lamports:', serviceFeeInLamports);
  
      const serviceWalletPublicKey = new PublicKey(SERVICE_WALLET);
      
      console.log('Service Wallet Public Key:', serviceWalletPublicKey.toBase58());
  
      // Check balance
      if (walletBalance < serviceFeeInLamports) {
        setMessage(`Insufficient balance. Required: ${serviceFeeInLamports / 1_000_000_000} SOL, Available: ${balanceInSOL} SOL`);
        setLoading(false);
        return;
      }
  
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: serviceWalletPublicKey,
          lamports: serviceFeeInLamports,
        })
      );
  
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Transaction Signature:', signature);
  
      await connection.confirmTransaction(signature, "confirmed");
  
      setStep(2);
      setMessage("Details confirmed successfully! Now you can create your token.");
    } catch (err) {
      console.error('Error details in handleConfirmDetails:', err);
      
      let errorMessage = "Error confirming details: ";
      
      if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "An unknown error occurred";
      }
  
      if (err.logs) {
        console.error('Transaction Logs:', err.logs);
      }
  
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Create the token on the Solana network
  const handleCreateToken = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      setMessage("Please connect your wallet to continue.");
      return;
    }

    if (tickerError) {
      setMessage(tickerError);
      return;
    }

    setLoading(true);
    setMessage("Creating token on the Solana network...");

    try {
      // Generate token mint
      const mintKeypair = Keypair.generate();
      const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      // Ensure supply is always at least 1000 for 9 decimals
      let humanSupply = Number(supply);
      if (isNaN(humanSupply) || humanSupply < 1000) {
        humanSupply = 1000;
        setSupply("1000");
      }

      // Always using 9 decimals
      const tokenDecimals = 9;
      
      // On-chain value (convert human-readable value to actual quantity)
      const onChainSupply = humanSupply * 10 ** tokenDecimals;

      console.log('Creating token with the following parameters:');
      console.log('Mint Address:', mintKeypair.publicKey.toString());
      console.log('Name:', nomeToken);
      console.log('Symbol:', ticker);
      console.log('Supply:', humanSupply);
      console.log('Decimals:', tokenDecimals);

      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: lamportsForMint,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize the mint with defined decimals
      const initMintIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenDecimals,
        publicKey,
        null
      );

      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      const createATAIx = createAssociatedTokenAccountInstruction(
        publicKey,
        associatedTokenAddress,
        publicKey,
        mintKeypair.publicKey
      );

      const mintToIx = createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAddress,
        publicKey,
        onChainSupply
      );

      const transaction = new Transaction().add(
        createAccountIx,
        initMintIx,
        createATAIx,
        mintToIx
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      transaction.partialSign(mintKeypair);

      const signature = await sendTransaction(transaction, connection);
      console.log('Token created successfully! Signature:', signature);

      try {
        await connection.confirmTransaction(signature, "confirmed");
        
        // Save token data for use in step 3
        setCreatedTokenData({
          mintAddress: mintKeypair.publicKey.toString(),
          name: nomeToken,
          symbol: ticker,
          supply: humanSupply,
          decimals: tokenDecimals
        });
        
        setStep(3);
        setMessage("Token created successfully! Now let's add metadata.");
      } catch (confirmError) {
        if (
          confirmError.message &&
          confirmError.message.includes("Transaction was not confirmed in 30.00 seconds")
        ) {
          console.warn("Transaction confirmation timeout, but token may have been created.");
          
          // Save data even on timeout since the token was likely created
          setCreatedTokenData({
            mintAddress: mintKeypair.publicKey.toString(),
            name: nomeToken,
            symbol: ticker,
            supply: humanSupply,
            decimals: tokenDecimals
          });
          
          setStep(3);
          setMessage("Transaction confirmation timeout, but token may have been created. Attempting to add metadata...");
        } else {
          throw confirmError;
        }
      }
    } catch (err) {
      console.error('Error creating token:', err);
      setMessage("Error creating token: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Add metadata to the token using Metaplex
  const handleAddMetadata = async (e) => {
    e.preventDefault();

    if (!publicKey || !createdTokenData) {
      setMessage("Token data not found. Please create the token first.");
      return;
    }

    setLoading(true);
    setMessage("Calculating costs and adding metadata to the token...");

    try {
      // Initialize Metaplex
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity({ publicKey, sendTransaction }));

      console.log('Preparing on-chain metadata creation...');
      
      const mintAddress = new PublicKey(createdTokenData.mintAddress);
      
      // Find the metadata PDA
      const metadataPDA = await metaplex.nfts().pdas().metadata({ mint: mintAddress });
      
      console.log('Metadata PDA address:', metadataPDA.toBase58());
      
      // Prepare data for the metadata instruction
      const metadataData = {
        name: createdTokenData.name,
        symbol: createdTokenData.symbol,
        uri: "", // Empty URI, not uploading to Arweave
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
      };
      
      // Estimate the space required for metadata
      const metadataSize = 1 + // discriminator key
                       32 + // mintKey
                       32 + // updateAuthority
                       createdTokenData.name.length + 4 + // name string (with length prefix)
                       createdTokenData.symbol.length + 4 + // symbol string (with length prefix)
                       4 + // uri string (empty but with length prefix)
                       2 + // seller fee basis points
                       1 + // Boolean has creators
                       1 + // Boolean has collection
                       1 + // Boolean has uses
                       1; // extra byte for possible extensions
    
      console.log('Estimated metadata size (bytes):', metadataSize);
      
      // Calculate rent cost for the metadata size
      const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(metadataSize);
      
      console.log('Rent exemption cost (lamports):', rentExemptionAmount);
      console.log('Rent exemption cost (SOL):', rentExemptionAmount / 1_000_000_000);
      
      // Create metadata instruction
      const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mintAddress,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: metadataData,
            isMutable: true,
            collectionDetails: null
          }
        }
      );
      
      // Create and send the transaction
      const transaction = new Transaction().add(createMetadataInstruction);
      
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      
      // Estimate fees
      const { feeCalculator } = await connection.getRecentBlockhash();
      const fees = await transaction.getEstimatedFee(connection);
      
      console.log('Estimated transaction fee (lamports):', fees);
      console.log('Estimated transaction fee (SOL):', fees / 1_000_000_000);
      
      console.log('Total estimated cost (SOL):', (rentExemptionAmount + fees) / 1_000_000_000);
      
      // Confirm with the user to proceed
      setMessage(`The total estimated cost is ${((rentExemptionAmount + fees) / 1_000_000_000).toFixed(6)} SOL. Do you want to continue?`);
      
      const signature = await sendTransaction(transaction, connection);
      console.log('Metadata created successfully! Signature:', signature);
      
      // Await confirmation
      await connection.confirmTransaction(signature, "confirmed");
      
      // Navigate to token details page
      navigate("/token-details", {
        state: {
          tokenAddress: createdTokenData.mintAddress,
          tokenName: createdTokenData.name,
          ticker: createdTokenData.symbol,
          supply: createdTokenData.supply,
          decimals: createdTokenData.decimals
        }
      });

      setMessage(`Token and metadata created successfully!`);
    } catch (err) {
      console.error('Detailed error adding metadata:', err);
      
      if (err.message.includes("already has metadata") || err.message.includes("already exists")) {
        setMessage("It seems metadata already exists. Redirecting to token details page...");
        
        setTimeout(() => {
          navigate("/token-details", {
            state: {
              tokenAddress: createdTokenData.mintAddress,
              tokenName: createdTokenData.name,
              ticker: createdTokenData.symbol,
              supply: createdTokenData.supply,
              decimals: createdTokenData.decimals
            }
          });
        }, 2000);
      } else {
        setMessage("Error adding metadata: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Wallet not connected
  if (!publicKey) {
    return (
      <div className="bg-[#150929] rounded-3xl p-10 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Connect Your Wallet
        </h1>
        <p className="text-center text-sm text-purple-200/80 mb-8">
          Connect your Solana wallet to start creating your token.
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          
          <WalletConnect className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#150929] rounded-3xl p-10 shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        Create Your Own Solana Token
      </h1>
      <p className="text-center text-sm text-purple-200/80 mb-8">
        Empower your brand or community on the fast and low-cost Solana network.
        Create and launch your token in three simple steps.
      </p>

      <form 
        onSubmit={
          step === 1 
            ? handleConfirmDetails 
            : step === 2 
              ? handleCreateToken 
              : handleAddMetadata
        } 
        className="space-y-6"
      >
        {step <= 2 && (
          <>
            <div>
              <label className="block text-sm mb-2 text-purple-200">Token Name</label>
              <input
                type="text"
                placeholder="Ex: My Amazing Token"
                value={nomeToken}
                onChange={(e) => setNomeToken(e.target.value)}
                className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                disabled={step !== 1}
                required
              />
                {tokenNameError && <p className="text-xs text-red-400 mt-1">{tokenNameError}</p>}
            </div>

            <div>
              <label className="block text-sm mb-2 text-purple-200">Ticker</label>
              <input
                type="text"
                placeholder="Ex: MTI"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className={`w-full h-12 rounded-xl bg-[#1D0F35] border ${
                  tickerError ? "border-red-500" : "border-purple-500/20"
                } px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all`}
                disabled={step !== 1}
                required
              />
              {tickerError && <p className="text-xs text-red-400 mt-1">{tickerError}</p>}
            </div>

            <div>
              <label className="block text-sm mb-2 text-purple-200">Supply (min 1000)</label>
              <input
                type="number"
                placeholder="Ex: 10000000000"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                disabled={step !== 1}
                min="1000"
                required
              />
              {formattedSupply && (
                <p className="text-xs text-purple-300/80 mt-1">
                  You are creating <span className="font-medium text-purple-300">{formattedSupply}</span> tokens with 9 decimal places
                </p>
              )}
              <p className="text-xs text-purple-300/70 mt-1">
                All tokens include metadata and 9 decimal places
              </p>
            </div>
          </>
        )}


{step === 3 && createdTokenData && (
  <div className="space-y-4">
    <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/20">
      <h3 className="text-lg font-semibold text-purple-200 mb-4">Created Token Details</h3>
      
      {/* Token Details Grid */}
      <div className="grid gap-4">
        {/* Address */}
        <div className="p-3 bg-purple-900/30 rounded-lg">
          <p className="text-sm text-purple-200">
            <span className="font-semibold">Address:</span> 
            <span className="ml-2 font-mono">{createdTokenData.mintAddress}</span>
          </p>
        </div>
        
        {/* Name with warning */}
        <div className="p-3 bg-purple-900/30 rounded-lg flex items-center justify-between">
          <p className="text-sm text-purple-200">
            <span className="font-semibold">Name:</span> 
            <span className="ml-2">{createdTokenData.name}</span>
          </p>
          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
            Not yet on-chain
          </span>
        </div>
        
        {/* Symbol with warning */}
        <div className="p-3 bg-purple-900/30 rounded-lg flex items-center justify-between">
          <p className="text-sm text-purple-200">
            <span className="font-semibold">Symbol:</span> 
            <span className="ml-2">{createdTokenData.symbol}</span>
          </p>
          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
            Not yet on-chain
          </span>
        </div>
        
        {/* Supply */}
        <div className="p-3 bg-purple-900/30 rounded-lg">
          <p className="text-sm text-purple-200">
            <span className="font-semibold">Supply:</span> 
            <span className="ml-2">{createdTokenData.supply.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <a
          href={`https://solscan.io/token/${createdTokenData.mintAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          View on Solscan
        </a>
        <TokenPDFGenerator tokenData={createdTokenData} />
      </div>
    </div>

    {/* Next Steps Card */}
    <div className="p-4 rounded-xl bg-[#1D0F35] border border-purple-500/20">
      <p className="text-sm text-center text-purple-200">
        Click "Add Metadata" below to register your token's name and symbol on-chain
      </p>
    </div>
  </div>
)}

        {message && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-sm text-center text-purple-200">{message}</p>
          </div>
        )}

        {step <= 2 && (
          <div className="p-4 rounded-xl bg-[#1D0F35] border border-purple-500/20">
            <CostEstimate />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <>
              {step === 1 
                ? "Step 1: Confirm Details" 
                : step === 2 
                  ? "Step 2: Create Token" 
                  : "Step 3: Add Metadata"
              }
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
