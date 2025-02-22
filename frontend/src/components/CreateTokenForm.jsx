import React, { useState } from "react";
import { ArrowRight, FileEdit, Wallet, HelpCircle } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import WalletConnect from "./WalletConnect";
import CostEstimate from "./CostEstimate";
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

  // Variáveis para armazenar os dados do token criado
  const [createdTokenData, setCreatedTokenData] = useState(null);

  const validateTicker = (ticker) => {
    if (!ticker) return "";
    if (ticker.length > 6) {
      return "Ticker deve ter no máximo 6 caracteres.";
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

  // STEP 1: Confirmar detalhes e processar taxa de serviço
  const handleConfirmDetails = async (e) => {
    e.preventDefault();
  
    // Logs detalhados para verificação
    console.log('Verificação de Variáveis de Ambiente:');
    console.log('SERVICE_WALLET:', SERVICE_WALLET);
    console.log('SERVICE_WALLET tipo:', typeof SERVICE_WALLET);
    console.log('SERVICE_FEE:', SERVICE_FEE);
    console.log('SERVICE_FEE tipo:', typeof SERVICE_FEE);
  
    // Verificação das variáveis de ambiente
    if (!SERVICE_WALLET) {
      setMessage("Erro: Endereço da carteira de serviço não configurado.");
      return;
    }
  
    if (!SERVICE_FEE || isNaN(SERVICE_FEE)) {
      setMessage("Erro: Taxa de serviço inválida.");
      return;
    }
  
    if (!publicKey) {
      setMessage("Por favor, conecte sua carteira para continuar.");
      return;
    }
  
    try {
      setLoading(true);
      setMessage("Confirmando detalhes e processando a taxa de serviço...");
  
      // Converte a taxa de serviço para lamports (1 SOL = 1 bilhão de lamports)
      const serviceFeeInLamports = Math.ceil(SERVICE_FEE * 1_000_000_000);
  
      const walletBalance = await connection.getBalance(publicKey);
      const balanceInSOL = walletBalance / 1_000_000_000; // Converte lamports para SOL
  
      console.log('Detalhes do Saldo da Carteira:');
      console.log('Saldo em Lamports:', walletBalance);
      console.log('Saldo em SOL:', balanceInSOL);
      console.log('Taxa de Serviço em Lamports:', serviceFeeInLamports);
  
      const serviceWalletPublicKey = new PublicKey(SERVICE_WALLET);
      
      console.log('Chave Pública da Carteira de Serviço:', serviceWalletPublicKey.toBase58());
  
      // Verificação de saldo
      if (walletBalance < serviceFeeInLamports) {
        setMessage(`Saldo insuficiente. Necessário: ${serviceFeeInLamports / 1_000_000_000} SOL, Disponível: ${balanceInSOL} SOL`);
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
      
      console.log('Assinatura da Transação:', signature);
  
      await connection.confirmTransaction(signature, "confirmed");
  
      setStep(2);
      setMessage("Detalhes confirmados com sucesso! Agora você pode criar seu token.");
    } catch (err) {
      console.error('Erro detalhado em handleConfirmDetails:', err);
      
      let errorMessage = "Erro ao confirmar detalhes: ";
      
      if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Ocorreu um erro desconhecido";
      }
  
      // Adiciona logs de erro mais detalhados
      if (err.logs) {
        console.error('Logs da Transação:', err.logs);
      }
  
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Criar o token na rede Solana
  const handleCreateToken = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      setMessage("Por favor, conecte sua carteira para continuar.");
      return;
    }

    if (tickerError) {
      setMessage(tickerError);
      return;
    }

    setLoading(true);
    setMessage("Criando token na rede Solana...");

    try {
      // Gerar o mint do token
      const mintKeypair = Keypair.generate();
      const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      // Garantir que o supply seja sempre maior que 1000 para usar 9 decimais
      let humanSupply = Number(supply);
      if (isNaN(humanSupply) || humanSupply < 1000) {
        humanSupply = 1000;
        setSupply("1000");
      }

      // Sempre usamos 9 decimais
      const tokenDecimals = 9;
      
      // Valor on-chain (converte o valor "human-readable" para a quantidade real)
      const onChainSupply = humanSupply * 10 ** tokenDecimals;

      console.log('Criando token com os seguintes parâmetros:');
      console.log('Mint Address:', mintKeypair.publicKey.toString());
      console.log('Nome:', nomeToken);
      console.log('Símbolo:', ticker);
      console.log('Supply:', humanSupply);
      console.log('Decimais:', tokenDecimals);

      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: lamportsForMint,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      });

      // Inicializa o mint com os decimais definidos
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
      console.log('Token criado com sucesso! Assinatura:', signature);

      try {
        await connection.confirmTransaction(signature, "confirmed");
        
        // Salvar os dados do token para uso na etapa 3
        setCreatedTokenData({
          mintAddress: mintKeypair.publicKey.toString(),
          name: nomeToken,
          symbol: ticker,
          supply: humanSupply,
          decimals: tokenDecimals
        });
        
        setStep(3);
        setMessage("Token criado com sucesso! Agora vamos adicionar os metadados.");
      } catch (confirmError) {
        if (
          confirmError.message &&
          confirmError.message.includes("Transaction was not confirmed in 30.00 seconds")
        ) {
          console.warn("Timeout na confirmação da transação, mas o token pode ter sido criado.");
          
          // Salvar os dados mesmo no caso de timeout, pois o token provavelmente foi criado
          setCreatedTokenData({
            mintAddress: mintKeypair.publicKey.toString(),
            name: nomeToken,
            symbol: ticker,
            supply: humanSupply,
            decimals: tokenDecimals
          });
          
          setStep(3);
          setMessage("Possível timeout na confirmação, mas o token pode ter sido criado. Tentando adicionar metadados...");
        } else {
          throw confirmError;
        }
      }
    } catch (err) {
      console.error('Erro ao criar token:', err);
      setMessage("Erro ao criar token: " + err.message);
    } finally {
      setLoading(false);
    }
  };

 // STEP 3: Adicionar metadados ao token usando Metaplex
