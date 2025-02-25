// src/services/adminService.js

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Verifica se o wallet é de um administrador
 * @param {string} wallet Endereço da carteira
 * @returns {Promise<Object>} Resposta da verificação
 */
export const verifyAdmin = async (wallet) => {
  try {
    const response = await fetch(`${API_URL}/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém estatísticas do dashboard
 * @param {string} wallet Endereço da carteira do admin
 * @returns {Promise<Object>} Dados de estatísticas
 */
export const getDashboardStats = async (wallet) => {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém logs do sistema com filtros e paginação
 * @param {Object} params Parâmetros da requisição
 * @param {string} params.wallet Endereço da carteira do admin
 * @param {number} params.page Número da página
 * @param {number} params.limit Itens por página
 * @param {string} params.type Tipo de log para filtrar
 * @param {string} params.search Termo de busca
 * @returns {Promise<Object>} Logs paginados
 */
export const getLogs = async ({ wallet, page = 1, limit = 10, type = "", search = "" }) => {
  try {
    const response = await fetch(`${API_URL}/admin/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        wallet, 
        page, 
        limit,
        type: type || undefined,
        search: search || undefined
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao obter logs:", error);
    return { success: false, error: error.message, logs: [] };
  }
};

/**
 * Registra a criação de um novo token nas estatísticas
 * @param {Object} params Parâmetros da requisição
 * @param {string} params.wallet Endereço da carteira do admin
 * @param {number} params.fee Taxa de serviço cobrada
 * @returns {Promise<Object>} Resultado da operação
 */
export const recordTokenCreation = async ({ wallet, fee }) => {
  try {
    const response = await fetch(`${API_URL}/admin/record-token-creation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet, fee }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao registrar criação de token:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Registra a atualização de metadados nas estatísticas
 * @param {Object} params Parâmetros da requisição
 * @param {string} params.wallet Endereço da carteira do admin
 * @returns {Promise<Object>} Resultado da operação
 */
export const recordMetadataUpdate = async ({ wallet }) => {
  try {
    const response = await fetch(`${API_URL}/admin/record-metadata-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao registrar atualização de metadados:", error);
    return { success: false, error: error.message };
  }
};
