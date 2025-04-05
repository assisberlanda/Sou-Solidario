import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { HandHelping, User, Lock } from "lucide-react";

const AdminLogin = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);
      
      // Invalidate the current user query to refetch the user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel administrativo.",
      });
      
      navigate("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center">
          <HandHelping className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-heading font-bold ml-2">Sou Solidário</h1>
        </div>
        <p className="text-gray-600 mt-2">Plataforma de gestão de doações</p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading text-center">
            Área Administrativa
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o painel de controle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="username"
                  className="pl-10"
                  placeholder="Insira seu nome de usuário"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  placeholder="Insira sua senha"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">Lembrar-me</Label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-secondary hover:text-secondary-dark"
              >
                Esqueceu a senha?
              </button>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-600">
            <p>
              Para demonstração, use: <span className="font-medium">admin</span> / <span className="font-medium">admin123</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Não possui cadastro?{" "}
          <a href="#" className="font-medium text-secondary hover:text-secondary-dark">
            Solicite acesso
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
