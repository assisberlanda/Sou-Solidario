import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertCampaignSchema, 
  insertNeededItemSchema, 
  insertDonationSchema, 
  insertDonationItemSchema,
  insertFinancialDonationSchema,
  financialDonationProcessSchema
} from "@shared/schema";
import QRCode from "qrcode";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir arquivos estáticos da pasta assets
  app.use('/assets', express.static(path.join(process.cwd(), 'client/src/assets/images')));
  
  // Configuração da sessão
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000, // limpar sessões expiradas a cada 24h
      }),
      secret: "sou-solidario-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // deveria ser true em produção com HTTPS
        maxAge: 8 * 60 * 60 * 1000 // 8 horas
      }
    })
  );

  // Autenticação
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // @ts-ignore
      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      };
      
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Erro no servidor" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    return res.json(user);
  });

  // Middleware de autenticação para rotas protegidas
  const requireAuth = (req: Request, res: Response, next: Function) => {
    // @ts-ignore
    if (!req.session.user) {
      return res.status(401).json({ message: "Acesso não autorizado" });
    }
    next();
  };

  // Middleware para verificar se é admin
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    // @ts-ignore
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: "Acesso restrito a administradores" });
    }
    next();
  };

  // Rotas de Campanhas
  app.get("/api/campaigns", async (_req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      return res.json(campaigns);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar campanhas" });
    }
  });

  app.get("/api/campaigns/code/:code", async (req: Request, res: Response) => {
    try {
      const code = req.params.code;
      const campaign = await storage.getCampaignByCode(code);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      return res.json(campaign);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar campanha pelo código" });
    }
  });

  app.get("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      return res.json(campaign);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar campanha" });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(data);
      return res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Erro ao criar campanha" });
    }
  });

  app.put("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCampaign = await storage.updateCampaign(id, req.body);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      return res.json(updatedCampaign);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar campanha" });
    }
  });

  app.delete("/api/campaigns/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCampaign(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      return res.json({ message: "Campanha excluída com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao excluir campanha" });
    }
  });



  // Gerar QR Code para campanha
  app.get("/api/campaigns/:id/qrcode", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      // Gerar URL com base no domínio da requisição e no código único da campanha
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const campaignUrl = `${baseUrl}/doar/codigo/${campaign.uniqueCode}`;
      
      // Gerar QR Code como string base64
      const qrCodeDataUrl = await QRCode.toDataURL(campaignUrl);
      
      return res.json({ qrCodeDataUrl, campaignUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao gerar QR Code" });
    }
  });

  // Rotas de Categorias
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  // Rotas de Itens Necessários
  app.get("/api/campaigns/:campaignId/items", async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const items = await storage.getNeededItems(campaignId);
      return res.json(items);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar itens necessários" });
    }
  });

  app.post("/api/needed-items", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertNeededItemSchema.parse(req.body);
      const neededItem = await storage.createNeededItem(data);
      return res.status(201).json(neededItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Erro ao criar item necessário" });
    }
  });

  app.put("/api/needed-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedItem = await storage.updateNeededItem(id, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      
      return res.json(updatedItem);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar item necessário" });
    }
  });

  app.delete("/api/needed-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNeededItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      
      return res.json({ message: "Item excluído com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao excluir item necessário" });
    }
  });

  // Rotas de Doações
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      
      // Processar os itens da doação
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.createDonationItem({
            donationId: donation.id,
            neededItemId: item.neededItemId,
            quantity: item.quantity
          });
        }
      }
      
      return res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      return res.status(500).json({ message: "Erro ao registrar doação" });
    }
  });

  app.get("/api/donations", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      const donations = await storage.getDonations(campaignId);
      
      // Para cada doação, buscar os itens
      const donationsWithItems = await Promise.all(
        donations.map(async (donation) => {
          const items = await storage.getDonationItems(donation.id);
          return { ...donation, items };
        })
      );
      
      return res.json(donationsWithItems);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar doações" });
    }
  });

  app.get("/api/donations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.getDonation(id);
      
      if (!donation) {
        return res.status(404).json({ message: "Doação não encontrada" });
      }
      
      const items = await storage.getDonationItems(donation.id);
      
      return res.json({ ...donation, items });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar doação" });
    }
  });

  app.put("/api/donations/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const updatedDonation = await storage.updateDonationStatus(id, status);
      
      if (!updatedDonation) {
        return res.status(404).json({ message: "Doação não encontrada" });
      }
      
      return res.json(updatedDonation);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar status da doação" });
    }
  });
  
  // Rotas de Gerenciadores de Campanha
  app.post("/api/campaign-managers/register", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, document, password, bankAccount } = req.body;
      
      // Criar gerenciador
      const manager = await storage.createCampaignManager({
        name,
        email,
        phone,
        document,
        password // Em produção, deve-se usar hash da senha
      });

      // Criar conta bancária
      const bankAccountData = await storage.createBankAccount({
        managerId: manager.id,
        ...bankAccount
      });

      return res.status(201).json({
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email
        },
        bankAccount: bankAccountData
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  app.post("/api/campaign-managers/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const manager = await storage.getCampaignManagerByEmail(email);

      if (!manager || manager.password !== password) { // Em produção, comparar hash
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // @ts-ignore
      req.session.manager = {
        id: manager.id,
        name: manager.name,
        email: manager.email
      };

      return res.json({
        id: manager.id,
        name: manager.name,
        email: manager.email
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  // Middleware para verificar se é gerenciador de campanha
  const requireManager = (req: Request, res: Response, next: Function) => {
    // @ts-ignore
    if (!req.session.manager) {
      return res.status(401).json({ message: "Acesso não autorizado" });
    }
    next();
  };

  app.post("/api/campaigns", requireManager, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const managerId = req.session.manager.id;
      const campaignData = {
        ...req.body,
        managerId,
        uniqueCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      const campaign = await storage.createCampaign(campaignData);
      return res.status(201).json(campaign);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar campanha" });
    }
  });

  // Rotas de Doações Financeiras
  app.post("/api/financial-donations", async (req: Request, res: Response) => {
    try {
      // Validar e processar os dados da doação financeira
      const validatedData = financialDonationProcessSchema.parse(req.body);
      
      // Informações da conta bancária para doação (em um ambiente real, estas seriam definidas para cada campanha)
      const accountInfo = {
        banco: "Banco do Brasil",
        agencia: "1234-5",
        conta: "12345-6",
        pix: "contato@sousolidario.org.br",
        favorecido: "Associação Sou Solidário"
      };
      
      // Preparar os dados para salvar no banco
      const financialDonation = await storage.createFinancialDonation({
        campaignId: validatedData.campaignId,
        donorName: validatedData.donorName,
        donorEmail: validatedData.donorEmail,
        donorPhone: validatedData.donorPhone,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        accountInfo: JSON.stringify(accountInfo),
        message: validatedData.message,
        status: "pendente"
      });
      
      return res.status(201).json({
        ...financialDonation,
        accountInfo
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      return res.status(500).json({ message: "Erro ao registrar doação financeira" });
    }
  });
  
  app.get("/api/financial-donations", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      const donations = await storage.getFinancialDonations(campaignId);
      return res.json(donations);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar doações financeiras" });
    }
  });
  
  app.get("/api/financial-donations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.getFinancialDonation(id);
      
      if (!donation) {
        return res.status(404).json({ message: "Doação financeira não encontrada" });
      }
      
      return res.json(donation);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar doação financeira" });
    }
  });
  
  app.put("/api/financial-donations/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const updatedDonation = await storage.updateFinancialDonationStatus(id, status);
      
      if (!updatedDonation) {
        return res.status(404).json({ message: "Doação financeira não encontrada" });
      }
      
      return res.json(updatedDonation);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar status da doação financeira" });
    }
  });

  // API do Chatbot (simplificada)
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, campaignId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Mensagem inválida" });
      }
      
      let response = "Olá! Como posso ajudar você com sua doação hoje?";
      
      // Lógica simples para respostas do chatbot
      const messageLower = message.toLowerCase();
      
      if (messageLower.includes("como doar") || messageLower.includes("fazer doação")) {
        response = "Para fazer uma doação de itens, selecione uma campanha, escolha os itens que deseja doar, informe seus dados e agende a coleta. É simples e rápido! Você também pode fazer uma doação financeira por PIX, transferência ou depósito bancário.";
      }
      else if (messageLower.includes("dinheiro") || messageLower.includes("financeira") || messageLower.includes("pix") || messageLower.includes("transferência") || messageLower.includes("depósito")) {
        response = "Para fazer uma doação financeira, selecione uma campanha, clique em 'Doar em Dinheiro', informe o valor e escolha entre PIX, transferência bancária ou depósito. Todas as informações para pagamento serão fornecidas após o preenchimento do formulário.";
      }
      else if (messageLower.includes("endereço") || messageLower.includes("local")) {
        response = "Não é necessário levar suas doações a um ponto de coleta. Nós iremos até você! Basta informar seu endereço e agendar um horário que seja conveniente.";
      }
      else if (messageLower.includes("horário") || messageLower.includes("quando")) {
        response = "Você pode agendar a coleta para qualquer dia útil, das 8h às 18h. Escolha o melhor horário para você!";
      }
      else if (messageLower.includes("contato") || messageLower.includes("telefone")) {
        response = "Para mais informações, entre em contato conosco pelo telefone (11) 1234-5678 ou pelo e-mail contato@sousolidario.org.br";
      }
      else if (messageLower.includes("agradecer") || messageLower.includes("obrigado")) {
        response = "Nós que agradecemos sua generosidade! Juntos podemos fazer a diferença na vida de muitas pessoas.";
      }
      
      // Se tiver um ID de campanha, personalizar a resposta
      if (campaignId) {
        try {
          const id = parseInt(campaignId);
          const campaign = await storage.getCampaign(id);
          const items = await storage.getNeededItems(id);
          
          if (campaign && messageLower.includes("precisa") || messageLower.includes("itens") || messageLower.includes("necessário")) {
            response = `Para a campanha "${campaign.title}", estamos precisando principalmente de: \n`;
            
            const priorityItems = items
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 5);
              
            priorityItems.forEach(item => {
              response += `- ${item.name}\n`;
            });
            
            response += "\nVocê gostaria de doar algum desses itens?";
          }
        } catch (error) {
          // Ignorar erros aqui e usar resposta padrão
        }
      }
      
      setTimeout(() => {}, 500); // Simular tempo de processamento
      
      return res.json({ message: response });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao processar mensagem" });
    }
  });

  // Servir imagens da pasta de assets
  app.use("/assets", express.static(path.join(process.cwd(), "client/src/assets/images")));

  const httpServer = createServer(app);

  return httpServer;
}
