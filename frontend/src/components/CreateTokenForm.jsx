import React, { useState } from "react";
import { ArrowRight, FileEdit, Wallet, HelpCircle } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import WalletConnect from "./WalletConnect";
import CostEstimate from "./CostEstimate";
import TokenFeatureToggle from './TokenFeatureToggle';
import {
  Transaction,
  SystemProgram,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);

function CreateTokenForm() {
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
    metadata: false
  });

  const validateTicker = (ticker) => {
    if (!ticker) return "";
    if (ticker.length > 6) {
      return "Ticker must be a maximum of 6 characters.";
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

  const handleConfirmDetails = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      setMessage("Please connect your wallet to proceed.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Confirming details and processing the service fee...");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(SERVICE_WALLET),
          lamports: SERVICE_FEE * 1e9,
        })
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStep(2);
      setMessage("Details confirmed successfully! You can now create your token.");
    } catch (err) {
      console.error(err);
      setMessage("Error confirming details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
      const mintKeypair = Keypair.generate();
      const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: lamportsForMint,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      });

      const initMintIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        0,
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

      const mintAmount = Number(supply);
      if (isNaN(mintAmount)) {
        throw new Error("Supply must be a valid number.");
      }

      const mintToIx = createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAddress,
        publicKey,
        mintAmount
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

      try {
        await connection.confirmTransaction(signature, "confirmed");
      } catch (confirmError) {
        if (
          confirmError.message &&
          confirmError.message.includes("Transaction was not confirmed in 30.00 seconds")
        ) {
          console.warn("Transaction confirmation timed out, but token might have been created.");
        } else {
          throw confirmError;
        }
      }

      navigate("/token-details", {
        state: {
          tokenAddress: mintKeypair.publicKey.toString(),
          tokenName: nomeToken,
          ticker: ticker,
          supply: mintAmount,
          features: tokenFeatures
        },
      });

      setMessage(
        `Token created successfully!\nAddress: ${mintKeypair.publicKey.toString()}\nName: ${nomeToken}\nTicker: ${ticker}`
      );
    } catch (err) {
      console.error(err);
      setMessage("Error creating token: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        Launch Your Own Solana Token
      </h1>
      <p className="text-center text-sm text-purple-200/80 mb-8">
        Empower your brand or community on the fast and low-cost Solana network.
        Create and launch your token in two steps.
      </p>

      <form onSubmit={step === 1 ? handleConfirmDetails : handleCreateToken} className="space-y-6">
        <div>
          <label className="block text-sm mb-2 text-purple-200">Token Name</label>
          <input
            type="text"
            placeholder="Ex: My Awesome Token"
            value={nomeToken}
            onChange={(e) => setNomeToken(e.target.value)}
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            disabled={step === 2}
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-purple-200">Ticker</label>
          <input
            type="text"
            placeholder="Ex: MAT"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className={`w-full h-12 rounded-xl bg-[#1D0F35] border ${
              tickerError ? "border-red-500" : "border-purple-500/20"
            } px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all`}
            disabled={step === 2}
          />
          {tickerError && <p className="text-xs text-red-400 mt-1">{tickerError}</p>}
        </div>

        <div>
          <label className="block text-sm mb-2 text-purple-200">Supply</label>
          <input
            type="number"
            placeholder="Ex: 1000000"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            disabled={step === 2}
          />
          {formattedSupply && (
            <p className="text-xs text-purple-300/80 mt-1">
              You are creating <span className="font-medium text-purple-300">{formattedSupply}</span> tokens
            </p>
          )}
        </div>

        {/* Token Features Section - Commented Out
        <div>
          <label className="block text-sm mb-4 text-purple-200">Token Features</label>
          <div className="grid grid-cols-2 gap-4">
            <TokenFeatureToggle
              label="Mintable"
              tooltipInfo="Allows creating new tokens after initial minting. Only the token creator can issue new tokens."
              isChecked={tokenFeatures.mintable}
              onChange={(e) => setTokenFeatures({
                ...tokenFeatures, 
                mintable: e.target.checked
              })}
              disabled={step === 2}
            />
            <TokenFeatureToggle
              label="Burnable"
              tooltipInfo="Enables token destruction, reducing the total supply. Useful for inflation control."
              isChecked={tokenFeatures.burnable}
              onChange={(e) => setTokenFeatures({
                ...tokenFeatures, 
                burnable: e.target.checked
              })}
              disabled={step === 2}
            />
            <TokenFeatureToggle
              label="Freezable"
              tooltipInfo="Allows freezing tokens in a specific account, temporarily preventing transfers."
              isChecked={tokenFeatures.freezable}
              onChange={(e) => setTokenFeatures({
                ...tokenFeatures, 
                freezable: e.target.checked
              })}
              disabled={step === 2}
            />
            <TokenFeatureToggle
              label="Metadata"
              tooltipInfo="Adds custom metadata to the token, such as description, image, or specific properties."
              isChecked={tokenFeatures.metadata}
              onChange={(e) => setTokenFeatures({
                ...tokenFeatures, 
                metadata: e.target.checked
              })}
              disabled={step === 2}
            />
          </div>
        </div>
        */}

        {message && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-sm text-center text-purple-200">{message}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-[#1D0F35] border border-purple-500/20">
          <CostEstimate />
        </div>

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
              {step === 1 ? "Step 1: Confirm Details" : "Step 2: Create Token"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateTokenForm;