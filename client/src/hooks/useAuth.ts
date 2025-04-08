import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface Empresa {
  id: string;
  email: string;
  nome: string;
  cidade: string;
  bairro: string;
}

export function useAuth() {
  const { data, isLoading, isError } = useQuery<Empresa | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user: data,
    isLoading,
    isError,
    isAuthenticated: !!data,
  };
}
