// CreateOrUpdateMetadataPage.jsx
import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';

const CreateOrUpdateMetadataPage = ({ tokenMintAddress }) => {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    image: '',
    website: '',
  });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  // Função simulada para upload de metadados para um serviço off-chain (substitua em produção)
  const uploadMetadataToIPFS = async (metadataJson) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://ipfs.io/ipfs/dummyCID');
      }, 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setStatus('Conecte sua wallet para continuar.');
      return;
    }

    setUploading(true);
    setStatus('Enviando metadados para o serviço off-chain...');

    try {
      const metadataJson = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.image,
        external_url: formData.website,
      };

      // Realiza o upload dos metadados e obtém a URI (simulada)
      const uri = await uploadMetadataToIPFS(metadataJson);
      setStatus('Metadados enviados. Atualizando on-chain...');

      // Cria a instância do Metaplex usando o novo SDK
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet))
        .use(
          bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: clusterApiUrl('devnet'),
            timeout: 60000,
          })
        );

      // Converte tokenMintAddress para PublicKey, se necessário
      const mintAddress =
        typeof tokenMintAddress === 'string'
          ? new PublicKey(tokenMintAddress)
          : tokenMintAddress;

      // Atualiza os metadados on-chain do NFT/token
      await metaplex.nfts().update({
        mintAddress,
        name: formData.name,
        symbol: formData.symbol,
        uri: uri,
      });

      setStatus('Metadados atualizados com sucesso on-chain!');
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
      setStatus('Erro ao atualizar metadados: ' + error.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Atualizar Metadados do Token</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <label className="block mb-2">
          Nome:
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            required
          />
        </label>
        <label className="block mb-2">
          Símbolo:
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            required
          />
        </label>
        <label className="block mb-2">
          Descrição:
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          />
        </label>
        <label className="block mb-2">
          URL da Imagem:
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
          {uploading ? 'Enviando...' : 'Enviar Metadados'}
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
};

export default CreateOrUpdateMetadataPage;
