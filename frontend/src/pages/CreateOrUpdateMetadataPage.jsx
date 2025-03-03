// CreateOrUpdateMetadataPage.jsx
// This page allows you to create or update token metadata on-chain.
// It collects metadata from the user, uploads it to an off-chain service (simulated),
// and then updates the token's metadata on-chain using the Metaplex SDK.

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';

const CreateOrUpdateMetadataPage = ({ tokenMintAddress }) => {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  // State for the form data and upload status
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    image: '',
    website: '',
  });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  // Simulated function to upload metadata to an off-chain service (replace in production)
  const uploadMetadataToIPFS = async (metadataJson) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://ipfs.io/ipfs/dummyCID');
      }, 1000);
    });
  };

  // Handle form submission: upload metadata and update on-chain
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setStatus('Connect your wallet to continue.');
      return;
    }

    setUploading(true);
    setStatus('Uploading metadata to the off-chain service...');

    try {
      const metadataJson = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.image,
        external_url: formData.website,
      };

      // Upload metadata and obtain the URI (simulated)
      const uri = await uploadMetadataToIPFS(metadataJson);
      setStatus('Metadata uploaded. Updating on-chain...');

      // Create a Metaplex instance using the new SDK
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet))
        .use(
          bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: clusterApiUrl('devnet'),
            timeout: 60000,
          })
        );

      // Convert tokenMintAddress to PublicKey if necessary
      const mintAddress =
        typeof tokenMintAddress === 'string'
          ? new PublicKey(tokenMintAddress)
          : tokenMintAddress;

      // Update the on-chain metadata for the NFT/token
      await metaplex.nfts().update({
        mintAddress,
        name: formData.name,
        symbol: formData.symbol,
        uri: uri,
      });

      setStatus('Metadata successfully updated on-chain!');
    } catch (error) {
      console.error('Error updating metadata:', error);
      setStatus('Error updating metadata: ' + error.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Update Token Metadata</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <label className="block mb-2">
          Name:
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            required
          />
        </label>
        <label className="block mb-2">
          Symbol:
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            required
          />
        </label>
        <label className="block mb-2">
          Description:
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          />
        </label>
        <label className="block mb-2">
          Image URL:
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          />
        </label>
        <label className="block mb-4">
          Website:
          <input
            type="text"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          />
        </label>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded font-bold"
        >
          {uploading ? 'Uploading...' : 'Submit Metadata'}
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
};

export default CreateOrUpdateMetadataPage;
