// Sou-Solidario - cópia/server/auth.ts
// Configuração de autenticação com Passport.js

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";

// Importa o armazenamento em memória e as funções de hashing/comparação de senha
import { storage, hashPassword, comparePasswords } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema"; // Importa o schema para tipos e validação

// Estende os tipos Express Request e User para tipagem do TypeScript
declare global {
  namespace Express {
    // Assumindo que SelectUser do seu schema é o tipo correto para o objeto usuário
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-change-me", // Segredo de fallback
    resave: false, // Não salva a sessão se não houver alterações
    saveUninitialized: false, // Não cria sessão para requests não inicializadas
    store: storage.sessionStore, // Usa o armazenamento de sessão em memória (MemStore)
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      // secure: process.env.NODE_ENV === 'production', // Usar cookies seguros em produção (requer HTTPS)
      secure: false, // Manter false para desenvolvimento local simples (HTTP)
      sameSite: 'lax' // Permite cookies em requisições cross-site seguras (útil para testes locais)
    }
  };

  // Trust proxy necessário se deployado atrás de um proxy (como Vercel, Nginx, etc.)
  // Removido: app.set("trust proxy", 1); // Comentar ou remover para desenvolvimento local simples

  app.use(session(sessionSettings));
  app.use(passport.initialize()); // Inicializa o Passport
  app.use(passport.session()); // Habilita sessões do Passport

  // Configura a estratégia de autenticação local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Usa o método de armazenamento em memória para buscar usuário pelo username
        const user = await storage.getUserByUsername(username);
        if (!user) {
          // Usuário não encontrado
          return done(null, false, { message: "Usuário não encontrado" });
        }

        // Compara a senha fornecida com a senha hash armazenada usando a função importada
        if (!(await comparePasswords(password, user.password))) {
          // Senha incorreta
          return done(null, false, { message: "Senha incorreta" });
        }

        // Autenticação bem-sucedida, retorna o objeto usuário
        return done(null, user);
      } catch (error) {
        // Lida com quaisquer erros durante o processo (ex: erro no storage)
        console.error("Erro na LocalStrategy:", error);
        return done(error); // Passa o erro para o Express lidar
      }
    }),
  );

  // Serializa o usuário: armazena apenas o ID do usuário na sessão
  passport.serializeUser((user, done) => {
    done(null, user.id); // Usa user.id do modelo User
  });

  // Desserializa o usuário: recupera o objeto usuário do armazenamento usando o ID da sessão
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Usa o método de armazenamento em memória para buscar usuário por ID
      const user = await storage.getUser(id);
      // done(null, user) - se user for undefined, Passport entende como falha na deserialização
      done(null, user);
    } catch (error) {
      console.error("Erro em deserializeUser:", error);
      done(error); // Passa o erro se a consulta ao storage falhar
    }
  });

  // --- Rotas de API de Autenticação ---

  // Rota de registro
  app.post("/api/register", async (req, res, next) => {
    try {
      // Usa o schema Zod para validar os dados de entrada
      const parsedBody = insertUserSchema.safeParse(req.body);

      if (!parsedBody.success) {
        // Retorna erros de validação Zod
        return res.status(400).json({
          message: "Dados de registro inválidos",
          errors: parsedBody.error.errors, // Retorna os detalhes dos erros de validação
        });
      }

      // Extrai os dados válidos e define o role padrão se não vier
      const { username, password, name, email, role = "user", organization, phone, city, district, about } = parsedBody.data;

      // Verifica se email ou username já existem usando os métodos do storage em memória
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Faz hash da senha antes de armazenar usando a função hashPassword importada
      const hashedPassword = await hashPassword(password);

      // Cria usuário no storage em memória usando o método do storage
      const newUser = await storage.createUser({
        username,
        password: hashedPassword, // Armazena senha hash
        name,
        email,
        role, // Usa o role do input (com default 'user')
        organization,
        phone,
        city,
        district,
        about
      });

      // Loga o usuário após o registro bem-sucedido
      req.login(newUser, (err) => {
        if (err) {
          console.error("Erro ao logar após registro:", err);
          return next(err); // Deixa o Express lidar com o erro de login
        }
        // Retorna os dados do usuário (excluindo senha hash) após login bem-sucedido
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });

    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      // Lida com outros potenciais erros (ex: erros no storage, hashing)
      res.status(500).json({ message: "Erro interno do servidor ao registrar usuário" });
    }
  });


  // Rota de login
  app.post("/api/login", (req, res, next) => {
    // Usa o middleware authenticate do Passport
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Erro na autenticação do Passport:", err);
        return next(err); // Deixa o Express lidar com o erro
      }
      if (!user) {
        // Autenticação falhou (info.message vem da estratégia local)
        return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      }

      // Autenticação bem-sucedida, loga o usuário
      req.login(user, (err) => {
        if (err) {
          console.error("Erro ao logar após autenticação:", err);
          return next(err); // Deixa o Express lidar com o erro de login
        }
        // Retorna os dados do usuário (excluindo senha hash) após login bem-sucedido
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next); // Chama o middleware authenticate com request, response e next
  });

  // Rota de logout
  app.post("/api/logout", (req, res, next) => {
    // Desloga o usuário do Passport
    req.logout((err) => {
      if (err) {
        console.error("Erro durante logout:", err);
        return next(err); // Deixa o Express lidar com o erro
      }
      // Destrói a sessão para garantir que todos os dados da sessão sejam removidos
      req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao destruir sessão:", err);
            // Retornar um erro 500, mas a conta foi deslogada do Passport
            return res.status(500).json({ message: "Logout realizado, mas ocorreu um erro ao encerrar a sessão." });
        }
        // Retorna sucesso após logout e destruição da sessão
        res.status(200).json({ message: "Logout realizado com sucesso." });
      });
    });
  });

  // Rota para obter usuário atual (requer sessão)
  app.get("/api/user", (req, res) => {
    // req.isAuthenticated() verifica se há um usuário na sessão desserializado pelo Passport
    if (!req.isAuthenticated() || !req.user) {
      // Não autenticado
      return res.status(401).json({ message: "Não autenticado" });
    }
    // Retorna os dados do usuário autenticado (excluindo senha hash)
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Rota para atualizar usuário (requer autenticação)
   app.put("/api/user", (req, res, next) => {
     if (!req.isAuthenticated() || !req.user) {
       return res.status(401).json({ message: "Não autenticado" });
     }

     try {
       const userId = req.user.id;
       // Define os campos permitidos para atualização pelo usuário
       const allowedUpdates: Array<keyof User> = ["name", "email", "organization", "phone", "city", "district", "about"];
       const updates: Partial<User> = {};

       // Popula o objeto 'updates' apenas com os campos permitidos que vieram no corpo da requisição
       for (const key in req.body) {
           if (allowedUpdates.includes(key as keyof User)) {
               // Adicionar validação específica para campos se necessário (ex: validar formato de email)
               updates[key as keyof User] = req.body[key];
           }
       }

       if (Object.keys(updates).length === 0) {
            // Retorna 400 se nenhum campo válido para atualização foi fornecido
            return res.status(400).json({ message: "Nenhum campo válido fornecido para atualização" });
       }

       // Usa o método do storage em memória para atualizar usuário
       storage.updateUser(userId, updates).then(updatedUser => {
         if (!updatedUser) {
           // Isso não deveria acontecer se o usuário está logado, mas é um fallback seguro
           return res.status(404).json({ message: "Usuário não encontrado no armazenamento" });
         }

         // Retorna o usuário atualizado sem senha hash
         const { password, ...userWithoutPassword } = updatedUser;
         res.json(userWithoutPassword);
       }).catch(next); // Deixa o Express lidar com outros erros do storage

     } catch (error) {
       console.error("Erro ao atualizar usuário:", error);
       res.status(500).json({ message: "Erro interno do servidor ao atualizar usuário" });
     }
   });

   // Rota para excluir usuário (requer autenticação)
    app.delete("/api/user", (req, res, next) => {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.user.id;

      // Usa o método do storage em memória para excluir o usuário
      storage.deleteUser(userId).then(success => {
        if (!success) {
          // Usuário não encontrado para exclusão
          return res.status(404).json({ message: "Usuário não encontrado ou já excluído" });
        }

        // Desloga o usuário e destrói a sessão após a exclusão bem-sucedida
        req.logout((err) => {
          if (err) {
             console.error("Erro ao deslogar após exclusão de conta:", err);
             // Continua com a destruição da sessão mesmo se o logout tiver problemas
          }
          req.session.destroy((err) => {
             if (err) {
                 console.error("Erro ao destruir sessão após exclusão de conta:", err);
                 // Retorna 500, mas a conta foi excluída e deslogada do Passport
                 return res.status(500).json({ message: "Conta excluída, mas ocorreu um erro ao encerrar a sessão." });
             }
             // Retorna sucesso após logout e destruição da sessão
             res.status(200).json({ message: "Conta excluída com sucesso." });
           });
        });
      }).catch(next); // Deixa o Express lidar com outros erros do storage
    });
}