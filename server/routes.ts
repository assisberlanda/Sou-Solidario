// Sou-Solidario - cópia/server/routes.ts

import express, { type Express, Request, Response } from "express";
// Removido: import { createServer, type Server } from "http"; // Não é necessário criar o servidor aqui
import path from "path";
import { storage } from "./storage";
// Sou-Solidario - cópia/server/routes.ts

import express, { type Express, Request, Response } from "express";
// Removido: import { createServer, type Server } from "http"; // Não é necessário criar o servidor aqui
import path from "path";
import { storage } from "./storage";
import {
  // Importando todos os schemas e tipos necessários que agora estão exportados em shared/schema.ts
  insertCampaignSchema,
  insertNeededItemSchema, // Agora exportado
  donationProcessSchema, // Usado na rota POST /api/donations
  // insertDonationItemSchema, // Ainda não usado neste arquivo, pode remover a menos que adicione lógica que o use
  // insertFinancialDonationSchema, // Ainda não usado neste arquivo, pode remover a menos que adicione lógica que o use
  financialDonationProcessSchema, // Usado na rota POST /api/financial-donations
  // Importando os tipos necessários para tipagem
  Campaign,
  NeededItem,
  Category,
  User // Importado para tipar req.user corretamente após requireAuth
} from "../shared/schema";
import QRCode from "qrcode"; // Corrigiremos o erro de tipo abaixo
import { z } from "zod";
// Removido: import { setupAuth } from "./auth"; // setupAuth é chamado apenas em index.ts

// Declaração de módulo para 'qrcode' se @types/qrcode não estiver instalado ou configurado globalmente
// É preferível instalar @types/qrcode (`npm install --save-dev @types/qrcode`)
declare module 'qrcode'; // Manter esta linha como fallback

// ... O restante do código do arquivo server/routes.ts que corrigimos anteriormente ...
// (Ou cole todo o código corrigido do Passo 1 da resposta anterior)

// Lembre-se de manter todas as correções anteriores que fizemos:
// - Assinatura da função registerRoutes(app: Express): Promise<void>
// - Asserções de tipo `const user = req.user as User;` após requireAuth
// - Comentar ou remover as rotas /api/campaign-managers/*
// - Verificação `if (campaign)` na rota /api/chat
import QRCode from "qrcode";
import { z } from "zod";
// Removido: import { setupAuth } from "./auth"; // setupAuth é chamado apenas em index.ts

// Declaração de módulo para 'qrcode' se @types/qrcode não estiver instalado ou configurado globalmente
// É preferível instalar @types/qrcode (`npm install --save-dev @types/qrcode`)
declare module 'qrcode';


