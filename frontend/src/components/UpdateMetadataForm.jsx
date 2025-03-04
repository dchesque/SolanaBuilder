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
  FileText,
  Image,
  MessageCircle,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import CostEstimate from "./CostEstimate";
import WalletConnect from "./WalletConnect";

const SERVICE_WALLET = process.env.REACT_APP_SERVICE_WALLET;
const SERVICE_FEE = parseFloat(process.env.REACT_APP_SERVICE_FEE);
const TOKEN_DETAILS_FEE = parseFloat(process.env.REACT_APP_TOKEN_DETAILS_FEE) || SERVICE_FEE;
const WEBSITE_IMAGE_FEE = parseFloat(process.env.REACT_APP_WEBSITE_IMAGE_FEE) || SERVICE_FEE;
const SOCIAL_LINKS_FEE = parseFloat(process.env.REACT_APP_SOCIAL_LINKS_FEE) || SERVICE_FEE;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_NAME_LENGTH = 32;
const MAX_SYMBOL_LENGTH = 10;
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Detailed logging function
const logWithDetails = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
};

// Utility function for operations with exponential backoff
const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logWithDetails(`Attempt ${attempt + 1} of ${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error;
      const delay = baseDelay * Math.pow(2, attempt);
      logWithDetails(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

// Utility function to check if metadata has changed
const hasMetadataChanged = (currentMetadata, newMetadata) => {
  return (
    currentMetadata.name !== newMetadata.name ||
    currentMetadata.symbol !== newMetadata.symbol ||
    currentMetadata.uri !== newMetadata.uri
  );
};

// Utility function to ensure URLs have https://
const ensureHttps = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// Component for tab button
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
      ${active ? 
        'bg-purple-500 text-white' : 
        'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Main form component
function UpdateMetadataForm() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;

  // Helper function to check if wallet is Phantom and get provider
  const getPhantomProvider = () => {
    if (wallet && wallet.adapter && wallet.adapter.name === 'Phantom') {
      return wallet.adapter;
    }
    return null;
  };

  // Helper function for using Phantom's signAndSendTransaction
  const signAndSendTransactionWithPhantom = async (transaction) => {
    const phantomProvider = getPhantomProvider();
    
    if (!phantomProvider) {
      console.warn("Not using Phantom wallet. Using standard transaction method instead.");
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      return await sendTransaction(transaction, connection);
    }
    
    // Make sure transaction has the required properties
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    try {
      logWithDetails("Using Phantom's recommended signAndSendTransaction method for better security screening");
      
      // Use Phantom's specific method to avoid suspicious transaction warnings
      const { signature } = await phantomProvider.signAndSendTransaction(transaction);
      return signature;
    } catch (error) {
      logWithDetails("Error using Phantom's signAndSendTransaction:", error);
      
      // If the Phantom-specific method fails, we can try the fallback
      if (error.message && error.message.includes("signAndSendTransaction is not a function")) {
        console.warn("Phantom wallet doesn't support signAndSendTransaction. Falling back to regular method.");
        return await sendTransaction(transaction, connection);
      }
      
      throw error;
    }
  };

  // Tab state
  const [activeTab, setActiveTab] = useState("token-details");
  
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
    showPreview: false,
    copied: false
  });

  // Load mint address from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenAddress = urlParams.get("tokenAddress");
    if (tokenAddress) {
      setFormData((prev) => ({ ...prev, mintAddress: tokenAddress }));
    }
  }, []);

  // Load current metadata when mint address changes
  useEffect(() => {
    if (formData.mintAddress) {
      loadCurrentMetadata(formData.mintAddress);
    }
  }, [formData.mintAddress]);

  // Show image preview if URL is valid
  useEffect(() => {
    if (formData.imageUrl && validateUrl(formData.imageUrl)) {
      setStatus((prev) => ({ ...prev, showPreview: true }));
    } else {
      setStatus((prev) => ({ ...prev, showPreview: false }));
    }
  }, [formData.imageUrl]);

  // URL validation helper
  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    if (status.loading) return;
    
    const { name, value } = e.target;

    // Limit field sizes
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

  // Reset the form
  const handleReset = () => {
    if (status.loading && !window.confirm("An operation is in progress. Do you really want to reset?")) {
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
      showPreview: false,
      copied: false
    });
    setActiveTab("token-details");
  };

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setStatus(prev => ({ ...prev, copied: true }));
    setTimeout(() => {
      setStatus(prev => ({ ...prev, copied: false }));
    }, 2000);
  };

  // Load existing token metadata
  const loadCurrentMetadata = async (mintAddress) => {
    try {
      logWithDetails('Starting metadata loading for:', mintAddress);
      const mintPubkey = new PublicKey(mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));

      // Check if token exists
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      if (!mintInfo) {
        throw new Error("Token not found");
      }
      logWithDetails('Token information found:', mintInfo);

      // Verify it's a valid SPL token
      if (!mintInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        throw new Error("Invalid token: not an SPL token");
      }

      // Try to load existing metadata
      const pda = metaplex.nfts().pdas().metadata({ mint: mintPubkey });
      const metadataAccount = await connection.getAccountInfo(pda);
      logWithDetails('Metadata account:', metadataAccount);

      if (metadataAccount) {
        setMetadataExists(true);
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        logWithDetails('NFT found:', nft);

        if (nft.uri) {
          try {
            const response = await fetch(nft.uri);
            const metadata = await response.json();
            logWithDetails('Metadata from URI:', metadata);
            
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
            logWithDetails('Error loading metadata URI:', uriError);
            setFormData((prev) => ({
              ...prev,
              name: nft.name || "",
              symbol: nft.symbol || ""
            }));
          }
        }

        setStatus((prev) => ({
          ...prev,
          message: "Current metadata loaded successfully.",
          error: null
        }));
      } else {
        setMetadataExists(false);
        setStatus((prev) => ({
          ...prev,
          message: "No metadata found for this token. You can create new metadata.",
          error: null
        }));
      }
    } catch (error) {
      logWithDetails('Error in loadCurrentMetadata:', error);
      setStatus((prev) => ({
        ...prev,
        error: `Error loading metadata: ${error.message}`
      }));
    }
  };

  // Process service fee
  const processServiceFee = async (feeAmount = SERVICE_FEE) => {
    try {
      if (!publicKey) {
        throw new Error("Please connect your wallet to continue.");
      }
      
      const balance = await connection.getBalance(publicKey);
      const requiredBalance = feeAmount * 1e9;
      
      if (balance < requiredBalance) {
        throw new Error(`Insufficient balance. You need at least ${(requiredBalance / 1e9).toFixed(4)} SOL in your wallet.`);
      }
      
      setStatus((prev) => ({ 
        ...prev, 
        loading: true, 
        message: `Processing service fee (${feeAmount} SOL)...`, 
        error: null,
        progress: 25
      }));
      
      // Create transaction with the specific fee
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(SERVICE_WALLET),
          lamports: requiredBalance,
        })
      );
      
      // Use Phantom's recommended signAndSendTransaction method
      logWithDetails('Sending service fee transaction');
      const signature = await signAndSendTransactionWithPhantom(transaction);
      
      logWithDetails('Service fee - Transaction signature:', signature);
      
      // Wait for confirmation with retry
      let confirmed = false;
      for (let i = 0; i < 3; i++) {
        try {
          await connection.confirmTransaction({
            signature,
            blockhash: (await connection.getLatestBlockhash()).blockhash,
            lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
          }, 'confirmed');
          confirmed = true;
          break;
        } catch (err) {
          logWithDetails(`Attempt ${i + 1} to confirm transaction failed:`, err);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!confirmed) {
        throw new Error("Could not confirm transaction after multiple attempts");
      }
      
      logWithDetails('Service fee confirmed');
      return true;
      
    } catch (err) {
      logWithDetails('Error processing service fee:', err);
      
      let errorMessage = "Error processing service fee: ";
      
      if (err.message?.includes("User rejected")) {
        errorMessage += "Transaction rejected by user.";
      } else {
        errorMessage += err.message || "Unknown error";
      }
      
      setStatus((prev) => ({
        ...prev,
        loading: false,
        message: "",
        error: errorMessage,
        progress: 0
      }));
      
      return false;
    }
  };

  // Update token details (name, symbol, description)
  const updateTokenDetails = async (e) => {
    e.preventDefault();
    
    try {
      if (!publicKey) {
        throw new Error("Please connect your wallet to continue.");
      }
      
      if (!formData.mintAddress) {
        throw new Error("Token address is required");
      }
      
      if (!formData.name || !formData.symbol) {
        throw new Error("Token name and symbol are required");
      }
      
      // Process service fee first with token details specific fee
      setStatus(prev => ({
        ...prev,
        loading: true,
        message: `Processing service fee for token details update (${TOKEN_DETAILS_FEE} SOL)...`,
        error: null
      }));
    
      const feeProcessed = await processServiceFee(TOKEN_DETAILS_FEE);
      if (!feeProcessed) return;
      
      setStatus(prev => ({
        ...prev,
        message: "Preparing metadata update for token details...",
        progress: 50
      }));
      
      const mintPubkey = new PublicKey(formData.mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
      
      // Prepare metadata JSON
      const metadataJson = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUrl,
        external_url: formData.website ? ensureHttps(formData.website) : "",
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
          website: formData.website ? ensureHttps(formData.website) : null,
          twitter: formData.twitter ? ensureHttps(formData.twitter) : null,
          telegram: formData.telegram ? ensureHttps(formData.telegram) : null,
          github: formData.github ? ensureHttps(formData.github) : null,
        },
      };
      
      setStatus(prev => ({
        ...prev,
        message: "Uploading metadata...",
        progress: 70
      }));
      
      const { uri } = await retryOperation(async () => {
        logWithDetails("Starting metadata upload");
        return await metaplex.nfts().uploadMetadata(metadataJson);
      });
      
      logWithDetails("Metadata upload completed. URI:", uri);
      
      // Try to load existing metadata
      let currentMetadata;
      try {
        currentMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        logWithDetails("Existing metadata found:", currentMetadata);
      } catch (err) {
        logWithDetails("No metadata found, preparing to create new metadata");
      }
      
      setStatus(prev => ({
        ...prev,
        message: currentMetadata ? "Updating token details..." : "Creating new token metadata...",
        progress: 85
      }));
      
      if (!currentMetadata) {
        // Create metadata for fungible token
        logWithDetails("No metadata found. Creating metadata via metaplex.nfts().createSft()");
        
        try {
          // Create a new transaction with createSft
          const { response } = await metaplex.nfts().createSft({
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
          
          logWithDetails("SFT created with metadata transaction:", response);
          await connection.confirmTransaction(response.signature, "confirmed");
          
          setStatus(prev => ({
            ...prev,
            loading: false,
            message: "Token details updated successfully!",
            error: null,
            progress: 100
          }));
        } catch (error) {
          logWithDetails("Error creating SFT:", error);
          throw new Error("Failed to create metadata: " + error.message);
        }
      } else {
        // Update existing metadata
        logWithDetails("Updating existing metadata");
        
        // Create the update transaction
        const updateTransaction = await metaplex.nfts().updateBuilder({
          nftOrSft: currentMetadata,
          name: formData.name,
          symbol: formData.symbol,
          uri: uri,
          sellerFeeBasisPoints: currentMetadata.sellerFeeBasisPoints,
          creators: currentMetadata.creators,
          isMutable: true,
          primarySaleHappened: currentMetadata.primarySaleHappened,
          collection: currentMetadata.collection,
        });

        // Convert to transaction for Phantom's signAndSendTransaction
        const transaction = updateTransaction.toTransaction();
        
        // Sign and send using Phantom's method
        const signature = await signAndSendTransactionWithPhantom(transaction);
        
        logWithDetails("Update response signature:", signature);
        await connection.confirmTransaction(signature, "confirmed");
        logWithDetails("Update transaction confirmed");
        
        setStatus(prev => ({
          ...prev,
          loading: false,
          message: "Token details updated successfully!",
          error: null,
          progress: 100
        }));
      }
      
      // Move to next tab after successful update
      setTimeout(() => {
        setActiveTab("website-image");
        setStatus(prev => ({
          ...prev,
          message: "",
          progress: 0
        }));
      }, 2000);
      
    } catch (error) {
      logWithDetails("Error during token details update:", error);
      
      let errorMessage = "Error updating token details: " + error.message;
      
      if (error.message.includes("Not enough accounts")) {
        errorMessage = "Error: Metadata account not found. Verify if the token was created correctly.";
      } else if (error.message.includes("Invalid authority")) {
        errorMessage = "Error: You don't have permission to modify this token.";
      }
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "",
        error: errorMessage,
        progress: 0
      }));
    }
  };

  // Update website and image
  const updateWebsiteImage = async (e) => {
    e.preventDefault();
    
    try {
      if (!publicKey) {
        throw new Error("Please connect your wallet to continue.");
      }
      
      if (!formData.mintAddress) {
        throw new Error("Token address is required");
      }
      
      // Ensure URLs have https://
      const processedWebsite = formData.website ? ensureHttps(formData.website) : "";
      const processedImageUrl = formData.imageUrl ? ensureHttps(formData.imageUrl) : "";
      
      // Process service fee first
      setStatus(prev => ({
        ...prev,
        loading: true,
        message: `Processing service fee for website and image update (${WEBSITE_IMAGE_FEE} SOL)...`,
        error: null
      }));
      
      const feeProcessed = await processServiceFee(WEBSITE_IMAGE_FEE);
      if (!feeProcessed) return;
      
      setStatus(prev => ({
        ...prev,
        message: "Preparing metadata update for website and image...",
        progress: 50
      }));
      
      const mintPubkey = new PublicKey(formData.mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
      
      // Try to load existing metadata - must exist at this point
      let currentMetadata;
      try {
        currentMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        logWithDetails("Existing metadata found:", currentMetadata);
      } catch (err) {
        throw new Error("Metadata not found. Please update token details first.");
      }
      
      // Load existing off-chain metadata to preserve other fields
      let existingMetadata = {};
      try {
        const response = await fetch(currentMetadata.uri);
        existingMetadata = await response.json();
        logWithDetails("Existing off-chain metadata:", existingMetadata);
      } catch (err) {
        logWithDetails("Error loading existing off-chain metadata:", err);
        // Continue with empty object if fetch fails
      }
      
      // Prepare updated metadata JSON
      const metadataJson = {
        ...existingMetadata,
        name: currentMetadata.name,
        symbol: currentMetadata.symbol,
        description: existingMetadata.description || formData.description,
        image: processedImageUrl,
        external_url: processedWebsite,
        properties: {
          ...(existingMetadata.properties || {}),
          files: processedImageUrl
            ? [
                {
                  uri: processedImageUrl,
                  type: "image/png",
                },
              ]
            : [],
          category: "image",
        },
        links: {
          ...(existingMetadata.links || {}),
          website: processedWebsite || null,
          twitter: existingMetadata.links?.twitter || formData.twitter,
          telegram: existingMetadata.links?.telegram || formData.telegram,
          github: existingMetadata.links?.github || formData.github,
        },
      };
      
      setStatus(prev => ({
        ...prev,
        message: "Uploading updated metadata...",
        progress: 70
      }));
      
      const { uri } = await retryOperation(async () => {
        logWithDetails("Starting metadata upload");
        return await metaplex.nfts().uploadMetadata(metadataJson);
      });
      
      logWithDetails("Metadata upload completed. URI:", uri);
      
      setStatus(prev => ({
        ...prev,
        message: "Updating website and image...",
        progress: 85
      }));
      
      // Create the update transaction
      const updateTransaction = await metaplex.nfts().updateBuilder({
        nftOrSft: currentMetadata,
        name: currentMetadata.name,
        symbol: currentMetadata.symbol,
        uri: uri,
        sellerFeeBasisPoints: currentMetadata.sellerFeeBasisPoints,
        creators: currentMetadata.creators,
        isMutable: true,
        primarySaleHappened: currentMetadata.primarySaleHappened,
        collection: currentMetadata.collection,
      });

      // Convert to transaction for Phantom's signAndSendTransaction
      const transaction = updateTransaction.toTransaction();
      
      // Sign and send using Phantom's method
      const signature = await signAndSendTransactionWithPhantom(transaction);
      
      logWithDetails("Update response signature:", signature);
      await connection.confirmTransaction(signature, "confirmed");
      logWithDetails("Update transaction confirmed");
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "Website and image updated successfully!",
        error: null,
        progress: 100
      }));
      
      // Update form data with processed URLs
      setFormData(prev => ({
        ...prev,
        website: processedWebsite,
        imageUrl: processedImageUrl
      }));
      
      // Move to next tab after successful update
      setTimeout(() => {
        setActiveTab("social-links");
        setStatus(prev => ({
          ...prev,
          message: "",
          progress: 0
        }));
      }, 2000);
      
    } catch (error) {
      logWithDetails("Error during website and image update:", error);
      
      let errorMessage = "Error updating website and image: " + error.message;
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "",
        error: errorMessage,
        progress: 0
      }));
    }
  };

  // Update social links
  const updateSocialLinks = async (e) => {
    e.preventDefault();
    
    try {
      if (!publicKey) {
        throw new Error("Please connect your wallet to continue.");
      }
      
      if (!formData.mintAddress) {
        throw new Error("Token address is required");
      }
      
      // Ensure URLs have https://
      const processedTwitter = formData.twitter ? ensureHttps(formData.twitter) : "";
      const processedTelegram = formData.telegram ? ensureHttps(formData.telegram) : "";
      const processedGithub = formData.github ? ensureHttps(formData.github) : "";
      
      // Process service fee first
      setStatus(prev => ({
        ...prev,
        loading: true,
        message: `Processing service fee for social links update (${SOCIAL_LINKS_FEE} SOL)...`,
        error: null
      }));
      
      const feeProcessed = await processServiceFee(SOCIAL_LINKS_FEE);
      if (!feeProcessed) return;

      setStatus(prev => ({
        ...prev,
        message: "Preparing metadata update for social links...",
        progress: 50
      }));
      
      const mintPubkey = new PublicKey(formData.mintAddress);
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
      
      // Try to load existing metadata - must exist at this point
      let currentMetadata;
      try {
        currentMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        logWithDetails("Existing metadata found:", currentMetadata);
      } catch (err) {
        throw new Error("Metadata not found. Please update token details first.");
      }
      
      // Load existing off-chain metadata to preserve other fields
      let existingMetadata = {};
      try {
        const response = await fetch(currentMetadata.uri);
        existingMetadata = await response.json();
        logWithDetails("Existing off-chain metadata:", existingMetadata);
      } catch (err) {
        logWithDetails("Error loading existing off-chain metadata:", err);
        // Continue with empty object if fetch fails
      }
      
      // Prepare updated metadata JSON
      const metadataJson = {
        ...existingMetadata,
        name: currentMetadata.name,
        symbol: currentMetadata.symbol,
        description: existingMetadata.description || formData.description,
        image: existingMetadata.image || formData.imageUrl,
        external_url: existingMetadata.external_url || formData.website,
        properties: existingMetadata.properties || {},
        links: {
          ...(existingMetadata.links || {}),
          website: existingMetadata.external_url || formData.website,
          twitter: processedTwitter || null,
          telegram: processedTelegram || null,
          github: processedGithub || null,
        },
      };
      
      setStatus(prev => ({
        ...prev,
        message: "Uploading updated metadata...",
        progress: 70
      }));
      
      const { uri } = await retryOperation(async () => {
        logWithDetails("Starting metadata upload");
        return await metaplex.nfts().uploadMetadata(metadataJson);
      });
      
      logWithDetails("Metadata upload completed. URI:", uri);
      
      setStatus(prev => ({
        ...prev,
        message: "Updating social links...",
        progress: 85
      }));
      
      // Create the update transaction
      const updateTransaction = await metaplex.nfts().updateBuilder({
        nftOrSft: currentMetadata,
        name: currentMetadata.name,
        symbol: currentMetadata.symbol,
        uri: uri,
        sellerFeeBasisPoints: currentMetadata.sellerFeeBasisPoints,
        creators: currentMetadata.creators,
        isMutable: true,
        primarySaleHappened: currentMetadata.primarySaleHappened,
        collection: currentMetadata.collection,
      });

      // Convert to transaction for Phantom's signAndSendTransaction
      const transaction = updateTransaction.toTransaction();
      
      // Sign and send using Phantom's method
      const signature = await signAndSendTransactionWithPhantom(transaction);
      
      logWithDetails("Update response signature:", signature);
      await connection.confirmTransaction(signature, "confirmed");
      logWithDetails("Update transaction confirmed");
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "Social links updated successfully!",
        error: null,
        progress: 100
      }));
      
      // Update form data with processed URLs
      setFormData(prev => ({
        ...prev,
        twitter: processedTwitter,
        telegram: processedTelegram,
        github: processedGithub
      }));
      
      // Reset status after successful update
      setTimeout(() => {
        setStatus(prev => ({
          ...prev,
          message: "All token information updated successfully!",
          progress: 0
        }));
      }, 2000);
      
    } catch (error) {
      logWithDetails("Error during social links update:", error);
      
      let errorMessage = "Error updating social links: " + error.message;
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        message: "",
        error: errorMessage,
        progress: 0
      }));
    }
  };

  // If wallet not connected, show connection component
  if (!publicKey) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Connect Your Wallet
        </h2>
        <p className="text-center text-sm text-purple-200/80 mb-8">
          Connect your Solana wallet to update your token information.
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
      {/* Token Address (always visible) */}
      <div className="mb-6">
        <label className="block text-sm text-purple-200 mb-2">
          Token Address *
        </label>
        <div className="relative">
          <input
            type="text"
            name="mintAddress"
            value={formData.mintAddress}
            onChange={handleInputChange}
            placeholder="Enter your token address"
            required
            disabled={status.loading}
            className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all pr-10"
          />
          {formData.mintAddress && (
            <button
              type="button"
              onClick={() => copyToClipboard(formData.mintAddress)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {status.copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          )}
        </div>
        {formData.mintAddress && (
          <div className="mt-2 flex items-center gap-2">
             
             <a
              href={`https://solscan.io/token/${formData.mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View on Solscan
            </a>

            <a
              href={`https://explorer.solana.com/address/${formData.mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View on Solana Explorer
            </a>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-purple-500/20 pb-2">
        <TabButton
          active={activeTab === "token-details"}
          onClick={() => setActiveTab("token-details")}
          icon={<FileText className="w-4 h-4" />}
          label="Token Details"
        />
        <TabButton
          active={activeTab === "website-image"}
          onClick={() => setActiveTab("website-image")}
          icon={<Image className="w-4 h-4" />}
          label="Website & Image"
        />
        <TabButton
          active={activeTab === "social-links"}
          onClick={() => setActiveTab("social-links")}
          icon={<MessageCircle className="w-4 h-4" />}
          label="Social Links"
        />
      </div>

      {/* Token Details Tab */}
      {activeTab === "token-details" && (
        <form onSubmit={updateTokenDetails} className="space-y-6">
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
              disabled={status.loading}
              className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>

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
              disabled={status.loading}
              className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2">
              Description
              <span className="text-xs ml-2 text-purple-300">
                ({formData.description.length}/{MAX_DESCRIPTION_LENGTH})
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Updated token description"
              rows="3"
              maxLength={MAX_DESCRIPTION_LENGTH}
              disabled={status.loading}
              className="w-full rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>

          {/* Estimated Cost */}
          <div className="rounded-xl bg-[#1D0F35] border border-purple-500/20 p-4">
            <CostEstimate feeType="token-details" />
          </div>

          {/* Phantom wallet recommendation notice */}
          {!getPhantomProvider() && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-center text-yellow-200">
                ⚠️ For the best experience and to avoid security warnings, we recommend using the Phantom wallet.
              </p>
            </div>
          )}

          {/* Status Messages */}
          {status.message && (
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-yellow-500/20">
              <p className="text-yellow-400 text-sm text-center">{status.message}</p>
            </div>
          )}
          {status.error && (
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{status.error}</p>
            </div>
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
                Update Token Details
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Website & Image Tab */}
      {activeTab === "website-image" && (
        <form onSubmit={updateWebsiteImage} className="space-y-6">
          <div>
            <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Website
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
              disabled={status.loading}
              className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
            <p className="text-xs text-purple-300/70 mt-1">
              'https://' will be added automatically if missing
            </p>
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.png"
              disabled={status.loading}
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

          {/* Estimated Cost */}
          <div className="rounded-xl bg-[#1D0F35] border border-purple-500/20 p-4">
            <CostEstimate feeType="website-image" />
          </div>

          {/* Phantom wallet recommendation notice */}
          {!getPhantomProvider() && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-center text-yellow-200">
                ⚠️ For the best experience and to avoid security warnings, we recommend using the Phantom wallet.
              </p>
            </div>
          )}

          {/* Status Messages */}
          {status.message && (
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-yellow-500/20">
              <p className="text-yellow-400 text-sm text-center">{status.message}</p>
            </div>
          )}
          {status.error && (
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{status.error}</p>
            </div>
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
                Update Website & Image
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Social Links Tab */}
      {activeTab === "social-links" && (
        <form onSubmit={updateSocialLinks} className="space-y-6">
          <div>
            <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
              <Twitter className="w-4 h-4" /> Twitter
            </label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="https://twitter.com/yourtoken"
              disabled={status.loading}
              className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
              <Send className="w-4 h-4" /> Telegram
            </label>
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
              placeholder="https://t.me/yourtoken"
              disabled={status.loading}
              className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-2 flex items-center gap-2">
              <Github className="w-4 h-4" /> GitHub
            </label>
            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleInputChange}
              placeholder="https://github.com/yourtoken"
              disabled={status.loading}
              className="w-full h-12 rounded-xl bg-[#1D0F35] border border-purple-500/20 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            />
          </div>
          
          <p className="text-xs text-purple-300/70">
            'https://' will be added automatically to all social links if missing
          </p>

          {/* Estimated Cost */}
          <div className="rounded-xl bg-[#1D0F35] border border-purple-500/20 p-4">
            <CostEstimate feeType="social-links" />
          </div>

          {/* Phantom wallet recommendation notice */}
          {!getPhantomProvider() && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-center text-yellow-200">
                ⚠️ For the best experience and to avoid security warnings, we recommend using the Phantom wallet.
              </p>
            </div>
          )}

          {/* Status Messages */}
          {status.message && (
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-yellow-500/20">
              <p className="text-yellow-400 text-sm text-center">{status.message}</p>
            </div>
          )}
          {status.error && (
            <div className="p-4 rounded-xl bg-[#1D0F35] border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{status.error}</p>
            </div>
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
                Update Social Links
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Reset Button - Common for all tabs */}
      {Object.values(formData).some((value) => value) && !status.loading && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Form
          </button>
        </div>
      )}
    </div>
  );
}

export default UpdateMetadataForm;