import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Menu Topo */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">
          Sou Solidário
        </div>
        <div className="text-sm text-gray-700">
          {isLoading ? "Carregando..." : user ? `Logado como: ${user.nome}` : "Não autenticado"}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

          {/* Aqui você pode colocar os cards, campanhas, tabelas, etc */}
          <div className="text-gray-600">
            Seja bem-vindo ao painel administrativo! 
            {/* Exemplo: Você pode listar campanhas aqui */}
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-white text-center text-xs text-gray-400 py-4">
        &copy; {new Date().getFullYear()} Sou Solidário. Todos os direitos reservados.
      </footer>
    </div>
  );
}
