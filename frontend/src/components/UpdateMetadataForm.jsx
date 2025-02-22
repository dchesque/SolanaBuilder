import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Globe,
  Twitter,
  Github,
  Send,
  Wallet,
  RotateCcw,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import CostEstimate from "./CostEstimate";
import WalletConnect from "./WalletConnect";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_NAME_LENGTH = 32;
const MAX_SYMBOL_LENGTH = 10;
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Função para logging detalhado
const logWithDetails = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log('Dados:', JSON.stringify(data, null, 2));
  }
};

// Função utilitária para tentar uma operação com backoff exponencial
const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logWithDetails(`Tentativa ${attempt + 1} de ${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error;
      const delay = baseDelay * Math.pow(2, attempt);
      logWithDetails(`Tentativa ${attempt + 1} falhou. Tentando novamente em ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

// Função utilitária para verificar se os metadados mudaram
const hasMetadataChanged = (currentMetadata, newMetadata) => {
  return (
    currentMetadata.name !== newMetadata.name ||
    currentMetadata.symbol !== newMetadata.symbol ||
    currentMetadata.uri !== newMetadata.uri
  );
};

function UpdateMetadataForm() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;

  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [metadataExists, setMetadataExists] = useState(false);
  const [formData, setFormData] = useState({
    mintAddress: "",
    name: "",
    symbol: "",
    description: "",
    imageUrl: "",
    website: "",
    twitter: "",
    telegram: "",
    github: ""
  });
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: null,
    feeConfirmed: false,
    progress: 0,
    showPreview: false
  });

  // Carrega o mint address a partir dos parâmetros da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenAddress = urlParams.get("tokenAddress");
    if (tokenAddress) {
      setFormData((prev) => ({ ...prev, mintAddress: tokenAddress }));
    }
  }, []);

  // Ao alterar o mintAddress, carrega os metadados atuais
  useEffect(() => {
    if (formData.mintAddress) {
      loadCurrentMetadata(formData.mintAddress);
    }
  }, [formData.mintAddress]);

  // Exibe a preview da imagem se a URL for válida
  useEffect(() => {
    if (formData.imageUrl && validateUrl(formData.imageUrl)) {
      setStatus((prev) => ({ ...prev, showPreview: true }));
    } else {
      setStatus((prev) => ({ ...prev, showPreview: false }));
    }
  }, [formData.imageUrl]);

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  const handleInputChange = (e) => {
    if (status.feeConfirmed) return;
    const { name, value } = e.target;

    // Limitar tamanho dos campos
    switch (name) {
      case "name":
        if (value.length > MAX_NAME_LENGTH) return;
        break;
      case "symbol":
        if (value.length > MAX_SYMBOL_LENGTH) return;
        break;
      case "description":
        if (value.length > MAX_DESCRIPTION_LENGTH) return;
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    if (status.loading && !window.confirm("Uma operação está em andamento. Deseja realmente resetar?")) {
      return;
    }
    setFormData({
      mintAddress: "",
      name: "",
      symbol: "",
      description: "",
      imageUrl: "",
      website: "",
      twitter: "",
      telegram: "",
      github: ""
    });
    setStatus({
      loading: false,
      message: "",
      error: null,
      feeConfirmed: false,
      progress: 0,
      showPreview: false
    });
    setShowSocialLinks(false);
    setMetadataExists(false);
  };

  const loadCurrentMetadata = async (mintAddress) => {
    try {
      logWithDetails('Iniciando carregamento de metadados para:', mintAddress);
      const mintPubkey = new PublicKey(mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));

      // Verifica se o token existe
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      if (!mintInfo) {
        throw new Error("Token não encontrado");
      }
      logWithDetails('Informações do token encontradas:', mintInfo);

      // Verifica se é um token SPL válido
      if (!mintInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        throw new Error("Token inválido: não é um token SPL");
      }

      // Tenta carregar os metadados existentes
      const pda = metaplex.nfts().pdas().metadata({ mint: mintPubkey });
      const metadataAccount = await connection.getAccountInfo(pda);
      logWithDetails('Conta de metadados:', metadataAccount);

      if (metadataAccount) {
        setMetadataExists(true);
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        logWithDetails('NFT encontrado:', nft);

        if (nft.uri) {
          try {
            const response = await fetch(nft.uri);
            const metadata = await response.json();
            logWithDetails('Metadados do URI:', metadata);
            
            setFormData((prev) => ({
              ...prev,
              name: nft.name || "",
              symbol: nft.symbol || "",
              description: metadata.description || "",
              imageUrl: metadata.image || "",
              website: metadata.external_url || metadata.links?.website || "",
              twitter: metadata.links?.twitter || "",
              telegram: metadata.links?.telegram || "",
              github: metadata.links?.github || ""
            }));
          } catch (uriError) {
            logWithDetails('Erro ao carregar o URI dos metadados:', uriError);
            setFormData((prev) => ({
              ...prev,
              name: nft.name || "",
              symbol: nft.symbol || ""
            }));
          }
        }

        setStatus((prev) => ({
          ...prev,
          message: "Metadados atuais carregados com sucesso.",
          error: null
        }));
      } else {
        setMetadataExists(false);
        setStatus((prev) => ({
          ...prev,
          message: "Nenhum metadado encontrado para este token. Você pode criar novos metadados.",
          error: null
        }));
      }
    } catch (error) {
      logWithDetails('Erro em loadCurrentMetadata:', error);
      setStatus((prev) => ({
        ...prev,
        error: `Erro ao carregar metadados: ${error.message}`
      }));
    }
  };

  const handleConfirmDetails = async (e) => {
    e.preventDefault();
    
    try {
      if (!publicKey) {
        setStatus((prev) => ({
          ...prev,
          message: "Por favor, conecte sua carteira para continuar.",
          error: null
        }));
        return;
      }
  
      if (!formData.mintAddress) {
        setStatus((prev) => ({
          ...prev,
          error: "O endereço do token é obrigatório"
        }));
        return;
      }
  
      // Verifica o saldo da carteira antes de prosseguir
      const balance = await connection.getBalance(publicKey);
const requiredBalance = SERVICE_FEE * 1e9; // Apenas a taxa de serviço
if (balance < requiredBalance) {
  setStatus((prev) => ({
    ...prev,
    error: `Saldo insuficiente. Você precisa de pelo menos ${(requiredBalance / 1e9).toFixed(4)} SOL na sua carteira.`
  }));
  return;
}
  
      setStatus((prev) => ({ 
        ...prev, 
        loading: true, 
        message: "Processando taxa de serviço...", 
        error: null,
        progress: 25
      }));
  
      // Criar a transação
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(SERVICE_WALLET),
          lamports: SERVICE_FEE * 1e9,
        })
      );
  
      // Configurar a transação
      transaction.feePayer = publicKey;
      const blockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;
  
      // Enviar a transação
      logWithDetails('Enviando transação de taxa de serviço');
      const signature = await sendTransaction(transaction, connection);
      logWithDetails('Taxa de serviço - Assinatura da transação:', signature);
  
      // Aguardar confirmação com retry
      let confirmed = false;
      for (let i = 0; i < 3; i++) {
        try {
          await connection.confirmTransaction({
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight
          }, 'confirmed');
          confirmed = true;
          break;
        } catch (err) {
          logWithDetails(`Tentativa ${i + 1} de confirmar transação falhou:`, err);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
  
      if (!confirmed) {
        throw new Error("Não foi possível confirmar a transação após várias tentativas");
      }
  
      logWithDetails('Taxa de serviço confirmada');
  
      setStatus((prev) => ({
        ...prev,
        loading: false,
        message: "Taxa de serviço confirmada. Agora você pode atualizar os metadados do token.",
        error: null,
        feeConfirmed: true,
        progress: 50
      }));
  
    } catch (err) {
      logWithDetails('Erro ao processar taxa de serviço:', err);
      
      let errorMessage = "Erro ao processar a taxa de serviço: ";
      
      if (err.message?.includes("User rejected")) {
        errorMessage += "Transação rejeitada pelo usuário.";
      } else if (err.InsufficientFundsForRent) {
        errorMessage += "Saldo insuficiente para cobrir o rent da conta.";
      } else {
        errorMessage += err.message || "Erro desconhecido";
      }
  
      setStatus((prev) => ({
        ...prev,
        loading: false,
        message: "",
        error: errorMessage,
        progress: 0
      }));
    }
  };

  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    try {
      if (!publicKey) {
        throw new Error("Carteira não conectada. Por favor, conecte sua carteira.");
      }
      if (!formData.mintAddress) {
        throw new Error("O endereço do token é obrigatório");
      }
      if (!formData.name || !formData.symbol) {
        throw new Error("Nome e símbolo do token são obrigatórios");
      }
  
      logWithDetails(
        "Iniciando processo de atualização/criação de metadados para token fungível SPL com 9 decimais",
        formData
      );
  
      const mintPubkey = new PublicKey(formData.mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
  
      // Verifica se o token existe e se é um token SPL
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      if (!mintInfo) {
        throw new Error("Token não encontrado");
      }
      if (!mintInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        throw new Error("Token inválido: não é um token SPL");
      }
      logWithDetails("Token validado:", mintInfo);
  
      // Prepara o JSON de metadados
      const metadataJson = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUrl,
        external_url: formData.website,
        properties: {
          files: formData.imageUrl
            ? [
                {
                  uri: formData.imageUrl,
                  type: "image/png",
                },
              ]
            : [],
          category: "image",
        },
        links: {
          website: formData.website || null,
          twitter: formData.twitter || null,
          telegram: formData.telegram || null,
          github: formData.github || null,
        },
      };
  
      setStatus((prev) => ({
        ...prev,
        loading: true,
        message: "Fazendo upload dos metadados...",
        progress: 70,
      }));
  
      const { uri } = await retryOperation(async () => {
        logWithDetails("Iniciando upload de metadados");
        return await metaplex.nfts().uploadMetadata(metadataJson);
      });
      logWithDetails("Upload de metadados concluído. URI:", uri);
  
      // Tenta carregar os metadados atuais
      let currentMetadata;
      try {
        currentMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        logWithDetails("Metadados atuais encontrados:", currentMetadata);
      } catch (err) {
        logWithDetails("Nenhum metadado encontrado, preparando para criar novos metadados");
      }
  
      setStatus((prev) => ({
        ...prev,
        message: currentMetadata ? "Atualizando metadados..." : "Criando novos metadados...",
        progress: 85,
      }));
  
      if (!currentMetadata) {
        // Criação de metadados para token fungível: sempre usar createSft()
        logWithDetails(
          "Nenhum metadado encontrado. Criando metadados via metaplex.nfts().createSft()"
        );
        let newSft;
        try {
          newSft = await metaplex.nfts().createSft({
            useNewMint: false,
            tokenExists: true,
            tokenOwner: publicKey,
            payer: publicKey,
            mintAuthority: publicKey,
            updateAuthority: publicKey,
            mintAddress: mintPubkey,
            name: formData.name,
            symbol: formData.symbol,
            uri: uri,
            sellerFeeBasisPoints: 0,
            isMutable: true,
          });
          logWithDetails("SFT criado com metadados:", newSft);
          setStatus((prev) => ({
            ...prev,
            loading: false,
            message: "Metadados criados com sucesso!",
            error: null,
            feeConfirmed: false,
            progress: 100,
          }));
          return { signature: newSft.response.signature };
        } catch (error) {
          logWithDetails("Erro na criação de SFT:", error);
          throw new Error("Falha ao criar metadados: " + error.message);
        }
      } else {
        // Fluxo de atualização para tokens que já possuem metadados
        logWithDetails("Iniciando atualização de metadados existentes");
        const updateResponse = await retryOperation(async () => {
          return await metaplex.nfts().update(
            {
              nftOrSft: currentMetadata,
              name: formData.name,
              symbol: formData.symbol,
              uri: uri,
              sellerFeeBasisPoints: currentMetadata.sellerFeeBasisPoints,
              creators: currentMetadata.creators,
              isMutable: true,
              primarySaleHappened: currentMetadata.primarySaleHappened,
              collection: currentMetadata.collection,
            },
            { commitment: "confirmed" }
          );
        });
        logWithDetails("Resposta da atualização:", updateResponse);
        await connection.confirmTransaction(updateResponse.response.signature, "confirmed");
        logWithDetails("Transação de atualização confirmada");
      }
  
      setStatus((prev) => ({
        ...prev,
        loading: false,
        message: `Metadados do token atualizados com sucesso!`,
        error: null,
        feeConfirmed: false,
        progress: 100,
      }));
  
      setTimeout(() => {
        handleReset();
      }, 3000);
    } catch (error) {
      logWithDetails("Erro durante o processo:", error);
      let errorMessage = "Erro ao atualizar metadados: " + error.message;
      if (error.message.includes("Not enough accounts")) {
        errorMessage =
          "Erro: Conta de metadados não encontrada. Verifique se o token foi criado corretamente.";
      } else if (error.message.includes("Invalid authority")) {
        errorMessage = "Erro: Você não tem autoridade para modificar este token.";
      } else if (error.message.includes("Unable to serialize")) {
        errorMessage =
          "Erro: Dados inválidos nos metadados. Verifique os campos preenchidos.";
      }
      setStatus((prev) => ({
        ...prev,
        loading: false,
        message: "",
        error: errorMessage,
        progress: 0,
      }));
    }
  };
  

  // Se a carteira não estiver conectada, exibe o componente de conexão
  if (!publicKey) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Conecte sua Carteira
        </h2>
        <p className="text-center text-sm text-purple-200/80 mb-8">
          Conecte sua carteira Solana para atualizar as informações do seu token.
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
    <div className="w-full">
      <form 
        onSubmit={!status.feeConfirmed ? handleConfirmDetails : handleUpdateMetadata} 
        className="space-y-6"
      >
        {/* Token Address (Mint) */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">
            Token Address (Mint) *
          </label>
          <input
            type="text"
            name="mintAddress"
            value={formData.mintAddress}
            onChange={handleInputChange}
            placeholder="Digite o endereço do seu token"
            required
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Token Name */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">
            Token Name * 
            <span className="text-xs ml-2 text-purple-300">
              ({formData.name.length}/{MAX_NAME_LENGTH})
            </span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nome atualizado do token"
            required
            maxLength={MAX_NAME_LENGTH}
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Token Symbol */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">
            Token Symbol * 
            <span className="text-xs ml-2 text-purple-300">
              ({formData.symbol.length}/{MAX_SYMBOL_LENGTH})
            </span>
          </label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleInputChange}
            placeholder="Símbolo atualizado do token"
            required
            maxLength={MAX_SYMBOL_LENGTH}
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">
            Description *
            <span className="text-xs ml-2 text-purple-300">
              ({formData.description.length}/{MAX_DESCRIPTION_LENGTH})
            </span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrição atualizada do token"
            required
            rows="3"
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="w-full rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Token Image URL */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">Token Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://exemplo.com/imagem.png"
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
          {status.showPreview && (
            <div className="mt-2 p-2 rounded-xl bg-[#1D0F35] border border-purple-500/20">
              <img
                src={formData.imageUrl}
                alt="Token Preview"
                className="max-h-40 mx-auto rounded-lg"
                onError={() => setStatus((prev) => ({ ...prev, showPreview: false }))}
              />
            </div>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://seusite.com"
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Sessão de Links Sociais */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowSocialLinks(!showSocialLinks)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Social Links
            </span>
            {showSocialLinks ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showSocialLinks && (
            <div className="space-y-4 animate-fadeIn">
              {/* Twitter */}
              <div>
                <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> Twitter
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/seutoken"
                  className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
              {/* Telegram */}
              <div>
                <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Telegram
                </label>
                <input
                  type="url"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  placeholder="https://t.me/seutoken"
                  className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
              {/* GitHub */}
              <div>
                <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
                  <Github className="w-4 h-4" /> GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/seutoken"
                  className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Estimativa de Custo */}
        <div className="rounded-xl bg-[#1D0F35] border border-purple-500/20 p-4">
          <CostEstimate />
        </div>

        {/* Mensagens de Status */}
        {status.message && (
          <div className="p-4 rounded-xl bg-[#1D0F35] border border-purple-500/20">
            <p className="text-yellow-400 text-sm text-center">{status.message}</p>
          </div>
        )}
        {status.error && (
          <div className="p-4 rounded-xl bg-[#1D0F35] border border-red-500/20">
            <p className="text-red-400 text-sm text-center">{status.error}</p>
          </div>
        )}

        {/* Botão de Reset */}
        {Object.values(formData).some((value) => value) && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Form
          </button>
        )}

        {/* Botão de Submit */}
        <button
          type="submit"
          disabled={status.loading}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processando...
            </div>
          ) : (
            <>
              {!status.feeConfirmed ? (
                <>Step 1: Confirmar Detalhes</>
              ) : (
                <>Step 2: Atualizar Metadados</>
              )}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default UpdateMetadataForm;
