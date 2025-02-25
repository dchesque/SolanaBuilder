// index.js - Função principal de API para Vercel Serverless
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Sistema de logs - em produção, você usaria um banco de dados
const systemLogs = [];
const MAX_LOGS = 1000;

// Dados simulados (em produção, usaria um banco de dados)
let statsData = {
  tokens_created: 0,
  metadata_updates: 0,
  service_fees_collected: 0
};

// Verificação de admin
const ADMIN_WALLET = process.env.ADMIN_WALLET || '88gfwHfGKQLgJHX7JQVp9E5Va2ChzGGYH6aZkNYSPaZ8';

// Função para adicionar logs
const addLog = (type, message, details) => {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type, // 'success', 'error', 'info'
    message,
    details: details || {}
  };
  
  systemLogs.push(log);
  
  // Limitar o tamanho do array
  if (systemLogs.length > MAX_LOGS) {
    systemLogs.splice(0, systemLogs.length - MAX_LOGS);
  }
  
  return log;
};

// Middleware para verificar admin
const verifyAdmin = (req, res, next) => {
  const { wallet } = req.body;
  
  if (wallet && wallet === ADMIN_WALLET) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado' 
    });
  }
};

// Função para registrar criação de token
const recordTokenCreation = (fee) => {
  statsData.tokens_created += 1;
  if (fee) {
    statsData.service_fees_collected += parseFloat(fee);
  }
};

// Função para registrar atualização de metadados
const recordMetadataUpdate = () => {
  statsData.metadata_updates += 1;
};

// Configurar Express
const app = express();
app.use(cors());
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.json({ message: 'SolanaMint API Backend' });
});

// Rota de autenticação de admin
app.post('/admin/auth', (req, res) => {
  const { wallet } = req.body;
  
  try {
    if (wallet === ADMIN_WALLET) {
      res.json({
        success: true,
        token: 'jwt-token-simulado',
        message: 'Autenticado com sucesso'
      });
      
      addLog('info', 'Login de administrador bem-sucedido', { wallet });
    } else {
      res.status(403).json({
        success: false,
        message: 'Acesso não autorizado'
      });
      
      addLog('error', 'Tentativa de acesso não autorizado à área de admin', { wallet });
    }
  } catch (error) {
    addLog('error', 'Erro durante autenticação', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Estatísticas de admin
app.post('/admin/stats', verifyAdmin, (req, res) => {
  res.json({
    success: true,
    stats: statsData
  });
});

// Logs de admin
app.post('/admin/logs', verifyAdmin, (req, res) => {
  const { page = 1, limit = 50, type } = req.body;
  
  let filteredLogs = systemLogs;
  
  // Filtrar por tipo
  if (type && ['success', 'error', 'info'].includes(type)) {
    filteredLogs = filteredLogs.filter(log => log.type === type);
  }
  
  // Paginação
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    logs: paginatedLogs,
    total: filteredLogs.length,
    page,
    totalPages: Math.ceil(filteredLogs.length / limit)
  });
});

// Rota para criar token
app.post('/create-token', async (req, res) => {
  try {
    const { tokenName, ticker, supply, ownerWallet } = req.body;
    
    // Código simulado
    const tokenAddress = "simulado-token-address-" + Date.now();
    
    // Registrar estatística
    recordTokenCreation(0.01);
    
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

// Rota para atualizar metadados
app.post('/update-metadata', async (req, res) => {
  try {
    const { tokenAddress, name, symbol, uri } = req.body;
    
    // Código simulado
    recordMetadataUpdate();
    
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

// Rota RPC
app.post('/rpc', async (req, res) => {
  try {
    const { default: fetch } = await import('node-fetch');
    const rpcUrl = "https://api.mainnet-beta.solana.com";
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    res.json(data);
    
    addLog('info', 'Chamada RPC bem-sucedida', {
      method: req.body.method,
      params: req.body.params
    });
  } catch (err) {
    console.error("Erro no proxy:", err);
    
    addLog('error', 'Erro no proxy RPC', { error: err.message });
    
    res.status(500).json({ error: err.message });
  }
});

// Registrar token
app.post('/admin/record-token-creation', verifyAdmin, (req, res) => {
  const { fee } = req.body;
  
  recordTokenCreation(fee);
  
  res.json({
    success: true,
    message: 'Estatísticas atualizadas com sucesso'
  });
});

// Registrar atualização de metadados
app.post('/admin/record-metadata-update', verifyAdmin, (req, res) => {
  recordMetadataUpdate();
  
  res.json({
    success: true,
    message: 'Estatísticas atualizadas com sucesso'
  });
});

// Handler para o ambiente serverless
module.exports = app;
module.exports.handler = serverless(app);