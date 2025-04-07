
import { useEffect, useState } from "react";

interface Campanha {
  id: string;
  titulo: string;
  descricao?: string;
  imagem?: string;
  data_inicio?: string;
  data_fim?: string;
}

export default function ListarCampanhas() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCampanhas();
  }, []);

  async function carregarCampanhas() {
    setLoading(true);
    const res = await fetch("/api/campanhas");
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
      carregarCampanhas(); // Atualiza a lista depois de excluir
    } else {
      alert("Erro ao excluir a campanha!");
    }
  }

  if (loading) return <p>Carregando campanhas...</p>;

  return (
    <div className="space-y-4">
      {campanhas.length === 0 ? (
        <p>Nenhuma campanha cadastrada.</p>
      ) : (
        campanhas.map((campanha) => (
          <div key={campanha.id} className="border p-4 rounded">
            <h2 className="font-bold text-lg">{campanha.titulo}</h2>
            {campanha.descricao && <p>{campanha.descricao}</p>}
            {campanha.imagem && (
              <img src={campanha.imagem} alt="Imagem da campanha" className="w-32 h-32 object-cover mt-2" />
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => excluirCampanha(campanha.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
>
                Excluir
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
