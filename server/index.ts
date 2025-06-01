// Sou-Solidario - cópia/server/index.ts
// Ponto de entrada principal do servidor

import express from "express";
import { createServer } from "node:http";
import { config } from "dotenv"; // Para carregar arquivo .env
import path from 'path'; // Importação já adicionada
import fs from 'fs'; // Importação já adicionada
import { nanoid } from 'nanoid'; // Importação já adicionada
import multer from 'multer'; // Importação já adicionada

import { setupViteDevMiddleware, serveStatic } from "./vite";
import { setupAuth } from "./auth";
import { registerRoutes } from "./routes";
// import { storage } from "./storage"; // storage é usado internamente pelos módulos importados

// Carrega variáveis de ambiente do arquivo .env
config();

const app = express();
const server = createServer(app); // Cria instância do servidor HTTP para Express e HMR do Vite

// --- Middlewares Globais ---
// Processa corpos de requisição como JSON. Deve vir antes das definições de rota que usam req.body
app.use(express.json());

// --- Configuração de Upload de Arquivos Local (Temporário) ---
const UPLOAD_DIR = path.resolve(import.meta.dirname, '..', 'uploads', 'temp'); // Diretório para salvar uploads

// Cria o diretório de upload se não existir
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`📦 Diretório de upload criado: ${UPLOAD_DIR}`);
}

// Configura o multer para armazenamento em disco
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Salva no diretório temporário
  },
  filename: (req, file, cb) => {
    // Cria um nome de arquivo único para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Pega a extensão original do arquivo
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ storage: storageConfig });

// --- Middleware para servir arquivos estáticos ---
// Serve os arquivos temporários da pasta 'uploads/temp' sob a URL '/uploads'
// Este middleware deve vir ANTES das rotas de API para que as URLs de upload sejam tratadas
app.use('/uploads', express.static(UPLOAD_DIR));

// As imagens de exemplo em client/src/assets/images são servidas pela rota em server/routes.ts
// app.use('/assets', express.static(path.join(process.cwd(), 'client/src/assets/images'))); // Removido daqui, está em routes.ts


// --- Rota para processar Uploads de Imagem da Campanha ---
// Define a rota POST /api/uploads/campaign-images
// Usa o middleware 'upload.array' para processar vários arquivos no campo 'images'
app.post('/api/uploads/campaign-images', upload.array('images', 5), (req, res) => {
  try {
    // req.files contém um array de arquivos salvos pelo multer
    const files = req.files as Express.Multer.File[]; // Asserção de tipo
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    // Constrói as URLs para acessar os arquivos salvos estaticamente
    const imageUrls = files.map(file => `/uploads/${file.filename}`);

    // Retorna as URLs para o frontend
    res.status(200).json({ imageUrls });

  } catch (error) {
    console.error('Erro no upload de imagens:', error);
    res.status(500).json({ message: 'Erro ao processar o upload das imagens.' });
  }
});


// --- Configuração de Autenticação e Passport ---
// Monta as rotas /api/register, /api/login, /api/logout, /api/user.
// Deve vir antes de qualquer rota que use requireAuth.
setupAuth(app);

// --- Configuração de Outras Rotas da API ---
// Monta rotas como /api/campaigns, /api/donations, etc.
// Essas rotas devem vir DEPOIS das rotas de autenticação se dependerem de req.user.
registerRoutes(app)
  .then(() => console.log("✨ Configuração das rotas principais completa."))
  .catch(error => {
      console.error("❌ Falha ao configurar as rotas principais:", error);
      // Dependendo da gravidade, pode optar por sair do processo ou apenas logar
      // process.exit(1);
  });


