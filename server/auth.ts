
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "sousolidario-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
      secure: false, // Em produção deve ser true se estiver usando HTTPS
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Usuário não encontrado" });
        }
        
        // Em produção, comparar hash da senha
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Senha incorreta" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, email, role = "user", organization } = req.body;
      
      console.log("Dados recebidos:", { username, name, email, role, organization });

      // Validate required fields
      if (!username || !password || !name || !email) {
        return res.status(400).json({ 
          message: "Todos os campos obrigatórios devem ser preenchidos" 
        });
      }

      // Validate email format
      if (!email.includes('@')) {
        return res.status(400).json({
          message: "Email inválido"
        });
      }

      // Check if email already exists  
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        email,
        role,
        organization
      });

      // Log the user in after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Retornar o usuário sem a senha
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    // Retornar o usuário sem a senha
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  app.put("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    try {
      const userId = req.user.id;
      const { name, email, organization, phone } = req.body;
      
      // Atualizar usuário no storage
      storage.updateUser(userId, {
        name,
        email,
        organization,
        phone
      }).then(updatedUser => {
        if (!updatedUser) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }
        
        // Retornar o usuário atualizado sem a senha
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      res.status(500).json({ message: "Erro ao atualizar dados do usuário" });
    }
  });
  
  app.delete("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    try {
      const userId = req.user.id;
      
      // Primeiro, procurar campanhas do usuário
      storage.getCampaignsByUserId(userId).then(async (campaigns) => {
        // Excluir todas as campanhas do usuário
        for (const campaign of campaigns) {
          await storage.deleteCampaign(campaign.id);
        }
        
        // Depois, excluir o usuário
        storage.deleteUser(userId).then(success => {
          if (!success) {
            return res.status(404).json({ message: "Usuário não encontrado" });
          }
          
          // Fazer logout após a exclusão
          req.logout((err) => {
            if (err) {
              console.error("Erro ao fazer logout após exclusão:", err);
              return res.status(500).json({ message: "Erro ao finalizar exclusão da conta" });
            }
            
            res.status(200).json({ message: "Conta excluída com sucesso" });
          });
        });
      });
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      res.status(500).json({ message: "Erro ao excluir conta" });
    }
  });
}
