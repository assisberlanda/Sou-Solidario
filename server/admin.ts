
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// CORS
app.use("/*", cors());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Rota para listar empresas e suas campanhas
app.get("/api/admin/empresas-campanhas", async (c) => {
  const { data: empresas, error: empresasError } = await supabase
    .from("empresas")
    .select("id, nome, cidade, bairro");

  if (empresasError) {
    return c.json({ error: empresasError.message }, 500);
  }

  const { data: campanhas, error: campanhasError } = await supabase
    .from("campanhas")
    .select("id, empresa_id, titulo, descricao, imagem");

  if (campanhasError) {
    return c.json({ error: campanhasError.message }, 500);
  }

  const empresasComCampanhas = empresas.map((empresa) => ({
    ...empresa,
    campanhas: campanhas.filter((campanha) => campanha.empresa_id === empresa.id),
  }));

  return c.json(empresasComCampanhas);
});

export const handler = handle(app);

serve({ fetch: app.fetch, port: 3000 });
