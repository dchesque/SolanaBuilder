// api/admin.js - Adaptado para Vercel Serverless
const express = require('express');
const { PublicKey } = require('@solana/web3.js');
const router = express.Router();

// Validação da variável de ambiente
const ADMIN_WALLET = process.env.ADMIN_WALLET || '88gfwHfGKQLgJHX7JQVp9E5Va2ChzGGYH6aZkNYSPaZ8';

// Sistema de logs - em produção, você usaria um banco de dados ou serviço de logs
// No Vercel, podemos usar In-Memory para demos, mas recomenda-se migrar para um banco de dados persistente
let systemLogs = [];

// Dados simulados (em produção, usaria um banco de dados)
let statsData = {
  tokens_created: 0,
  metadata_updates: 0,
  service_fees_collected: 0
};

// Função para adicionar logs ao sistema
const addLog = (type, message, details) => {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type, // 'success', 'error', 'info'
    message,
    details: details || {}
  };
  
  systemLogs.push(log);
  
  // Limitar o tamanho do array para evitar uso excessivo de memória
  if (systemLogs.length > 1000) {
    systemLogs = systemLogs.slice(-1000);
  }
  
  return log;
};

// Middleware para verificar se é o admin
const verifyAdmin = (req, res, next) => {
  const { wallet } = req.body;
  
  // Verifica se a carteira fornecida é a mesma que está no .env
  if (wallet && wallet === ADMIN_WALLET) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado' 
    });
  }
};

// Endpoint para autenticação de admin
router.post('/auth', (req, res) => {
  const { wallet, signature, message } = req.body;
  
  try {
    // Na implementação real, você verificaria a assinatura
    // Aqui estamos apenas verificando se é a carteira admin
    if (wallet === ADMIN_WALLET) {
      res.json({
        success: true,
        token: 'jwt-token-simulado', // Em produção, use JWT real
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

// Endpoint para obter estatísticas
router.post('/stats', verifyAdmin, (req, res) => {
  res.json({
    success: true,
    stats: statsData
  });
});

// Endpoint para obter logs
router.post('/logs', verifyAdmin, (req, res) => {
  const { page = 1, limit = 50, type } = req.body;
  
  let filteredLogs = systemLogs;
  
  // Filtrar por tipo, se especificado
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

// Incrementar contadores quando um token é criado
router.post('/record-token-creation', verifyAdmin, (req, res) => {
  const { fee } = req.body;
  
  statsData.tokens_created += 1;
  if (fee) {
    statsData.service_fees_collected += parseFloat(fee);
  }
  
  res.json({
    success: true,
    message: 'Estatísticas atualizadas com sucesso'
  });
});

// Função para atualizar estatísticas diretamente
const recordTokenCreation = (fee) => {
  statsData.tokens_created += 1;
  if (fee) {
    statsData.service_fees_collected += parseFloat(fee);
  }
};

// Incrementar contador quando metadados são atualizados
router.post('/record-metadata-update', verifyAdmin, (req, res) => {
  statsData.metadata_updates += 1;
  
  res.json({
    success: true,
    message: 'Estatísticas atualizadas com sucesso'
  });
});

// Função para atualizar estatísticas diretamente
const recordMetadataUpdate = () => {
  statsData.metadata_updates += 1;
};

// Adicionar funções ao router para acesso no index.js
router.recordTokenCreation = recordTokenCreation;
router.recordMetadataUpdate = recordMetadataUpdate;

module.exports = {
  router,
  addLog
};