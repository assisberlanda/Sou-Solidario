// client/src/pages/EditarCampanha.tsx

import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
);

export default function EditarCampanha() {
  const params = useParams<{ id: string }>();
  const [navigate] = useLocation();
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    horarios_inicio: "",
    horarios_fim: "",
  });
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [bairrosPorData, setBairrosPorData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampanha = async () => {
      const { data, error } = await supabase.from("campanhas").select("*").eq("id", params.id).single();
      if (error) {
        alert("Erro ao carregar campanha");
        navigate("/minhas-campanhas");
      } else if (data) {
        setForm({
          titulo: data.titulo,
          descricao: data.descricao,
          horarios_inicio: data.horarios_disponiveis?.inicio || "",
          horarios_fim: data.horarios_disponiveis?.fim || "",
        });
        setSelectedDays(data.dias_disponiveis?.map((d: any) => new Date(d.data)) || []);
        const bairrosMap: { [key: string]: string } = {};
        data.dias_disponiveis?.forEach((d: any) => {
          bairrosMap[d.data] = d.bairro;
        });
        setBairrosPorData(bairrosMap);
      }
      setLoading(false);
    };

    fetchCampanha();
  }, [params.id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBairroChange = (date: string, value: string) => {
    setBairrosPorData({ ...bairrosPorData, [date]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      titulo: form.titulo,
      descricao: form.descricao,
      dias_disponiveis: selectedDays.map((date) => ({
        data: date.toISOString().split("T")[0],
        bairro: bairrosPorData[date.toISOString().split("T")[0]] || "",
      })),
      horarios_disponiveis: {
        inicio: form.horarios_inicio,
        fim: form.horarios_fim,
      },
    };

    const { error } = await supabase.from("campanhas").update(payload).eq("id", params.id);

    if (error) {
      alert("Erro ao atualizar campanha!");
    } else {
      alert("Campanha atualizada com sucesso!");
      navigate("/minhas-campanhas");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Carregando...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Editar Campanha</h2>

      <input
        name="titulo"
        placeholder="Título da Campanha"
        value={form.titulo}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <textarea
        name="descricao"
        placeholder="Descrição da Campanha"
        value={form.descricao}
        onChange={handleChange}
        className="border p-2 w-full"
        rows={4}
      />

      <h2 className="text-xl font-bold mt-8">Datas disponíveis</h2>
      <DayPicker
        mode="multiple"
        selected={selectedDays}
        onSelect={(days) => setSelectedDays(days || [])}
        className="border p-2"
      />

      {selectedDays.map((day) => (
        <div key={day.toISOString()} className="space-y-2">
          <label>
            Bairro para {day.toLocaleDateString()}:
            <input
              type="text"
              value={bairrosPorData[day.toISOString().split("T")[0]] || ""}
              onChange={(e) => handleBairroChange(day.toISOString().split("T")[0], e.target.value)}
              className="border p-2 w-full"
            />
          </label>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-8">Horário disponível</h2>
      <div className="flex gap-4">
        <input
          name="horarios_inicio"
          type="time"
          value={form.horarios_inicio}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          name="horarios_fim"
          type="time"
          value={form.horarios_fim}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <Button type="submit" className="bg-primary text-white px-4 py-2 rounded w-full mt-8">
        Salvar Alterações
      </Button>
    </form>
  );
}
