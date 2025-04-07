
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

// Rota para deletar uma campanha por ID
app.delete("/api/campanhas/:id", async (c) => {
  const id = c.req.param("id");

  const { error } = await supabase.from("campanhas").delete().eq("id", id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: "Campanha excluída com sucesso" });
});

export const handler = handle(app);

serve({ fetch: app.fetch, port: 3000 });
