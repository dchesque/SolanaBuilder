// api/config.js - Configurações centralizadas para o backend
module.exports = {
    // Solana Network - pode vir da variável de ambiente ou usar valor padrão
    SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'mainnet',
    
    // RPC URLs para diferentes redes
    RPC_URLS: {
      mainnet: 'https://api.mainnet-beta.solana.com',
      devnet: 'https://api.devnet.solana.com',
      testnet: 'https://api.testnet.solana.com',
    },
    
    // Admin wallet address - pode vir da variável de ambiente ou usar valor padrão
    ADMIN_WALLET: process.env.ADMIN_WALLET || '88gfwHfGKQLgJHX7JQVp9E5Va2ChzGGYH6aZkNYSPaZ8',
    
    // Service fee em SOL
    SERVICE_FEE: parseFloat(process.env.SERVICE_FEE || '0.0001'),
    
    // Limite de logs a manter em memória
    MAX_LOGS: 1000,
  };