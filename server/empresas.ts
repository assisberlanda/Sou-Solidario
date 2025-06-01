import express from "express";
import { storage } from "./storage";

const router = express.Router();

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
};

// Cadastro de empresa
router.post("/api/empresas", async (req, res) => {
  try {
    const userData = {
      username: req.body.email,
      password: req.body.senha,
      name: req.body.nome,
      email: req.body.email,
      phone: req.body.telefone,
      city: req.body.cidade,
      district: req.body.bairro,
      about: req.body.sobre,
      role: 'empresa'
    };

    // Validate using schema
    const validatedData = insertUserSchema.parse(userData);

    // Check existing user
    const existingUser = await storage.getUserByUsername(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // Create user
    const user = await storage.createUser(validatedData);
    res.status(201).json({ user });
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    res.status(500).json({ error: "Erro ao cadastrar empresa" });
  }
});

export default router;