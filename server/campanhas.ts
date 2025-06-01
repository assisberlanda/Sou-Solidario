import express from "express";
import { storage } from "./storage";

const router = express.Router();

// Middleware de autenticação
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
};

// Criar campanha (requer autenticação)
router.post("/api/campanhas", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const campaignData = {
      title: req.body.titulo,
      description: req.body.descricao,
      location: req.body.location || "",
      startDate: req.body.data_inicio || new Date().toISOString(),
      endDate: req.body.data_fim || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now if not specified
      imageUrl: req.body.imageUrl || "",
      status: "active",
      active: true,
      createdBy: req.user.id,
      uniqueCode: Math.random().toString(36).substring(7).toUpperCase(),
      urgent: req.body.urgent || false,
      pickupSchedule: JSON.stringify({
        inicio: req.body.horarios_inicio || "09:00",
        fim: req.body.horarios_fim || "18:00"
      }),
      districts: JSON.stringify(req.body.bairros || [])
    };

    // Validate using schema
    console.log("Campaign data to be inserted:", campaignData);
    const validatedData = insertCampaignSchema.parse(campaignData);

    console.log("Dados para criação da campanha:", campaignData);
    
    // Validate required fields
    if (!campaignData.title || !campaignData.description || !campaignData.endDate) {
      console.error("Erro: campos obrigatórios faltando");
      return res.status(400).json({
        error: "Campos obrigatórios faltando",
        message: "Título, descrição e data de término são obrigatórios"
      });
    }
    const campanha = await storage.createCampaign(campaignData);
    console.log("Campanha criada:", campanha);
    res.status(201).json(campanha);
  } catch (error) {
    console.error("Erro ao criar campanha:", error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: "Erro ao criar campanha" });
  }
});

// Listar campanhas
router.get("/api/campanhas", async (req, res) => {
  try {
    const campanhas = await storage.getCampaigns();
    res.json(campanhas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar campanhas" });
  }
});

// Deletar campanha
router.delete("/api/campanhas/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await storage.deleteCampaign(parseInt(req.params.id));
    if (deleted) {
      res.json({ message: "Campanha excluída com sucesso" });
    } else {
      res.status(404).json({ error: "Campanha não encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir campanha" });
  }
});

export default router;