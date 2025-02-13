import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Edit2, 
  Globe, 
  Twitter, 
  Github, 
  Send, 
  RotateCcw,
  Link as LinkIcon 
} from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import CostEstimate from "./CostEstimate";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;

function UpdateMetadataForm() {
  const { connection } = useConnection();
  const wallet = useSolanaWallet();
  const { publicKey, sendTransaction } = wallet;

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

  // Função para comparar metadados
  const hasMetadataChanged = (currentMetadata, newMetadata) => {
    
    if (!currentMetadata) return true;
    
    return (
      currentMetadata.name !== newMetadata.name ||
      currentMetadata.symbol !== newMetadata.symbol ||
      currentMetadata.uri !== newMetadata.uri
    );
  };

  const loadCurrentMetadata = async (mintAddress) => {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const metaplex = new Metaplex(connection);
      
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
      if (nft) {
        // Carregar os metadados JSON
        const response = await fetch(nft.uri);
        const metadata = await response.json();
        
        setFormData(prev => ({
          ...prev,
          name: nft.name || '',
          symbol: nft.symbol || '',
          description: metadata.description || '',
          imageUrl: metadata.image || '',
          website: metadata.external_url || metadata.links?.website || '',
          twitter: metadata.links?.twitter || '',
          telegram: metadata.links?.telegram || '',
          github: metadata.links?.github || ''
        }));
  
        setStatus(prev => ({
          ...prev,
          message: "Metadados atuais carregados.",
          error: null
        }));
      }
    } catch (error) {
      console.log("Nenhum metadado encontrado ou erro ao carregar:", error);
    }
  };

  // Parse URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenAddress = urlParams.get('tokenAddress');
    
    if (tokenAddress) {
      setFormData(prevData => ({
        ...prevData,
        mintAddress: tokenAddress
      }));
    }
  }, []);

  // Carregar metadados quando o endereço do token mudar
  useEffect(() => {
    if (formData.mintAddress) {
      loadCurrentMetadata(formData.mintAddress);
    }
  }, [formData.mintAddress]);

  // Image preview effect
  useEffect(() => {
    if (formData.imageUrl && validateUrl(formData.imageUrl)) {
      setStatus(prev => ({ ...prev, showPreview: true }));
    } else {
      setStatus(prev => ({ ...prev, showPreview: false }));
    }
  }, [formData.imageUrl]);

  const handleInputChange = (e) => {
    if (status.feeConfirmed) return;
    
    const { name, value } = e.target;
    
    // Validar comprimentos máximos
    switch (name) {
      case 'name':
        if (value.length > MAX_NAME_LENGTH) return;
        break;
      case 'symbol':
        if (value.length > MAX_SYMBOL_LENGTH) return;
        break;
      case 'description':
        if (value.length > MAX_DESCRIPTION_LENGTH) return;
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    if (status.loading) {
      if (!window.confirm('Uma operação está em andamento. Deseja realmente resetar?')) {
        return;
      }
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
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  const retryOperation = async (operation, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  const handleConfirmDetails = async (e) => {
    e.preventDefault();
    
    if (!formData.mintAddress) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: "Endereço do token é obrigatório"
      });
      return;
    }

    // Validate mint address format
    try {
      new PublicKey(formData.mintAddress);
    } catch (err) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: "Formato de endereço do token inválido"
      });
      return;
    }
    
    // Validate URLs
    const urlFields = ['website', 'twitter', 'telegram', 'github', 'imageUrl'];
    const invalidUrls = urlFields.filter(field => 
      formData[field] && !validateUrl(formData[field])
    );

    if (invalidUrls.length > 0) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: `URLs inválidas para: ${invalidUrls.join(', ')}`
      });
      return;
    }

    if (!publicKey) {
      setStatus({
        ...status,
        loading: false,
        message: "Por favor, conecte sua carteira para continuar.",
        error: null
      });
      return;
    }

    // Confirmação do usuário
    if (!window.confirm('Confirma o pagamento da taxa de serviço?')) {
      return;
    }

    try {
      setStatus({ 
        ...status, 
        loading: true, 
        message: "Processando taxa de serviço...", 
        error: null,
        progress: 25
      });

      await retryOperation(async () => {
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
      });

      setStatus({
        loading: false,
        message: "Taxa de serviço confirmada. Você pode atualizar os metadados do token agora.",
        error: null,
        feeConfirmed: true,
        progress: 50
      });
    } catch (err) {
      console.error(err);
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: "Erro ao processar taxa de serviço: " + err.message,
        progress: 0
      });
    }
  };

  const handleUpdateMetadata = async (e) => {
    e.preventDefault();

    if (!publicKey || !status.feeConfirmed) {
      setStatus({
        ...status,
        loading: false,
        message: "Por favor, complete o Passo 1 primeiro.",
        error: null
      });
      return;
    }

    // Validar comprimentos
    if (formData.name.length > MAX_NAME_LENGTH) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: `Nome muito longo. Máximo de ${MAX_NAME_LENGTH} caracteres.`
      });
      return;
    }

    if (formData.symbol.length > MAX_SYMBOL_LENGTH) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: `Símbolo muito longo. Máximo de ${MAX_SYMBOL_LENGTH} caracteres.`
      });
      return;
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: `Descrição muito longa. Máximo de ${MAX_DESCRIPTION_LENGTH} caracteres.`
      });
      return;
    }

    // Validar o endereço do token
    let mintPubkey;
    try {
      mintPubkey = new PublicKey(formData.mintAddress);
    } catch (err) {
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: "Endereço do token inválido"
      });
      return;
    }

    if (!window.confirm('Confirma a atualização dos metadados do token?')) {
      return;
    }

    try {
      setStatus({ 
        ...status, 
        loading: true, 
        message: "Preparando atualização dos metadados...", 
        error: null,
        progress: 60
      });

      // Initialize Metaplex
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));

      // Verificar se o token existe
      try {
        const tokenAccount = await connection.getAccountInfo(mintPubkey);
        if (!tokenAccount) {
          throw new Error("Token não encontrado");
        }
      } catch (err) {
        setStatus({
          ...status,
          loading: false,
          message: "",
          error: "Token não encontrado ou sem permissão"
        });
        return;
      }

      // Create metadata JSON
      const metadataJson = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUrl,
        external_url: formData.website,
        properties: {
          files: [
            {
              uri: formData.imageUrl,
              type: "image/png"
            }
          ],
          category: "image",
        },
        links: {
          website: formData.website || null,
          twitter: formData.twitter || null,
          telegram: formData.telegram || null,
          github: formData.github || null,
        }
      };

      let uploadedUri;

      try {
        setStatus({ 
          ...status, 
          loading: true, 
          message: "Fazendo upload dos metadados...", 
          error: null,
          progress: 80
        });

        // Upload metadata to Arweave with retry
        const { uri } = await retryOperation(async () => {
          return await metaplex.nfts().uploadMetadata(metadataJson);
        });
        uploadedUri = uri;

        setStatus({ 
          ...status, 
          loading: true, 
          message: "Verificando metadados existentes...", 
          error: null,
          progress: 85
        });

        let currentMetadata;
        try {
          currentMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        } catch (err) {
          console.log("Metadados não encontrados:", err);
        }

        setStatus({ 
          ...status, 
          loading: true, 
          message: "Atualizando metadados do token...", 
          error: null,
          progress: 90
        });

        if (currentMetadata) {
          // Verificar se houve mudanças
          if (!hasMetadataChanged(currentMetadata, {
            name: formData.name,
            symbol: formData.symbol,
            uri: uploadedUri
          })) {
            setStatus({
              loading: false,
              message: "Nenhuma alteração detectada nos metadados.",
              error: null,
              feeConfirmed: false,
              progress: 100
            });
            setTimeout(() => {
              handleReset();
            }, 3000);
            return;
          }
        
          // Se houve mudanças, atualizar
          await retryOperation(async () => {
            const updateResponse = await metaplex.nfts().update({
              nftOrSft: currentMetadata,
              name: formData.name,
              symbol: formData.symbol,
              uri: uploadedUri,
              creators: [{
                address: publicKey,
                share: 100,
                verified: true
              }],
              isMutable: true,
              primarySaleHappened: false,
              sellerFeeBasisPoints: 0,
            }, { commitment: 'confirmed' });
        
            await connection.confirmTransaction(updateResponse.response.signature, 'confirmed');
          });
        } else {
          // Criar novos metadados
          await retryOperation(async () => {
            const createResponse = await metaplex.nfts().create({
              uri: uploadedUri,
              name: formData.name,
              symbol: formData.symbol,
              sellerFeeBasisPoints: 0,
              useExistingMint: mintPubkey,
              tokenOwner: publicKey,
              tokenStandard: 1,
              isMutable: true,
              creators: [{
                address: publicKey,
                share: 100,
                verified: true
              }],
              collection: null,
              uses: null,
              isCollection: false,
              primarySaleHappened: false,
              updateAuthority: publicKey,
            }, { commitment: 'confirmed' });
        
            await connection.confirmTransaction(createResponse.response.signature, 'confirmed');
          });
        }

        setStatus({
          loading: false,
          message: "Metadados do token atualizados com sucesso!",
          error: null,
          feeConfirmed: false,
          progress: 100
        });

        setTimeout(() => {handleReset();
        }, 3000);

      } catch (error) {
        // Se o erro for de metadados já existentes, tente atualizar
        if (error.message.includes('Metadados já existem')) {
          setStatus({ 
            ...status, 
            loading: true, 
            message: "Tentando atualizar metadados existentes...", 
            error: null,
            progress: 90
          });

          try {
            const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
            await metaplex.nfts().update({
              nftOrSft: nft,
              name: formData.name,
              symbol: formData.symbol,
              uri: uploadedUri,
              sellerFeeBasisPoints: 0,
            }, { commitment: 'confirmed' });

            setStatus({
              loading: false,
              message: "Metadados do token atualizados com sucesso!",
              error: null,
              feeConfirmed: false,
              progress: 100
            });

            setTimeout(() => {
              handleReset();
            }, 3000);
            return;
          } catch (updateError) {
            throw updateError;
          }
        }
        throw error;
      }

    } catch (error) {
      console.error('Erro completo:', error);
      setStatus({
        ...status,
        loading: false,
        message: "",
        error: `Erro ao atualizar metadados: ${error.message}`,
        progress: 0
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-[#2a0538] to-[#1a012c] 
        border border-purple-900/50 rounded-2xl 
        shadow-lg shadow-purple-900/30 
        overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-600/10 
          px-4 py-2 flex items-center justify-between text-green-300"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium">Atualizar Metadados do Token</span>
          </div>
          <button
            onClick={handleReset}
            disabled={status.loading}
            className="flex items-center gap-1 text-xs text-green-300 hover:text-green-200 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            Atualizar Outro Token
          </button>
        </div>

        {/* Progress Bar */}
        {status.loading && (
          <div className="w-full bg-purple-900/30">
            <div 
              className="h-1 bg-pink-500 transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
        )}

        {/* Form Content */}
        <form 
          onSubmit={!status.feeConfirmed ? handleConfirmDetails : handleUpdateMetadata} 
          className="p-6"
        >
          <div className="space-y-8">
            {/* Token Details Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-pink-300 text-sm mb-2">
                  Endereço do Token (Mint) *
                </label>
                <input
                  type="text"
                  name="mintAddress"
                  value={formData.mintAddress}
                  onChange={handleInputChange}
                  placeholder="Digite o endereço do token"
                  required
                  className="w-full px-3 py-2 bg-purple-900/30 text-white 
                    border border-purple-500/20 rounded-md 
                    focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-pink-300 text-sm mb-2">
                  Novo Nome * 
                  <span className="text-xs ml-2">
                    ({formData.name.length}/{MAX_NAME_LENGTH})
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Nome Atualizado do Token"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={MAX_NAME_LENGTH}
                  required
                  readOnly={status.feeConfirmed}
                  className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                    border border-purple-500/20 rounded-md 
                    focus:border-pink-500 transition-colors
                    ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                />
              </div>

              <div>
                <label className="block text-pink-300 text-sm mb-2">
                  Novo Símbolo * 
                  <span className="text-xs ml-2">
                    ({formData.symbol.length}/{MAX_SYMBOL_LENGTH})
                  </span>
                </label>
                <input
                  type="text"
                  name="symbol"
                  placeholder="Ex: NTK"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  maxLength={MAX_SYMBOL_LENGTH}
                  required
                  readOnly={status.feeConfirmed}
                  className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                    border border-purple-500/20 rounded-md 
                    focus:border-pink-500 transition-colors
                    ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                />
              </div>

              <div>
                <label className="block text-pink-300 text-sm mb-2">
                  Nova Descrição *
                  <span className="text-xs ml-2">
                    ({formData.description.length}/{MAX_DESCRIPTION_LENGTH})
                  </span>
                </label>
                <textarea
                  name="description"
                  placeholder="Digite a nova descrição do token"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  readOnly={status.feeConfirmed}
                  rows="3"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                    border border-purple-500/20 rounded-md 
                    focus:border-pink-500 transition-colors
                    ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                />
              </div>

              <div>
                <label className="block text-pink-300 text-sm mb-2">Nova URL da Imagem</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://exemplo.com/imagem.png"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  readOnly={status.feeConfirmed}
                  className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                    border border-purple-500/20 rounded-md 
                    focus:border-pink-500 transition-colors
                    ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                />
                {status.showPreview && (
                  <div className="mt-2 p-2 bg-purple-900/30 rounded-md">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-md"
                      onError={() => setStatus(prev => ({ ...prev, showPreview: false }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Section */}
            <div>
              <h3 className="text-pink-300 text-lg mb-4 flex items-center gap-2">
                Links Sociais
                <LinkIcon className="w-4 h-4" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-pink-300 text-sm mb-2 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://seusite.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    readOnly={status.feeConfirmed}
                    className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                      border border-purple-500/20 rounded-md 
                      focus:border-pink-500 transition-colors
                      ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-pink-300 text-sm mb-2 flex items-center gap-1">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    placeholder="https://twitter.com/seutoken"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    readOnly={status.feeConfirmed}
                    className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                      border border-purple-500/20 rounded-md 
                      focus:border-pink-500 transition-colors
                      ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-pink-300 text-sm mb-2 flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    Telegram
                  </label>
                  <input
                    type="url"
                    name="telegram"
                    placeholder="https://t.me/seutoken"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    readOnly={status.feeConfirmed}
                    className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                      border border-purple-500/20 rounded-md 
                      focus:border-pink-500 transition-colors
                      ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-pink-300 text-sm mb-2 flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    placeholder="https://github.com/seutoken"
                    value={formData.github}
                    onChange={handleInputChange}
                    readOnly={status.feeConfirmed}
                    className={`w-full px-3 py-2 bg-purple-900/30 text-white 
                      border border-purple-500/20 rounded-md 
                      focus:border-pink-500 transition-colors
                      ${status.feeConfirmed ? 'cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Cost Estimates Section */}
            <div>
              <h3 className="text-pink-300 text-lg mb-4">Estimativa de Custos</h3>
              <div className="bg-purple-900/30 p-4 rounded-md border border-purple-500/20">
                <CostEstimate />
              </div>
              <p className="text-xs text-pink-300 mt-2 text-center">
                Esta taxa cobre o custo de atualização dos metadados do token na blockchain Solana.
              </p>
            </div>
          </div>


{/* Status Messages */}
{status.message && (
  <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/20 rounded-md">
    <p className="text-yellow-400 text-sm text-center">{status.message}</p>
    
    {/* Botão do Explorer - só aparece quando a mensagem é de sucesso */}
    {status.message.includes("sucesso") && (
      <div className="mt-3 text-center">
        
         <a
          href={`https://solscan.io/token/${formData.mintAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md
            hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
          Ver Token na Explorer
        </a>
      </div>
    )}
  </div>
)}

{status.error && (
  <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/20 rounded-md">
    <p className="text-red-400 text-sm text-center">{status.error}</p>
  </div>
)}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-md 
                hover:bg-pink-700 transition-colors 
                flex items-center justify-center gap-2
                disabled:bg-purple-500 disabled:cursor-not-allowed"
              disabled={status.loading}
            >
              <Edit2 className="w-4 h-4" />
              {status.loading 
                ? "Processando..." 
                : !status.feeConfirmed 
                  ? "Passo 1 - Confirmar Detalhes" 
                  : "Passo 2 - Atualizar Metadados"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateMetadataForm;