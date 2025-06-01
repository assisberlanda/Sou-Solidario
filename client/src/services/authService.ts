import { apiRequest } from "@/lib/queryClient";

interface LoginData {
  username: string;
  password: string;
}

export async function loginEmpresa(data: LoginData) {
  try {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return await response.json();
  } catch (error: any) {
    console.error("Erro de login:", error);
    throw error;
  }
}

export async function registerEmpresa(data: {
  username: string;
  password: string;
  name: string;
  email: string;
  role?: string;
  organization?: string;
}) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao registrar usuário");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Erro de registro:", error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error("Falha ao fazer logout");
    }
    return true;
  } catch (error: any) {
    console.error("Erro de logout:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    return await response.json();
  } catch (error: any) {
    if (error.message.includes("401")) {
      return null;
    }
    throw error;
  }
}
