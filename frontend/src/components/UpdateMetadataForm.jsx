import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Edit2, 
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
import { 
  getAssociatedTokenAddress, 
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Transaction, 
  SystemProgram, 
  PublicKey,
  ComputeBudgetProgram 
} from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import CostEstimate from "./CostEstimate";
import WalletConnect from "./WalletConnect";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_NAME_LENGTH = 32;
const MAX_SYMBOL_LENGTH = 10;

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenAddress = urlParams.get('tokenAddress');
    if (tokenAddress) {
      setFormData(prev => ({ ...prev, mintAddress: tokenAddress }));
    }
  }, []);

  useEffect(() => {
    if (formData.mintAddress) {
      loadCurrentMetadata(formData.mintAddress);
    }
  }, [formData.mintAddress]);

  useEffect(() => {
    if (formData.imageUrl && validateUrl(formData.imageUrl)) {
      setStatus(prev => ({ ...prev, showPreview: true }));
    } else {
      setStatus(prev => ({ ...prev, showPreview: false }));
    }
  }, [formData.imageUrl]);

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  const handleInputChange = (e) => {
    if (status.feeConfirmed) return;
    
    const { name, value } = e.target;
    
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
    setShowSocialLinks(false);
    setMetadataExists(false);
  };

  const loadCurrentMetadata = async (mintAddress) => {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
      
      // Primeiro, verificar se o token existe
      try {
        const mintInfo = await connection.getAccountInfo(mintPubkey);
        if (!mintInfo) {
          throw new Error("Token not found");
        }
      } catch (error) {
        console.error("Error checking mint:", error);
        throw new Error("Invalid token address");
      }
      
      // Tentar carregar os metadados existentes
      const pda = metaplex.nfts().pdas().metadata({ mint: mintPubkey });
      const metadataAccount = await connection.getAccountInfo(pda);
      
      if (metadataAccount) {
        setMetadataExists(true);
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        console.log("Found NFT:", nft);
        
        if (nft.uri) {
          try {
            const response = await fetch(nft.uri);
            const metadata = await response.json();
            console.log("Metadata from URI:", metadata);
            
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
          } catch (uriError) {
            console.warn("Error loading metadata URI:", uriError);
            setFormData(prev => ({
              ...prev,
              name: nft.name || '',
              symbol: nft.symbol || ''
            }));
          }
        }
        
        setStatus(prev => ({
          ...prev,
          message: "Current metadata loaded successfully.",
          error: null
        }));
      } else {
        setMetadataExists(false);
        setStatus(prev => ({
          ...prev,
          message: "No metadata found for this token. You can create new metadata.",
          error: null
        }));
      }
    } catch (error) {
      console.error("Error in loadCurrentMetadata:", error);
      setStatus(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const handleConfirmDetails = async (e) => {
    e.preventDefault();
    
    if (!publicKey) {
      setStatus(prev => ({
        ...prev,
        message: "Please connect your wallet to continue.",
        error: null
      }));
      return;
    }

    if (!formData.mintAddress) {
      setStatus(prev => ({
        ...prev,
        error: "Token address is required"
      }));
      return;
    }

    try {
      setStatus(prev => ({ 
        ...prev, 
        loading: true, 
        message: "Processing service fee...", 
        error: null,
        progress: 25
      }));

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

      setStatus({
        loading: false,
        message: "Service fee confirmed. You can now update your token's metadata.",
        error: null,
        feeConfirmed: true,
        progress: 50
      });
    } catch (err) {
      console.error(err);
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "",
        error: "Error processing service fee: " + err.message,
        progress: 0
      }));
    }
  };

  //////////////// INICIO DO handleUpdateMetadata 


  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    if (!publicKey || !status.feeConfirmed) {
      setStatus(prev => ({
        ...prev,
        message: "Please complete Step 1 first.",
        error: null
      }));
      return;
    }
  
    try {
      setStatus(prev => ({
        ...prev,
        loading: true,
        message: "Checking token details...",
        error: null,
        progress: 30
      }));
  
      const mintPubkey = new PublicKey(formData.mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
  
      // Verificar informações da conta
      const accountInfo = await connection.getAccountInfo(mintPubkey);
      if (!accountInfo) {
        throw new Error("Token account not found. Verify the address.");
      }
  
      // Preparar metadados para upload
      const metadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUrl,
        external_url: formData.website,
        properties: {
          files: formData.imageUrl ? [
            {
              uri: formData.imageUrl,
              type: "image/png"
            }
          ] : [],
          category: formData.imageUrl ? "image" : "text",
        },
        links: {
          website: formData.website || null,
          twitter: formData.twitter || null,
          telegram: formData.telegram || null,
          github: formData.github || null,
        }
      };
  
      // Upload de metadados
      const { uri } = await metaplex.nfts().uploadMetadata(metadata);
      console.log("Uploaded Metadata URI:", uri);
  
      // Tentar criar metadados
      const createMetadataResponse = await metaplex.nfts().create({
        uri: uri,
        name: formData.name,
        symbol: formData.symbol,
        mintAddress: mintPubkey,
        updateAuthority: publicKey,
        mintAuthority: publicKey,
        isMutable: true,
      });
  
      console.log("Metadata Creation Response:", createMetadataResponse);
  
      setStatus({
        loading: false,
        message: "Token metadata created successfully!",
        error: null,
        feeConfirmed: false,
        progress: 100
      });
  
    } catch (error) {
      console.error('Detailed Error:', error);
      
      // Log detalhado do erro
      console.log('Error Name:', error.name);
      console.log('Error Message:', error.message);
      console.log('Error Stack:', error.stack);
  
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "",
        error: `Error updating metadata: ${error.message}`,
        progress: 0
      }));
    }
  };
//////////////// FIM DO handleUpdateMetadata 


  // Render wallet connection state
  if (!publicKey) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Connect Your Wallet
        </h2>
        <p className="text-center text-sm text-purple-200/80 mb-8">
          Connect your Solana wallet to update your token's information.
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
        {/* Token Address */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">
            Token Address (Mint) *
          </label>
          <input
            type="text"
            name="mintAddress"
            value={formData.mintAddress}
            onChange={handleInputChange}
            placeholder="Enter your token's address"
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
            placeholder="Updated token name"
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
            placeholder="Updated token symbol"
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
            placeholder="Updated token description"
            required
            rows="3"
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="w-full rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm text-purple-200 mb-2">Token Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.png"
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
          {status.showPreview && (
            <div className="mt-2 p-2 rounded-xl bg-[#1D0F35] border border-purple-500/20">
              <img
                src={formData.imageUrl}
                alt="Token Preview"
                className="max-h-40 mx-auto rounded-lg"
                onError={() => setStatus(prev => ({ ...prev, showPreview: false }))}
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
            placeholder="https://yourwebsite.com"
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
          />
        </div>

        {/* Social Links Section */}
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
                  placeholder="https://twitter.com/yourtoken"
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
                  placeholder="https://t.me/yourtoken"
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
                  placeholder="https://github.com/yourtoken"
                  className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cost Estimate */}
        <div className="rounded-xl bg-[#1D0F35] border border-purple-500/20 p-4">
          <CostEstimate />
        </div>

        {/* Status Messages */}
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

        {/* Reset Button */}
        {Object.values(formData).some(value => value) && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Form
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.loading}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <>
              {!status.feeConfirmed ? (
                <>Step 1: Confirm Details</>
              ) : (
                <>Step 2: Update Metadata</>
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