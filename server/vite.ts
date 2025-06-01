// Sou-Solidario - cópia/server/vite.ts
// Refatorado para apenas configurar e retornar o middleware Vite e a instância vite

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite"; // Importa ViteDevServer
import { type Server } from "http"; // Apenas o tipo Server
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Esta função agora configura e retorna a instância do servidor Vite DEV
// E o middleware principal para ser usado pelo Express
export async function setupViteDevMiddleware(server: Server): Promise<{ middleware: express.RequestHandler, vite: ViteDevServer }> {
  const serverOptions = {
    middlewareMode: true as true, // Força para ser `true`
    hmr: { server }, // Conecta HMR ao servidor Express
    allowedHosts: true as true, // Força para `true` se necessário em Replit/outros ambientes
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false, // Não busca vite.config.ts no client, usa o importado
    customLogger: { // Log customizado
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Remover process.exit(1) aqui para permitir que o servidor continue
        // mesmo se houver erros de build frontend não críticos
        // process.exit(1); // Removido ou comentado
      },
    },
    server: serverOptions,
    appType: "custom", // Indica que Express/backend gerencia o serviço
  });

  // Apenas retorna o middleware e a instância vite, não adiciona ao app aqui
  return { middleware: vite.middlewares, vite };
}

// Função para servir arquivos estáticos de produção (usada em index.ts quando NODE_ENV=production)
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public"); // Caminho corrigido para dist/public

  if (!fs.existsSync(distPath)) {
    console.warn(`Diretório de build não encontrado: ${distPath}. Certifique-se de executar 'npm run build' em modo de produção.`);
    // Não lançar erro fatal aqui, a aplicação pode continuar se não for o modo esperado
    // throw new Error(
    //   `Could not find the build directory: ${distPath}, make sure to build the client first`,
    // );
  } else {
     log(`Servindo arquivos estáticos de: ${distPath}`);
  }


  app.use(express.static(distPath));

  // O fallback para index.html para frontend routing em produção também é feito aqui
  // Qualquer rota que não seja tratada por arquivos estáticos, cai para o index.html
  app.use("*", (req, res) => {
    const indexHtmlPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexHtmlPath)) {
       res.sendFile(indexHtmlPath);
    } else {
       res.status(404).send("Frontend build not found."); // Melhor mensagem se index.html não existir
    }

  });
}