// --- Serviço do Frontend ---
// Em ambiente de desenvolvimento, usamos o middleware do Vite para servir e atualizar o frontend.
// Em ambiente de produção, servimos os arquivos estáticos construídos.
if (process.env.NODE_ENV === 'production') {
    console.log("🚚 Servindo arquivos estáticos de produção...");
    serveStatic(app); // Usa a função serveStatic de vite.ts
} else { // <--- AQUI ESTÁ O BLOCO ELSE
    console.log("🛠️ Configurando middleware de desenvolvimento do Vite...");
    // setupViteDevMiddleware retorna { middleware, vite }
    setupViteDevMiddleware(server)
        // O .then() encadeia APÓS a configuração assíncrona do Vite
        .then(({ middleware, vite }) => {
            // Este código é executado DENTRO do THEN (após a configuração do Vite)
            // Adiciona o middleware principal do Vite ao Express
            app.use(middleware);

            // Fallback para servir o index.html em requisições que não são API ou arquivos estáticos conhecidos
            // Isso permite que o roteamento do lado do cliente (Wouter) funcione.
            // Este middleware deve vir DEPOIS de TODAS as rotas de API e rotas estáticas dedicadas (/uploads, /assets)
            app.use("*", async (req, res, next) => {
              const url = req.originalUrl;

               // Se a requisição é para uma rota de API ou assets/uploads que não foi tratada acima,
               // deixa o Express lidar com isso (geralmente resultará em 404)
               if (url.startsWith('/api/') || url.startsWith('/assets/') || url.startsWith('/uploads/')) {
                   return next();
               }

              try {
                // Caminho para o index.html no diretório do cliente
                const clientTemplate = path.resolve(
                  import.meta.dirname,
                  "..", // Sai da pasta server
                  "client", // Entra na pasta client
                  "index.html"
                );

                // Lê e transforma o index.html usando o Vite (para injeção de HMR, vars, etc.)
                // Adicionado tratamento de erro caso o arquivo index.html não exista
                let template: string;
                try {
                     template = await fs.promises.readFile(clientTemplate, "utf-8");
                } catch (readError) {
                    console.error("Erro ao ler index.html:", readError);
                    return res.status(500).send("Erro ao carregar o aplicativo frontend.");
                }

                 // Adiciona um cache-buster simples para o script principal em desenvolvimento (opcional, Vite HMR já ajuda)
                // nanoid já deve estar importado
                template = template.replace(
                   `src="/src/main.tsx"`,
                   `src="/src/main.tsx?v=${nanoid()}"`,
                );

                const page = await vite.transformIndexHtml(url, template);

                // Envia a página HTML transformada
                res.status(200).set({ "Content-Type": "text/html" }).end(page);

              } catch (e) {
                // Em caso de erro no processamento do index.html (ex: erro no Vite)
                vite.ssrFixStacktrace(e as Error);
                next(e); // Passa o erro para o próximo manipulador de erros (se houver)
              }
            }); // <--- FIM DO app.use("*", ...)


            console.log("📦 Middleware Vite e fallback HTML configurados."); // <-- FIM DA LÓGICA DENTRO DO THEN

        }) // <--- FIM DO .then()
        // O .catch() encadeia APÓS o .then(), lidando com erros na configuração do Vite
        .catch(error => {
            console.error("❌ Falha crítica na configuração do Vite:", error);
            // Sair do processo se o Vite não puder ser configurado em dev
            process.exit(1);
        }); // <--- FIM DO .catch()
    // A chave de fechamento do bloco ELSE está IMPLICITAMENTE AQUI
    // A estrutura `if (...) { ... } else { ... }` está correta.
    // A estrutura `promessa.then(...).catch(...);` também está correta.
    // O problema é a combinação, como se houvesse um ';' no lugar errado
    // ou uma chave extra fechando o bloco do THEN ou CATCH prematuramente.
} // <-- A CHAVE DE FECHAMENTO DO BLOCO IF/ELSE ESTÁ AQUI

// --- Inicia Servidor HTTP ---
// O servidor Express está pronto para receber requisições.
const port = process.env.PORT || 5000; // Usa var de ambiente PORT ou padrão para 5000
const host = process.env.HOST || "localhost"; // Usa var de ambiente HOST ou padrão para localhost

server.listen(port, () => {
  console.log(`🚀 Servidor Express rodando em http://${host}:${port}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});