// api/admin/auth.js - Endpoint de autenticação de admin
const { addLog } = require('../admin');

// Obter a carteira de admin da variável de ambiente
const ADMIN_WALLET = process.env.ADMIN_WALLET || '88gfwHfGKQLgJHX7JQVp9E5Va2ChzGGYH6aZkNYSPaZ8';

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
    const { wallet, signature, message } = req.body;
    
    try {
      // Na implementação real, você verificaria a assinatura
      // Aqui estamos apenas verificando se é a carteira admin
      if (wallet === ADMIN_WALLET) {
        res.status(200).json({
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};