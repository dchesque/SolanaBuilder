// api/create-token.js - Endpoint direto para Vercel Serverless
const { addLog } = require('./admin');

module.exports = async (req, res) => {
  // Configurar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas processar requisições POST
  if (req.method === 'POST') {
    try {
      const { tokenName, ticker, supply, ownerWallet } = req.body;
      
      // Código para criar token (simulado por enquanto)
      const tokenAddress = "simulado-token-address";
      
      // Registrar estatística - em uma implementação real, isso seria feito em um banco de dados
      // Admin.recordTokenCreation(0.01);
      
      addLog('success', 'Token criado com sucesso', {
        tokenName,
        ticker,
        supply,
        ownerWallet,
        tokenAddress
      });
      
      res.status(200).json({
        success: true,
        tokenAddress,
        message: 'Token criado com sucesso!'
      });
    } catch (error) {
      addLog('error', 'Erro ao criar token', { 
        error: error.message,
        details: req.body
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};