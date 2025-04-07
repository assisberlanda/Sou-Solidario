// client/src/components/ListaMinhasCampanhas.tsx

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
);

interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
}

export default function ListaMinhasCampanhas() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigate] = useLocation();

  useEffect(() => {
    const fetchCampanhas = async () => {
      const user = supabase.auth.getUser();
      const empresaId = (await user).data?.user?.id;

      const { data, error } = await supabase
        .from("campanhas")
        .select("*")
        .eq("empresa_id", empresaId);

      if (!error && data) {
        setCampanhas(data);
      }
      setLoading(false);
    };

    fetchCampanhas();
  }, []);

  const excluirCampanha = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta campanha?");
    if (!confirmar) return;

    const { error } = await supabase.from("campanhas").delete().eq("id", id);

    if (!error) {
      alert("Campanha excluída com sucesso!");
      setCampanhas(campanhas.filter((c) => c.id !== id));
    } else {
      alert("Erro ao excluir campanha.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Carregando campanhas...</p>;
  }

  if (campanhas.length === 0) {
    return <p className="text-center mt-10">Nenhuma campanha cadastrada ainda.</p>;
  }

  return (
    <div className="grid gap-4">
      {campanhas.map((campanha) => (
        <Card key={campanha.id}>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold">{campanha.titulo}</h3>
            <p className="text-gray-700 mt-2">{campanha.descricao}</p>
            <div className="flex gap-4 mt-4">
              <Link href={`/editar-campanha/${campanha.id}`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => excluirCampanha(campanha.id)}>
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
