// CreateTokenForm.jsx
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import CostEstimate from "./CostEstimate";
import {
  Transaction,
  SystemProgram,
  Keypair,
  PublicKey, // Adicionado para corrigir o erro
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);

function validateTicker(ticker) {
  if (!ticker) return ""; // Nenhuma mensagem se vazio
  if (ticker.length > 6) {
    return "Ticker must be a maximum of 6 characters.";
  }
  return "";
}

function CreateTokenForm() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const navigate = useNavigate();

  const [nomeToken, setNomeToken] = useState("");
  const [ticker, setTicker] = useState("");
  const [supply, setSupply] = useState("");
  const [step, setStep] = useState(1); // Controle de Step
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const tickerError = validateTicker(ticker);

  const formatSupply = (supply) => {
    const num = Number(supply);
    if (isNaN(num) || num <= 0) return "";
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
    return num.toString();
  };

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
          lamports: SERVICE_FEE * 1e9, // Converte SOL para lamports
        })
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setStep(2); // Avança para Step 2 após confirmar a taxa
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

      // Tenta confirmar a transação. Se ocorrer timeout, verifica se é o erro esperado.
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

      setMessage(
        `Token created successfully!\nAddress: ${mintKeypair.publicKey.toString()}\nName: ${nomeToken}\nTicker: ${ticker}`
      );

      // Redireciona para a página de detalhes do token,
      // passando os dados via state: endereço, nome, ticker e supply
      navigate("/token-details", {
        state: {
          tokenAddress: mintKeypair.publicKey.toString(),
          tokenName: nomeToken,
          ticker: ticker,
          supply: mintAmount,
        },
      });
    } catch (err) {
      console.error(err);
      setMessage("Error creating token: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-[#1a012c] bg-opacity-90 rounded-xl p-6 shadow-xl border border-[#512d5a] animate-fadeIn">
      <h1 className="text-3xl font-extrabold text-center mb-2 text-pink-300">
        Launch Your Own Solana Token
      </h1>
      <p className="text-center text-sm text-pink-200 mb-6">
        Empower your brand or community on the fast and low-cost Solana network.
        Create and launch your token in two steps.
      </p>

      <form
        onSubmit={step === 1 ? handleConfirmDetails : handleCreateToken}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm mb-1 text-pink-200">Token Name</label>
          <input
            type="text"
            placeholder="Ex: My Awesome Token"
            value={nomeToken}
            onChange={(e) => setNomeToken(e.target.value)}
            className="w-full rounded-md bg-[#11001c] border border-[#3b2153] px-3 py-2 text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            disabled={step === 2}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-pink-200">Ticker</label>
          <input
            type="text"
            placeholder="Ex: MAT"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className={`w-full rounded-md bg-[#11001c] border ${
              tickerError ? "border-red-500" : "border-[#3b2153]"
            } px-3 py-2 text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 ${
              tickerError ? "focus:ring-red-500" : "focus:ring-pink-500"
            } focus:border-transparent transition`}
            disabled={step === 2}
          />
          {tickerError && <p className="text-xs text-red-500 mt-1">{tickerError}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1 text-pink-200">Supply</label>
          <input
            type="number"
            placeholder="Ex: 1000000"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            className="w-full rounded-md bg-[#11001c] border border-[#3b2153] px-3 py-2 text-pink-100 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            disabled={step === 2}
          />
          {formattedSupply && (
            <p className="text-xs text-pink-300 mt-1">
              You are creating <span className="font-semibold">{formattedSupply}</span> tokens
            </p>
          )}
        </div>

        {message && <p className="text-sm text-center text-yellow-400">{message}</p>}

        {/* Estimativa de Custo */}
        <div className="mb-6 bg-[#2b1740] bg-opacity-50 rounded-lg p-4 border border-[#6e3d76] shadow-sm text-center">
          <CostEstimate />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition shadow-md hover:shadow-lg"
          disabled={loading}
        >
          {loading ? "Processing..." : step === 1 ? "Step 1: Confirm Details" : "Step 2: Create Token"}{" "}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default CreateTokenForm;
