// api/rpc.js - Endpoint direto para Vercel Serverless
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
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
      const rpcUrl = "https://api.mainnet-beta.solana.com";
      
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      
      // Adicionar log para chamadas RPC bem-sucedidas
      addLog('info', 'Chamada RPC bem-sucedida', {
        method: req.body.method,
        params: req.body.params
      });
      
      res.status(200).json(data);
    } catch (err) {
      console.error("Erro no proxy:", err);
      
      // Adicionar log para erros
      addLog('error', 'Erro no proxy RPC', { error: err.message });
      
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};