import express from "express";
import { createServer } from "node:http";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { setupVite } from "./vite"; // continua para frontend

config();

const app = express();
const server = createServer(app);

app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Rotas de API
app.post("/api/empresas", async (req, res) => {
  const {
    nome,
    email,
    telefone,
    cidade,
    bairro,
    campanhas,
    imagens,
    dias_disponiveis,
    horarios_disponiveis,
  } = req.body;

  const { data, error } = await supabase.from("empresas").insert([
    {
      id: uuidv4(),
      nome,
      email,
      telefone,
      cidade,
      bairro,
      campanhas,
      imagens,
      dias_disponiveis,
      horarios_disponiveis,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: "Empresa cadastrada com sucesso", data });
});

app.post("/api/campanhas", async (req, res) => {
  const { empresa_id, titulo, descricao, imagem, data_inicio, data_fim } = req.body;

  const { data, error } = await supabase.from("campanhas").insert([
    {
      id: uuidv4(),
      empresa_id,
      titulo,
      descricao,
      imagem,
      data_inicio,
      data_fim,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: "Campanha cadastrada com sucesso", data });
});

app.get("/api/campanhas", async (_req, res) => {
  const { data, error } = await supabase.from("campanhas").select("*").order("criado_em", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data);
});

app.delete("/api/campanhas/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("campanhas").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: "Campanha excluída com sucesso" });
});

app.get("/api/admin/empresas-campanhas", async (_req, res) => {
  const { data: empresas, error: empresasError } = await supabase
    .from("empresas")
    .select("id, nome, cidade, bairro");

  if (empresasError) return res.status(500).json({ error: empresasError.message });

  const { data: campanhas, error: campanhasError } = await supabase
    .from("campanhas")
    .select("id, empresa_id, titulo, descricao, imagem");

  if (campanhasError) return res.status(500).json({ error: campanhasError.message });

  const empresasComCampanhas = empresas.map((empresa) => ({
    ...empresa,
    campanhas: campanhas.filter((campanha) => campanha.empresa_id === empresa.id),
  }));

  return res.json(empresasComCampanhas);
});

// Integrar o Vite Middleware depois das rotas de API
setupVite(app, server);

// Iniciar servidor
server.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
