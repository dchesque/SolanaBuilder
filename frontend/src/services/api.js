const API_URL = process.env.REACT_APP_API_URL;

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
    return await response.json();
  } catch (error) {
    console.error("Erro na requisição createToken:", error);
    throw error;
  }
};
