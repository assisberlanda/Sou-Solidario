// client/src/pages/CadastroCampanha.tsx

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
);

export default function CadastroCampanha() {
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    horarios_inicio: "",
    horarios_fim: "",
  });

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [bairrosPorData, setBairrosPorData] = useState<{ [key: string]: string }>({});
  const [imagens, setImagens] = useState<File[]>([]);
  const [campanhaCadastrada, setCampanhaCadastrada] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBairroChange = (date: string, value: string) => {
    setBairrosPorData({ ...bairrosPorData, [date]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImagens(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imagensUrls: string[] = [];

    for (const imagem of imagens) {
      const { data, error } = await supabase.storage
        .from("campanhas-imagens")
        .upload(`campanhas/${uuidv4()}-${imagem.name}`, imagem);

      if (error) {
        alert("Erro ao fazer upload das imagens.");
        return;
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL!.replace(
        "supabase.co",
        "supabase.in"
      )}/storage/v1/object/public/campanhas-imagens/${data.path}`;
      imagensUrls.push(url);
    }

    const payload = {
      ...form,
      imagens: imagensUrls,
      dias_disponiveis: selectedDays.map((date) => ({
        data: date.toISOString().split("T")[0],
        bairro: bairrosPorData[date.toISOString().split("T")[0]] || "",
      })),
      horarios_disponiveis: {
        inicio: form.horarios_inicio,
        fim: form.horarios_fim,
      },
    };

    const res = await fetch("/api/campanhas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setCampanhaCadastrada(true); // ✅ Mostra mensagem de sucesso
    } else {
      alert("Erro ao cadastrar campanha!");
    }
  };

  // Se a campanha já foi cadastrada, mostrar opções
  if (campanhaCadastrada) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-green-600">Campanha cadastrada com sucesso!</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() => {
            setCampanhaCadastrada(false); // Resetar formulário para novo cadastro
            setForm({
              titulo: "",
              descricao: "",
              horarios_inicio: "",
              horarios_fim: "",
            });
            setSelectedDays([]);
            setBairrosPorData({});
            setImagens([]);
          }}
        >
          Cadastrar outra campanha
        </button>

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/admin/minhas-campanhas")}
        >
          Ver minhas campanhas
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Cadastro da Campanha</h2>

      <input
        name="titulo"
        placeholder="Nome da Campanha"
        value={form.titulo}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <textarea
        name="descricao"
        placeholder="Informações sobre a Campanha"
        value={form.descricao}
        onChange={handleChange}
        className="border p-2 w-full"
        rows={4}
      />

      <h2 className="text-lg font-bold mt-8">Anexe até 5 imagens da campanha</h2>
      <input
        type="file"
        accept="image/jpeg, image/jpg"
        multiple
        onChange={handleImageChange}
        className="border p-2 w-full"
      />

      <h2 className="text-lg font-bold mt-8">Insira a data disponível para coleta</h2>
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
              className="border p-2 w-full mt-2"
            />
          </label>
        </div>
      ))}

      <h2 className="text-lg font-bold mt-8">Insira o horário disponível para coleta</h2>
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

      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded w-full mt-8"
      >
        Cadastrar Campanha
      </button>
    </form>
  );
}
