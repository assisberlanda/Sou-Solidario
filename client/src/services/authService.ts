import { apiRequest } from "@/lib/queryClient";

interface LoginData {
  email: string;
  password: string;
}

export async function loginEmpresa(data: LoginData) {
  try {
    const response = await apiRequest("POST", "/api/auth/login", data);

    // Retorna o usuário logado, token, ou qualquer info que sua API retornar
    return response;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || "Erro desconhecido";

    throw new Error(errorMessage);
  }
}
