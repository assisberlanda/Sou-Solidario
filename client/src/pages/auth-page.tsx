import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Estado de login
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Estado de registro
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    organization: "",
  });

  // Redirecionar se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }
    
    try {
      const { confirmPassword, ...userData } = registerData;
      await registerMutation.mutateAsync({
        ...userData,
        role: 'user',
        username: registerData.email,
        email: registerData.email
      });
    } catch (error) {
      console.error("Erro ao registrar:", error);
      alert("Erro ao registrar usuário. Por favor, tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Formulário de autenticação */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>
              Entre ou registre-se para gerenciar suas campanhas e doações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Usuário</Label>
                    <Input 
                      id="login-username" 
                      type="text" 
                      placeholder="Seu nome de usuário" 
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="Sua senha" 
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome completo</Label>
                    <Input 
                      id="register-name" 
                      type="text" 
                      placeholder="Seu nome completo" 
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="seu.email@exemplo.com" 
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Nome de usuário</Label>
                    <Input 
                      id="register-username" 
                      type="text" 
                      placeholder="Escolha um nome de usuário" 
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="Sua senha" 
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        placeholder="Confirme sua senha" 
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-organization">Organização (opcional)</Label>
                    <Input 
                      id="register-organization" 
                      type="text" 
                      placeholder="Empresa ou organização" 
                      value={registerData.organization}
                      onChange={(e) => setRegisterData({...registerData, organization: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrar"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            {activeTab === "login" ? (
              <p>Não tem uma conta? <button className="text-primary hover:underline" onClick={() => setActiveTab("register")}>Registre-se</button></p>
            ) : (
              <p>Já tem uma conta? <button className="text-primary hover:underline" onClick={() => setActiveTab("login")}>Entre aqui</button></p>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Seção Hero */}
      <div className="w-full md:w-1/2 bg-primary text-white p-10 flex items-center justify-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Sou Solidário</h1>
          <h2 className="text-xl font-medium mb-4">Conectando quem quer ajudar a quem precisa</h2>
          <p className="mb-6">
            A plataforma Sou Solidário conecta doadores a campanhas de socorro em desastres e causas sociais.
            Faça a diferença na vida de quem precisa com doações físicas, educacional ou financeiras.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Apoie a Educação Solidária e a Acessibilidade Digital
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Contribua em causas humanitárias
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Doe itens ou valores financeiros 
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Acompanhe suas doações
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Crie suas próprias campanhas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}