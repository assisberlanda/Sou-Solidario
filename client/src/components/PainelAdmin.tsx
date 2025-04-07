
import { useEffect, useState } from "react";

interface Empresa {
  id: string;
  nome: string;
  cidade: string;
  bairro: string;
  campanhas: Campanha[];
}

interface Campanha {
  id: string;
  titulo: string;
  descricao?: string;
  imagem?: string;
}

export default function PainelAdmin() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const campanhasPorPagina = 5;

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    const res = await fetch("/api/admin/empresas-campanhas");
    if (res.ok) {
      const data = await res.json();
      setEmpresas(data);
    }
  }

  async function excluirCampanha(id: string) {
    const confirmar = confirm("Tem certeza que deseja excluir esta campanha?");
    if (!confirmar) return;

    const res = await fetch(`/api/campanhas/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Campanha excluída com sucesso!");
      carregarEmpresas();
    } else {
      alert("Erro ao excluir a campanha!");
    }
  }

  const campanhasPaginadas = (campanhas: Campanha[]) => {
    const start = (paginaAtual - 1) * campanhasPorPagina;
    return campanhas.slice(start, start + campanhasPorPagina);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      {empresas.length === 0 ? (
        <p>Nenhuma empresa cadastrada.</p>
      ) : (
        empresas.map((empresa) => (
          <div key={empresa.id} className="border p-6 rounded-lg mb-6 shadow-lg">
            <h2 className="text-2xl font-semibold">{empresa.nome}</h2>
            <p className="text-gray-600">{empresa.cidade} - {empresa.bairro}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {campanhasPaginadas(empresa.campanhas).map((campanha) => (
                <div key={campanha.id} className="border rounded-lg p-4 shadow-md bg-white">
                  <h3 className="font-bold">{campanha.titulo}</h3>
                  {campanha.descricao && <p className="text-sm mt-1">{campanha.descricao}</p>}
                  {campanha.imagem && (
                    <img src={campanha.imagem} alt="Imagem da campanha" className="w-full h-32 object-cover mt-2 rounded" />
                  )}
                  <button
                    onClick={() => excluirCampanha(campanha.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded mt-3 w-full"
                  >
                    Excluir Campanha
                  </button>
                </div>
              ))}
            </div>

            {empresa.campanhas.length > campanhasPorPagina && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginaAtual((prev) => prev + 1)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