// STEP 3: Adicionar metadados ao token usando Metaplex
const handleAddMetadata = async (e) => {
  e.preventDefault();

  if (!publicKey || !createdTokenData) {
    setMessage("Dados do token não encontrados. Por favor, crie o token primeiro.");
    return;
  }

  setLoading(true);
  setMessage("Calculando custos e adicionando metadados ao token...");

  try {
    // Initialize Metaplex
    const metaplex = new Metaplex(connection);
    metaplex.use(walletAdapterIdentity({ publicKey, sendTransaction }));

    console.log('Preparando criação de metadados on-chain...');
    
    const mintAddress = new PublicKey(createdTokenData.mintAddress);
    
    // Encontrar o endereço PDA dos metadados
    const metadataPDA = await metaplex.nfts().pdas().metadata({ mint: mintAddress });
    
    console.log('Endereço PDA dos metadados:', metadataPDA.toBase58());
    
    // Preparar dados para a criação da instrução de metadados
    const metadataData = {
      name: createdTokenData.name,
      symbol: createdTokenData.symbol,
      uri: "", // URI vazio, sem fazer upload para o Arweave
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    };
    
    // Calcular o espaço necessário para os metadados
    // Este é um valor aproximado baseado no tamanho dos metadados
    const metadataSize = 1 + // chave de discriminador
                       32 + // mintKey
                       32 + // updateAuthority
                       createdTokenData.name.length + 4 + // string name (prefixado com tamanho)
                       createdTokenData.symbol.length + 4 + // string symbol (prefixado com tamanho)
                       4 + // string uri (vazio, mas ainda tem o prefixo de tamanho)
                       2 + // seller fee basis points
                       1 + // Boolean has creators
                       1 + // Boolean has collection
                       1 + // Boolean has uses
                       1; // extra byte para possíveis extensões
    
    console.log('Tamanho estimado dos metadados (bytes):', metadataSize);
    
    // Calcular o custo de rent para este tamanho
    const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(metadataSize);
    
    console.log('Custo de rent exemption (lamports):', rentExemptionAmount);
    console.log('Custo de rent exemption (SOL):', rentExemptionAmount / 1_000_000_000);
    
    // Criar a instrução de criação de metadados
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
    
    // Criar e enviar a transação
    const transaction = new Transaction().add(createMetadataInstruction);
    
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    // Estimar as taxas
    const { feeCalculator } = await connection.getRecentBlockhash();
    const fees = await transaction.getEstimatedFee(connection);
    
    console.log('Taxa estimada da transação (lamports):', fees);
    console.log('Taxa estimada da transação (SOL):', fees / 1_000_000_000);
    
    console.log('Custo total estimado (SOL):', (rentExemptionAmount + fees) / 1_000_000_000);
    
    // Confirmar com o usuário se deseja prosseguir
    setMessage(`O custo total estimado é de ${((rentExemptionAmount + fees) / 1_000_000_000).toFixed(6)} SOL. Deseja continuar?`);
    
    // Aqui você poderia adicionar um diálogo de confirmação antes de prosseguir
    
    const signature = await sendTransaction(transaction, connection);
    console.log('Metadados criados com sucesso! Assinatura:', signature);
    
    // Aguardar confirmação
    await connection.confirmTransaction(signature, "confirmed");
    
    // Navegar para a página de detalhes do token
    navigate("/token-details", {
      state: {
        tokenAddress: createdTokenData.mintAddress,
        tokenName: createdTokenData.name,
        ticker: createdTokenData.symbol,
        supply: createdTokenData.supply,
        decimals: createdTokenData.decimals
      }
    });

    setMessage(`Token e metadados criados com sucesso!`);
  } catch (err) {
    console.error('Erro detalhado ao adicionar metadados:', err);
    
    // Verificar se é possível continuar sem metadados
    if (err.message.includes("already has metadata") || err.message.includes("already exists")) {
      setMessage("Parece que os metadados já existem. Redirecionando para a página de detalhes...");
      
      // Navegar para a página de detalhes do token mesmo sem os metadados
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
      setMessage("Erro ao adicionar metadados: " + err.message);
    }
  } finally {
    setLoading(false);
  }
};

