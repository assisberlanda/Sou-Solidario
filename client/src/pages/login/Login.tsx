import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { HandHelping, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const Login = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });

      navigate("/minhas-campanhas"); // <-- Atualizado aqui!
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha inválidos.",
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
          <h1 className="text-3xl font-bold ml-2">Sou Solidário</h1>
        </div>
        <p className="text-gray-600 mt-2">Área Administrativa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="email" type="email" className="pl-10" {...register("email")} />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="password" type="password" className="pl-10" {...register("password")} />
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Não possui conta?{" "}
            <a href="/cadastro-empresa" className="text-primary hover:underline">
              Criar Conta
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
