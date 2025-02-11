// backend/index.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa os módulos necessários
const express = require('express');
const cors = require('cors');

// Para Node.js < 18, instale e importe o node-fetch:
// npm install node-fetch
// onst fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const app = express();

// Configuração do CORS: libera todas as origens (para desenvolvimento)
app.use(cors());

// Faz o parse do corpo das requisições como JSON
app.use(express.json());

/*
  Rota Proxy: /rpc
  Essa rota recebe as requisições do frontend e as encaminha para o endpoint RPC da mainnet-beta.
  Assim, o navegador não acessa diretamente o endpoint com restrição de CORS.
*/
app.post('/rpc', async (req, res) => {
  try {
    // Endpoint RPC oficial da mainnet-beta da Solana
    const rpcUrl = "https://api.mainnet-beta.solana.com";
    
    // Encaminha a requisição para o endpoint RPC
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    
    // Obtém a resposta JSON do endpoint RPC
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: err.message });
  }
});

// Inicia o servidor na porta definida (ou 3001, se não houver variável PORT no .env)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
