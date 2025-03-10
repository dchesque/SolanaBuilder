// backend/index.js - modificado

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const { router: adminRouter, addLog } = require('./admin');

app.use(cors());
app.use(express.json());

// Adicionar as rotas de admin
app.use('/admin', adminRouter);

// Rota RPC existente com adição de logs
app.post('/rpc', async (req, res) => {
  try {
    const rpcUrl = "https://api.mainnet-beta.solana.com";
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    res.json(data);
    
    // Adicionar log para chamadas RPC bem-sucedidas
    addLog('info', 'Chamada RPC bem-sucedida', {
      method: req.body.method,
      params: req.body.params
    });
  } catch (err) {
    console.error("Erro no proxy:", err);
    
    // Adicionar log para erros
    addLog('error', 'Erro no proxy RPC', { error: err.message });
    
    res.status(500).json({ error: err.message });
  }
});

// Rota para criar token com adição de logs
app.post('/create-token', async (req, res) => {
  try {
    const { tokenName, ticker, supply, ownerWallet } = req.body;
    
    // Código para criar token (simulado por enquanto)
    const tokenAddress = "simulado-token-address";
    
    // Chamar endpoint para atualizar estatísticas
    fetch(`http://localhost:${process.env.PORT || 3001}/admin/record-token-creation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee: 0.01 }) // Taxa simulada
    });
    
    addLog('success', 'Token criado com sucesso', {
      tokenName,
      ticker,
      supply,
      ownerWallet,
      tokenAddress
    });
    
    res.json({
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
});

// Rota para atualizar metadados com adição de logs
app.post('/update-metadata', async (req, res) => {
  try {
    const { tokenAddress, name, symbol, uri } = req.body;
    
    // Código para atualizar metadados (simulado por enquanto)
    
    // Chamar endpoint para atualizar estatísticas
    fetch(`http://localhost:${process.env.PORT || 3001}/admin/record-metadata-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    addLog('success', 'Metadados atualizados com sucesso', {
      tokenAddress,
      name,
      symbol
    });
    
    res.json({
      success: true,
      message: 'Metadados atualizados com sucesso!'
    });
  } catch (error) {
    addLog('error', 'Erro ao atualizar metadados', { 
      error: error.message,
      details: req.body
    });
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));