// FIM STEP 3

  // Wallet not connected
  if (!publicKey) {
    return (
      <div className="bg-[#150929] rounded-3xl p-10 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Conecte Sua Carteira
        </h1>
        <p className="text-center text-sm text-purple-200/80 mb-8">
          Conecte sua carteira Solana para começar a criar seu token.
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
        Crie Seu Próprio Token Solana
      </h1>
      <p className="text-center text-sm text-purple-200/80 mb-8">
        Empodere sua marca ou comunidade na rápida e de baixo custo rede Solana.
        Crie e lance seu token em três etapas simples.
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
              <label className="block text-sm mb-2 text-purple-200">Nome do Token</label>
              <input
                type="text"
                placeholder="Ex: Meu Token Incrível"
                value={nomeToken}
                onChange={(e) => setNomeToken(e.target.value)}
                className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                disabled={step !== 1}
                required
              />
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
                  Você está criando <span className="font-medium text-purple-300">{formattedSupply}</span> tokens com 9 casas decimais
                </p>
              )}
              <p className="text-xs text-purple-300/70 mt-1">
                Todos os tokens incluem metadados e 9 casas decimais
              </p>
            </div>
          </>
        )}

        {step === 3 && createdTokenData && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-200 mb-2">Detalhes do Token Criado</h3>
              <div className="space-y-2">
                <p className="text-sm text-purple-200">
                  <span className="font-semibold">Endereço:</span> {createdTokenData.mintAddress}
                </p>
                <p className="text-sm text-purple-200">
                  <span className="font-semibold">Nome:</span> {createdTokenData.name}
                </p>
                <p className="text-sm text-purple-200">
                  <span className="font-semibold">Símbolo:</span> {createdTokenData.symbol}
                </p>
                <p className="text-sm text-purple-200">
                  <span className="font-semibold">Supply:</span> {createdTokenData.supply.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-purple-500/20">
              <p className="text-sm text-center text-purple-200">
                Clique em "Adicionar Metadados" para finalizar a criação do seu token.
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
              Processando...
            </div>
          ) : (
            <>
              {step === 1 
                ? "Etapa 1: Confirmar Detalhes" 
                : step === 2 
                  ? "Etapa 2: Criar Token" 
                  : "Etapa 3: Adicionar Metadados"
              }
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}