import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex flex-col gap-4">
        <Button onClick={() => navigate("/cadastro-campanha")}>
          Cadastrar Nova Campanha
        </Button>

        <Button variant="outline" onClick={() => navigate("/minhas-campanhas")}>
          Ver Minhas Campanhas
        </Button>

        <Button variant="destructive" onClick={() => {
          fetch("/api/auth/logout", { method: "POST" }).then(() => {
            navigate("/admin");
            window.location.reload();
          });
        }}>
          Sair
        </Button>
      </div>
    </div>
  );
}
