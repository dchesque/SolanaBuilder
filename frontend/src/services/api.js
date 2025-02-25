// frontend/src/services/api.js

// Definir a URL da API com fallback para desenvolvimento local
const API_URL = process.env.REACT_APP_API_URL || 'https://seu-backend.vercel.app';

export const createToken = async (data) => {
  try {
    console.log("Dados enviados para o backend:", data);
    const response = await fetch(`${API_URL}/create-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      // Melhorar tratamento de erro com informações do status HTTP
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}, Erro: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro na requisição createToken:", error);
    throw error;
  }
};

// Adicionar função para atualizar metadados se ainda não existir
export const updateMetadata = async (data) => {
  try {
    console.log("Enviando metadados para atualização:", data);
    const response = await fetch(`${API_URL}/update-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}, Erro: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro na requisição updateMetadata:", error);
    throw error;
  }
};

// Função para chamadas RPC Solana
export const callRPC = async (method, params = []) => {
  try {
    const response = await fetch(`${API_URL}/rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}, Erro: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro na chamada RPC:", error);
    throw error;
  }
};