// A função registerRoutes agora apenas configura as rotas na instância 'app'
export async function registerRoutes(app: Express): Promise<void> { // Corrigido o tipo de retorno
  // Servir arquivos estáticos da pasta assets
  app.use('/assets', express.static(path.join(process.cwd(), 'client/src/assets/images')));

  // Removido: setupAuth(app); // Isso deve ser chamado apenas uma vez em index.ts antes de montar as rotas

  // Middleware de autenticação para rotas protegidas
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      // Usar status 401 para não autenticado
      return res.status(401).json({ message: "Acesso não autorizado. Faça login para continuar." });
    }
    // req.user é garantido como definido aqui por isAuthenticated()
    next();
  };

  // Middleware para verificar se é admin
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    // req.user é garantido como definido aqui por isAuthenticated()
    // Adicionada asserção de tipo para acesso seguro a req.user.role
    const user = req.user as User; // Asserção de tipo
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Acesso restrito a administradores." });
    }
    next();
  };

  // Rotas de Campanhas
  app.get("/api/campaigns", async (_req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      return res.json(campaigns);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar campanhas" });
    }
  });

  app.get("/api/campaigns/my", requireAuth, async (req: Request, res: Response) => {
    try {
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo

      const userId = user.id; // Acessa user.id de forma segura
      console.log("Buscando campanhas para o usuário:", userId);

      // storage.getCampaignsByUserId precisa ser implementado para consultar o DB para persistência
      const campaigns = await storage.getCampaignsByUserId(userId);
      console.log("Campanhas encontradas:", campaigns);

      return res.json(campaigns);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/my:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar suas campanhas" });
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
      console.error("Erro na rota GET /api/campaigns/code/:code:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar campanha pelo código" });
    }
  });

  app.get("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "ID da campanha inválido" }); // Validar se o ID é um número
      }
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      return res.json(campaign);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/:id:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar campanha" });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo

       // Incluir createdBy do usuário autenticado
      const campaignData = {
        ...req.body,
        createdBy: user.id // Atribui o ID do usuário logado
      };

      const data = insertCampaignSchema.parse(campaignData); // Validar dados com o schema
      // storage.createCampaign precisa ser implementado para persistência no DB
      const campaign = await storage.createCampaign(data);
      return res.status(201).json(campaign);
    } catch (error) {
      console.error("Erro na rota POST /api/campaigns:", error); // Adicionado log
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors }); // Retornar erros de validação Zod
      }
      return res.status(500).json({ message: "Erro ao criar campanha" });
    }
  });

  app.put("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "ID da campanha inválido" }); // Validar ID
      }
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo

       // Opcional: verificar se o usuário logado é o criador da campanha ou admin
       const campaign = await storage.getCampaign(id);
       if (!campaign) {
           return res.status(404).json({ message: "Campanha não encontrada" });
       }
        if (user.role !== 'admin' && campaign.createdBy !== user.id) {
             return res.status(403).json({ message: "Você não tem permissão para editar esta campanha" });
        }


      // Validar apenas os campos permitidos para atualização se necessário
      // const updatedData = insertCampaignSchema.partial().parse(req.body); // Exemplo: usar partial() para permitir campos opcionais

      // storage.updateCampaign precisa ser implementado para persistência no DB
      const updatedCampaign = await storage.updateCampaign(id, req.body); // Passar req.body diretamente ou dados validados

      if (!updatedCampaign) {
        return res.status(404).json({ message: "Campanha não encontrada após atualização" }); // Mensagem mais clara
      }

      return res.json(updatedCampaign);
    } catch (error) {
      console.error("Erro na rota PUT /api/campaigns/:id:", error); // Adicionado log
       if (error instanceof z.ZodError) { // Lidar com erros de validação na atualização
         return res.status(400).json({ message: "Erro de validação", errors: error.errors });
       }
      return res.status(500).json({ message: "Erro ao atualizar campanha" });
    }
  });

  app.delete("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "ID da campanha inválido" }); // Validar ID
      }
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo
      const userId = user.id; // Acessa user.id de forma segura

      // Verificar se a campanha pertence ao usuário logado ou se é admin
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      // Se o usuário não é admin e não é dono da campanha, não pode excluir
      if (user.role !== 'admin' && campaign.createdBy !== userId) { // Acessa user.role e campaign.createdBy de forma segura
        return res.status(403).json({ message: "Você não tem permissão para excluir esta campanha" });
      }

      // storage.deleteCampaign precisa ser implementado para persistência no DB
      const deleted = await storage.deleteCampaign(id);

      if (!deleted) {
        // Este caso pode ocorrer se a campanha foi encontrada, mas a exclusão no storage falhou por algum motivo
         console.error(`Falha na exclusão do storage para campanha ID ${id}.`); // Log mais específico
        return res.status(500).json({ message: "Erro ao excluir campanha no armazenamento" });
      }

      return res.json({ message: "Campanha excluída com sucesso" });
    } catch (error) {
      console.error("Erro na rota DELETE /api/campaigns/:id:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao excluir campanha" });
    }
  });


  // Gerar QR Code para campanha
  app.get("/api/campaigns/:id/qrcode", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da campanha inválido" }); // Validar ID
       }
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      // Gerar URL com base no domínio da requisição e no código único da campanha
      // Considerar ambiente de produção vs desenvolvimento
      const host = req.headers.host; // Pega host do header
      const protocol = req.protocol; // Pega protocolo da requisição
      const baseUrl = `${protocol}://${host}`; // Construir URL base dinâmica
      const campaignUrl = `${baseUrl}/doar/codigo/${campaign.uniqueCode}`;

      // Gerar QR Code como string base64
      // qrcode.toDataURL pode lançar erro, envolver em try/catch
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(campaignUrl);
         if (!qrCodeDataUrl) {
             throw new Error("Falha ao gerar data URL do QR Code");
         }
        return res.json({ qrCodeDataUrl, campaignUrl });
      } catch (qrError) {
          console.error("Erro ao gerar QR Code Data URL:", qrError); // Log para erro na geração
          return res.status(500).json({ message: "Erro ao gerar imagem do QR Code" });
      }


    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/:id/qrcode:", error); // Adicionado log
      // Se o erro não for de campanha não encontrada (404 já tratado), é um erro do servidor
      if (res.statusCode !== 404) {
         return res.status(500).json({ message: "Erro ao gerar QR Code" });
      }
       // Se já definiu status 404, apenas retorna
       return;
    }
  });

  // Rotas de Categorias
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      // storage.getCategories precisa ser implementado para persistência no DB
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
       console.error("Erro na rota GET /api/categories:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  // Rotas de Itens Necessários
  app.get("/api/campaigns/:campaignId/items", async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
       if (isNaN(campaignId)) {
          return res.status(400).json({ message: "ID da campanha inválido" }); // Validar ID
       }
      // storage.getNeededItems precisa ser implementado para persistência no DB
      const items = await storage.getNeededItems(campaignId);
      return res.json(items);
    } catch (error) {
       console.error("Erro na rota GET /api/campaigns/:campaignId/items:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar itens necessários" });
    }
  });

  app.post("/api/needed-items", requireAuth, async (req: Request, res: Response) => {
    try {
      // Valida a entrada com o esquema
      const data = insertNeededItemSchema.parse(req.body);
      // storage.createNeededItem precisa ser implementado para persistência no DB
      const neededItem = await storage.createNeededItem(data);
      return res.status(201).json(neededItem);
    } catch (error) {
       console.error("Erro na rota POST /api/needed-items:", error); // Adicionado log
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro ao criar item necessário" });
    }
  });

  app.put("/api/needed-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID do item inválido" }); // Validar ID
       }
       // Opcional: verificar se o usuário logado tem permissão sobre este item (ex: é dono da campanha)
       // const item = await storage.getNeededItem(id);
       // if (!item) return res.status(404).json({ message: "Item não encontrado" });
       // const campaign = await storage.getCampaign(item.campaignId);
       // if (!campaign) return res.status(404).json({ message: "Campanha do item não encontrada" });
       // const user = req.user as User;
       // if (user.role !== 'admin' && campaign.createdBy !== user.id) {
       //      return res.status(403).json({ message: "Você não tem permissão para editar este item" });
       // }


      // storage.updateNeededItem precisa ser implementado para persistência no DB
      const updatedItem = await storage.updateNeededItem(id, req.body);

      if (!updatedItem) {
        return res.status(404).json({ message: "Item necessário não encontrado" });
      }

      return res.json(updatedItem);
    } catch (error) {
       console.error("Erro na rota PUT /api/needed-items/:id:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao atualizar item necessário" });
    }
  });

  app.delete("/api/needed-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID do item inválido" }); // Validar ID
       }
      // Opcional: verificar se o usuário logado tem permissão sobre este item (como no PUT)
      // const item = await storage.getNeededItem(id);
      // if (!item) return res.status(404).json({ message: "Item não encontrado" });
      // const campaign = await storage.getCampaign(item.campaignId);
      // const user = req.user as User;
      // if (user.role !== 'admin' && campaign.createdBy !== user.id) {
      //      return res.status(403).json({ message: "Você não tem permissão para excluir este item" });
      // }

      // storage.deleteNeededItem precisa ser implementado para persistência no DB
      const deleted = await storage.deleteNeededItem(id);

      if (!deleted) {
        // Pode ser 404 se o item não for encontrado mesmo após a verificação de permissão (corrida?)
         console.error(`Falha na exclusão do storage para item ID ${id}.`); // Log mais específico
         return res.status(404).json({ message: "Item não encontrado para exclusão" }); // Status mais apropriado
      }

      return res.json({ message: "Item excluído com sucesso" });
    } catch (error) {
      console.error("Erro na rota DELETE /api/needed-items/:id:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao excluir item necessário" });
    }
  });

  // Rotas de Doações Materiais (Itens)
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      // Validar dados da doação principal com o schema correto
      // donationProcessSchema inclui campos do doador E a lista de itens
      const validatedDonationData = donationProcessSchema.parse(req.body);

      // Crie a doação principal primeiro
      // storage.createDonation precisa ser implementado para persistência no DB
      const donation = await storage.createDonation({
          campaignId: validatedDonationData.campaignId,
          donorName: validatedDonationData.donorName,
          donorPhone: validatedDonationData.donorPhone,
          donorEmail: validatedDonationData.donorEmail || null, // Permitir email opcional
          address: validatedDonationData.address,
          city: validatedDonationData.city,
          state: validatedDonationData.state,
          zipCode: validatedDonationData.zipCode,
          pickupDate: validatedDonationData.pickupDate.toISOString().split('T')[0], // Converter Date para string YYYY-MM-DD
          pickupTime: validatedDonationData.pickupTime,
          pickupInstructions: validatedDonationData.instructions || null, // Permitir instruções opcionais
          status: "pending" // Status inicial
      });

      // Processar os itens da doação após a criação da doação principal
      if (validatedDonationData.items && Array.isArray(validatedDonationData.items)) {
        for (const item of validatedDonationData.items) {
          // Validar cada item da lista se necessário (se tiver um schema para DonationItem)
          // Aqui assumimos que a validação de item já está no schema donationProcessSchema
          // storage.createDonationItem precisa ser implementado para persistência no DB
          await storage.createDonationItem({
            donationId: donation.id, // Usa o ID da doação principal criada
            neededItemId: item.neededItemId,
            quantity: item.quantity
          });
        }
      }

      // Retornar a doação criada (pode incluir os itens se buscar após a criação)
      // Para simplificar, retornamos a doação principal. O frontend pode buscar os itens separadamente se necessário.
      return res.status(201).json(donation);

    } catch (error) {
      console.error("Erro na rota POST /api/donations:", error); // Adicionado log
      if (error instanceof z.ZodError) {
        // Retornar erros de validação Zod formatados
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      // Outros erros (storage, DB)
      return res.status(500).json({ message: "Erro ao registrar doação" });
    }
  });


  app.get("/api/donations", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      if (campaignId !== undefined && isNaN(campaignId)) { // Validar ID da campanha opcional
         return res.status(400).json({ message: "ID da campanha inválido" });
      }
      // storage.getDonations precisa ser implementado para persistência no DB
      const donations = await storage.getDonations(campaignId);

      // Para cada doação, buscar os itens (storage.getDonationItems precisa ser implementado para persistência no DB)
      const donationsWithItems = await Promise.all(
        donations.map(async (donation) => {
          const items = await storage.getDonationItems(donation.id);
          return { ...donation, items };
        })
      );

      return res.json(donationsWithItems);
    } catch (error) {
       console.error("Erro na rota GET /api/donations:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar doações" });
    }
  });

  app.get("/api/donations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação inválido" }); // Validar ID
       }
      // storage.getDonation precisa ser implementado para persistência no DB
      const donation = await storage.getDonation(id);

      if (!donation) {
        return res.status(404).json({ message: "Doação não encontrada" });
      }

      // Buscar os itens da doação (storage.getDonationItems precisa ser implementado para persistência no DB)
      const items = await storage.getDonationItems(donation.id);

      return res.json({ ...donation, items });
    } catch (error) {
      console.error("Erro na rota GET /api/donations/:id:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar doação" });
    }
  });

  app.put("/api/donations/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação inválido" }); // Validar ID
       }
      const { status } = req.body;

      // Opcional: Validar o status recebido (ex: usando Zod enum ou lista permitida)
      const allowedStatuses = ["pending", "confirmed", "scheduled", "collected", "cancelled"];
      if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }

      // Opcional: verificar se o usuário logado tem permissão para alterar o status (ex: admin ou dono da campanha)
      // const donation = await storage.getDonation(id);
      // if (!donation) return res.status(404).json({ message: "Doação não encontrada" });
      // const campaign = await storage.getCampaign(donation.campaignId);
      // const user = req.user as User;
      // if (user.role !== 'admin' && campaign.createdBy !== user.id) {
      //      return res.status(403).json({ message: "Você não tem permissão para alterar o status desta doação" });
      // }


      // storage.updateDonationStatus precisa ser implementado para persistência no DB
      const updatedDonation = await storage.updateDonationStatus(id, status);

      if (!updatedDonation) {
        return res.status(404).json({ message: "Doação não encontrada para atualização de status" });
      }

      return res.json(updatedDonation);
    } catch (error) {
       console.error("Erro na rota PUT /api/donations/:id/status:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao atualizar status da doação" });
    }
  });

  // --- Rotas de Gerenciadores de Campanha (COMENTADAS - Implementação parcial/mock) ---
  // Conforme discutido, estas rotas parecem ser uma implementação separada e não integrada
  // com o sistema de autenticação e armazenamento principal.
  // Para evitar erros e simplificar, elas foram comentadas.
  // Se necessário, devem ser implementadas completamente usando o sistema de armazenamento Drizzle.

  // app.post("/api/campaign-managers/register", async (req: Request, res: Response) => { /* ... */ });
  // app.post("/api/campaign-managers/login", async (req: Request, res: Response) => { /* ... */ });
  // const requireManager = (req: Request, res: Response, next: Function) => { /* ... */ };
  // app.post("/api/campaigns", requireManager, async (req: Request, res: Response) => { /* ... */ });


  // Rotas de Doações Financeiras
  app.post("/api/financial-donations", async (req: Request, res: Response) => {
    try {
      // Validar e processar os dados da doação financeira com o schema correto
      const validatedData = financialDonationProcessSchema.parse(req.body);

      // storage.createFinancialDonation precisa ser implementado para persistência no DB
      const financialDonation = await storage.createFinancialDonation({
        campaignId: validatedData.campaignId,
        donorName: validatedData.donorName,
        donorEmail: validatedData.donorEmail,
        donorPhone: validatedData.donorPhone,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        // Informações da conta bancária para doação (FIXAS neste mock)
        // Em um ambiente real, estas viriam da campanha associada
         accountInfo: JSON.stringify({ // Stringify para armazenar como JSON no DB, se implementado
             banco: "Banco do Brasil",
             agencia: "1234-5",
             conta: "12345-6",
             pix: "contato@sousolidario.org.br", // Chave PIX mockada
             favorecido: "Associação Sou Solidário"
         }),
        message: validatedData.message,
        status: "pendente" // Status inicial
      });

      // Retornar os dados da doação criada (incluindo info da conta mockada para o frontend)
      return res.status(201).json({
         ...financialDonation,
         accountInfo: JSON.parse(financialDonation.accountInfo as string) // Parse de volta para objeto no retorno
      });

    } catch (error) {
      console.error("Erro na rota POST /api/financial-donations:", error); // Adicionado log
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro ao registrar doação financeira" });
    }
  });

  app.get("/api/financial-donations", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      if (campaignId !== undefined && isNaN(campaignId)) { // Validar ID opcional
         return res.status(400).json({ message: "ID da campanha inválido" });
      }
      // storage.getFinancialDonations precisa ser implementado para persistência no DB
      const donations = await storage.getFinancialDonations(campaignId);

      // Opcional: Parse accountInfo de volta para objeto para cada doação no retorno
      const donationsWithParsedInfo = donations.map(donation => ({
          ...donation,
          accountInfo: donation.accountInfo ? JSON.parse(donation.accountInfo as string) : null
      }));

      return res.json(donationsWithParsedInfo);
    } catch (error) {
      console.error("Erro na rota GET /api/financial-donations:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar doações financeiras" });
    }
  });

  app.get("/api/financial-donations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação financeira inválido" }); // Validar ID
       }
      // storage.getFinancialDonation precisa ser implementado para persistência no DB
      const donation = await storage.getFinancialDonation(id);

      if (!donation) {
        return res.status(404).json({ message: "Doação financeira não encontrada" });
      }

      // Opcional: Parse accountInfo de volta para objeto no retorno
       const donationWithParsedInfo = {
           ...donation,
           accountInfo: donation.accountInfo ? JSON.parse(donation.accountInfo as string) : null
       };

      return res.json(donationWithParsedInfo);
    } catch (error) {
      console.error("Erro na rota GET /api/financial-donations/:id:", error); // Adicionado log
      return res.status(500).json({ message: "Erro ao buscar doação financeira" });
    }
  });

  app.put("/api/financial-donations/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação financeira inválido" }); // Validar ID
       }
      const { status } = req.body;

      // Validar o status recebido
      const allowedStatuses = ["pendente", "confirmado", "cancelado"]; // Ajuste os status permitidos
      if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }

      // Opcional: verificar permissão (admin ou dono da campanha)
      // const donation = await storage.getFinancialDonation(id);
      // if (!donation) return res.status(404).json({ message: "Doação financeira não encontrada" });
      // const campaign = await storage.getCampaign(donation.campaignId);
      // const user = req.user as User;
      // if (user.role !== 'admin' && campaign.createdBy !== user.id) {
      //      return res.status(403).json({ message: "Você não tem permissão para alterar o status desta doação financeira" });
      // }

      // storage.updateFinancialDonationStatus precisa ser implementado para persistência no DB
      const updatedDonation = await storage.updateFinancialDonationStatus(id, status);

      if (!updatedDonation) {
        return res.status(404).json({ message: "Doação financeira não encontrada para atualização de status" });
      }

      return res.json(updatedDonation);
    } catch (error) {
       console.error("Erro na rota PUT /api/financial-donations/:id/status:", error); // Adicionado log
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

      // Respostas baseadas em palavras-chave
      if (messageLower.includes("como doar") || messageLower.includes("fazer doação")) {
        response = "Para fazer uma doação de itens, selecione uma campanha, escolha os itens que deseja doar, informe seus dados e agende a coleta. É simples e rápido! Você também pode fazer uma doação financeira por PIX, transferência ou depósito bancário.";
      }
      else if (messageLower.includes("dinheiro") || messageLower.includes("financeira") || messageLower.includes("pix") || messageLower.includes("transferência") || messageLower.includes("depósito")) {
        response = "Para fazer uma doação financeira, selecione uma campanha, clique em 'Doar em Dinheiro', informe o valor e escolha entre PIX, transferência bancária ou depósito. Todas as informações para pagamento serão fornecidas após o preenchimento do formulário.";
      }
      else if (messageLower.includes("endereço") || messageLower.includes("local") || messageLower.includes("coleta")) {
        response = "Não é necessário levar suas doações a um ponto de coleta. Nós iremos até você! Basta informar seu endereço e agendar um horário que seja conveniente durante o processo de doação de itens.";
      }
      else if (messageLower.includes("horário") || messageLower.includes("quando") || messageLower.includes("agendar")) {
         // Poderíamos buscar horários disponíveis da campanha aqui se estivesse no DB
        response = "Você pode agendar a coleta durante o fluxo de doação de itens. Geralmente, as coletas ocorrem em dias úteis, em horários comerciais. Os horários específicos dependem da campanha.";
      }
      else if (messageLower.includes("contato") || messageLower.includes("telefone") || messageLower.includes("email")) {
        response = "Para mais informações, você pode entrar em contato conosco pelo e-mail contato@sousolidario.org.br"; // Telefone mockado removido para evitar confusão
      }
      else if (messageLower.includes("agradecer") || messageLower.includes("obrigado")) {
        response = "Nós que agradecemos sua generosidade! Juntos podemos fazer a diferença na vida de muitas pessoas.";
      }
      else if (messageLower.includes("olá") || messageLower.includes("oi") || messageLower.includes("ola")) {
           response = "Olá! Como posso ajudar você com sua doação hoje? Você pode perguntar sobre como doar, o que precisa uma campanha, agendamento, etc.";
      }


      // Se tiver um ID de campanha VÁLIDO, personalizar a resposta
      if (campaignId) {
        try {
          const id = parseInt(campaignId);
           if (!isNaN(id)) { // Verifica se o ID é um número válido
             const campaign = await storage.getCampaign(id);
             // Somente busca itens e personaliza se a campanha for encontrada
             if (campaign) {
                const items = await storage.getNeededItems(id); // Busca itens para a campanha encontrada

                if (messageLower.includes("precisa") || messageLower.includes("itens") || messageLower.includes("necessário")) {
                   if (items && items.length > 0) {
                        response = `Para a campanha "${campaign.title}", estamos precisando principalmente de: \n`;

                        const priorityItems = items
                           // Ordenar por prioridade (1 é maior) e depois por nome
                          .sort((a, b) => (a.priority || 999) - (b.priority || 999) || a.name.localeCompare(b.name))
                          .slice(0, 5); // Pegar os 5 primeiros

                        if (priorityItems.length > 0) {
                            priorityItems.forEach(item => {
                              response += `- ${item.name} (${item.quantity} ${item.unit})\n`; // Incluir quantidade e unidade
                            });
                            response += "\nVocê gostaria de doar algum desses itens?";
                        } else {
                             response = `A campanha "${campaign.title}" ainda não tem itens específicos listados como necessários, mas toda ajuda é bem-vinda!`;
                        }

                    } else {
                        response = `A campanha "${campaign.title}" ainda não tem itens específicos listados como necessários.`;
                    }
                } else if (messageLower.includes("sobre a campanha") || messageLower.includes("detalhes da campanha")) {
                    response = `A campanha "${campaign.title}" está acontecendo em ${campaign.location}. ${campaign.description}. Ela está ativa até ${new Date(campaign.endDate).toLocaleDateString('pt-BR')}. Você pode ver mais detalhes na página da campanha.`;
                }
                // Adicionar outras respostas personalizadas com base na campanha
                // ...
             } else {
                // Campanha não encontrada para o ID fornecido
                 response = "Não encontrei detalhes para esta campanha específica. Como posso ajudar com outra coisa?";
             }
           } else {
                // ID da campanha não é um número válido
                 response = "ID da campanha inválido. Por favor, selecione uma campanha para perguntar sobre ela.";
           }
        } catch (error) {
          // Ignorar erros na busca por detalhes da campanha e usar resposta padrão
          console.error("Erro ao buscar detalhes da campanha para chatbot:", error);
          // response já está com a resposta padrão ou uma resposta baseada em palavra-chave geral
        }
      }

      // Simular tempo de processamento para a resposta do chatbot
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Simula atraso de 0.5s a 1.5s

      return res.json({ message: response });
    } catch (error) {
      console.error("Erro na rota POST /api/chat:", error);
      return res.status(500).json({ message: "Erro ao processar mensagem" });
    }
  });


  // Removido: Essas linhas criavam/retornavam um servidor HTTP, o que é feito em index.ts agora
  // const httpServer = createServer(app);
  // return httpServer;
}