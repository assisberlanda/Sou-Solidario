import { useState } from "react";

export default function CadastroEmpresa() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    bairro: "",
    campanhas: "",
    imagens: "",
    dias_disponiveis: "",
    horarios_disponiveis: "",
    senha: "" // Added password field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      campanhas: form.campanhas.split(",").map((item) => item.trim()),
      imagens: form.imagens.split(",").map((item) => item.trim()),
      dias_disponiveis: form.dias_disponiveis
        .split(",")
        .map((item) => item.trim()),
      horarios_disponiveis: form.horarios_disponiveis
        .split(",")
        .map((item) => item.trim()),
      role: 'empresa' // Explicitly setting the role
    };

    const res = await fetch("/api/users", { // Assumed API endpoint for user creation
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Empresa cadastrada com sucesso!");
      setForm({
        nome: "",
        email: "",
        telefone: "",
        cidade: "",
        bairro: "",
        campanhas: "",
        imagens: "",
        dias_disponiveis: "",
        horarios_disponiveis: "",
        senha: "" // Clear password field
      });
    } else {
      alert("Erro ao cadastrar empresa!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        name="nome"
        placeholder="Nome da Empresa"
        value={form.nome}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="telefone"
        placeholder="Telefone"
        value={form.telefone}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="cidade"
        placeholder="Cidade"
        value={form.cidade}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="bairro"
        placeholder="Bairro"
        value={form.bairro}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="campanhas"
        placeholder="Campanhas (separadas por vírgula)"
        value={form.campanhas}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="imagens"
        placeholder="URLs das imagens (separadas por vírgula)"
        value={form.imagens}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="dias_disponiveis"
        placeholder="Dias disponíveis (separados por vírgula)"
        value={form.dias_disponiveis}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="horarios_disponiveis"
        placeholder="Horários disponíveis (separados por vírgula)"
        value={form.horarios_disponiveis}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        type="password"
        name="senha"
        placeholder="Senha"
        value={form.senha}
        onChange={handleChange}
        className="border p-2 w-full"
      /> {/* Added password input field */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Cadastrar Empresa
      </button>
    </form>
  );
}