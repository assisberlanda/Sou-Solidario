// client/src/pages/MinhasCampanhas.tsx

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Campanha {
  id: string;
  titulo: string;
  descricao?: string;
  imagens?: string[]; // Corrigido para aceitar imagens como array de string
}

export default function MinhasCampanhas() {
  const [, navigate] = useLocation();
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarMinhasCampanhas();
  }, []);

  async function carregarMinhasCampanhas() {
    setLoading(true);
    const res = await fetch("/api/minhas-campanhas");
    if (res.ok) {
      const data = await res.json();
      setCampanhas(data);
    }
    setLoading(false);
  }

  async function excluirCampanha(id: string) {
    const confirmar = confirm("Tem certeza que deseja excluir esta campanha?");
    if (!confirmar) return;

    const res = await fetch(`/api/campanhas/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Campanha excluída com sucesso!");
      carregarMinhasCampanhas(); // Atualiza a lista depois de excluir
    } else {
      alert("Erro ao excluir a campanha!");
    }
  }

  if (loading) {
    return <p>Carregando campanhas...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Minhas Campanhas</h1>
        <Button onClick={() => navigate("/cadastro-campanha")}>
          Nova Campanha
        </Button>
      </div>

      {campanhas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma campanha cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campanhas.map((campanha) => (
            <Card key={campanha.id}>
              <CardContent className="p-4 space-y-4">
                {/* Corrigido aqui */}
                {campanha.imagens && campanha.imagens.length > 0 && (
                  <img
                    src={campanha.imagens[0]}
                    alt="Imagem da campanha"
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <h2 className="text-xl font-bold">{campanha.titulo}</h2>
                {campanha.descricao && (
                  <p className="text-gray-700">{campanha.descricao}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => excluirCampanha(campanha.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
