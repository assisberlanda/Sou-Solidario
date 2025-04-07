
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const app = new Hono();

// CORS
app.use("/*", cors());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Rota de cadastro de empresas
app.post("/api/empresas", async (c) => {
  const body = await c.req.json();
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
  } = body;

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

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: "Empresa cadastrada com sucesso", data });
});

export const handler = handle(app);

serve({ fetch: app.fetch, port: 3000 });
