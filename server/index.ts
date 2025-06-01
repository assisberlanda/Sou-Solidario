import express from "express";
import { createServer } from "node:http";
import { config } from "dotenv"; // Necessário para carregar SESSION_SECRET
import { setupVite, serveStatic } from "./vite"; // Importa funções do Vite
import { setupAuth } from "./auth"; // Importa a configuração de autenticação
import { registerRoutes } from "./routes"; // Importa o registro de rotas principais

config(); // Carrega variáveis de ambiente do arquivo .env

const app = express();
const server = createServer(app); // Cria o servidor HTTP

// Middleware para processar JSON no corpo das requisições
app.use(express.json());

// --- Configuração de Autenticação ---
// Isso configura as sessões e as rotas /api/login, /api/register, /api/logout, /api/user
setupAuth(app);

// --- Registro de Rotas Principais ---
// Isso registra as rotas /api/campaigns, /api/donations, etc.
// Elas usarão o 'storage' que, neste modo, é a MemStorage em memória
registerRoutes(app);

// --- Integração com o Frontend (Vite) ---
// Em ambiente de desenvolvimento (npm run dev), usamos o middleware do Vite.
// Em ambiente de produção (npm run build && npm start), servimos os arquivos estáticos construídos.
if (process.env.NODE_ENV !== "production") {
  console.log("Modo de desenvolvimento: Usando middleware Vite");
  setupVite(app, server); // Passa o servidor HTTP para o HMR do Vite
} else {
  console.log("Modo de produção: Servindo arquivos estáticos da pasta dist");
  serveStatic(app); // Serve a pasta 'dist/public' construída pelo Vite build
}

// Iniciar servidor HTTP
const port = 5000;
const host = "localhost"; // Geralmente localhost para desenvolvimento local

server.listen(port, () => {
  console.log(`🚀 Servidor Express rodando em http://${host}:${port}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Frontend development server integrado.`);
  } else {
     console.log(`Servindo frontend estático.`);
  }
});