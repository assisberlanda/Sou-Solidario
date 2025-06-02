// Sou-Solidario - cópia/server/routes.ts
// Definições das rotas da API (exceto autenticação)

import express, { type Express, Request, Response } from "express";
import path from "path";
import { storage } from "./storage"; // Importa a instância da MemStorage

import {
  // Importando schemas Zod para validação
  insertCampaignSchema,
  insertNeededItemSchema,
  donationProcessSchema,
  financialDonationProcessSchema,
  // Importando tipos para tipagem
  type Campaign,
  type NeededItem,
  type Category,
  type User // Necessário para tipar req.user
} from "../shared/schema";

import QRCode from "qrcode"; // Para gerar QR Codes
import { z } from "zod"; // Para validação Zod


// Declaração de módulo para 'qrcode' se @types/qrcode não estiver instalado
declare module 'qrcode';


// A função registerRoutes configura as rotas na instância 'app' do Express
export async function registerRoutes(app: Express): Promise<void> { // Tipo de retorno Promise<void>

  // Servir arquivos estáticos da pasta assets (para imagens de exemplo iniciais)
  // Se o frontend estiver servindo /assets via Vite, esta linha pode ser redundante em dev
  app.use('/assets', express.static(path.join(process.cwd(), 'client/src/assets/images')));

  // Os middlewares requireAuth e requireAdmin são definidos aqui, pois são usados por várias rotas neste arquivo
  // Note que eles DEPENDEM de setupAuth ter sido chamado ANTES em index.ts para configurar Passport e sessão
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      // Usar status 401 para não autenticado
      return res.status(401).json({ message: "Acesso não autorizado. Faça login para continuar." });
    }
    next(); // Se autenticado, continua para o próximo middleware/manipulador de rota
  };

  const requireAdmin = (req: Request, res: Response, next: Function) => {
    // req.user é garantido como definido por requireAuth (que deve ser usado antes)
    // Asserção de tipo para acesso seguro a req.user.role
    const user = req.user as User;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Acesso restrito a administradores." });
    }
    next(); // Se admin, continua
  };


  // --- Rotas de Campanhas ---

  // GET /api/campaigns: Lista todas as campanhas ativas (ou todas)
  app.get("/api/campaigns", async (_req: Request, res: Response) => {
    try {
      // Usa o método do storage em memória
      // O frontend em home.tsx e ListarCampanhas.tsx filtra por `active: true`
      const campaigns = await storage.getCampaigns();
      return res.json(campaigns);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns:", error);
      return res.status(500).json({ message: "Erro ao buscar campanhas" });
    }
  });

  // GET /api/campaigns/my: Lista campanhas criadas pelo usuário logado
  app.get("/api/campaigns/my", requireAuth, async (req: Request, res: Response) => {
    try {
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo para acesso seguro

      const userId = user.id; // Obtém o ID do usuário logado
      console.log("Buscando campanhas para o usuário:", userId);

      // Usa o método do storage em memória para buscar campanhas POR ID do usuário
      const campaigns = await storage.getCampaignsByUserId(userId);
      console.log("Campanhas encontradas:", campaigns);

      return res.json(campaigns);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/my:", error);
      return res.status(500).json({ message: "Erro ao buscar suas campanhas" });
    }
  });

  // GET /api/campaigns/code/:code: Busca campanha por código único
  app.get("/api/campaigns/code/:code", async (req: Request, res: Response) => {
    try {
      const code = req.params.code;
      if (!code) {
           return res.status(400).json({ message: "Código da campanha não fornecido" });
      }
      // Usa o método do storage em memória
      const campaign = await storage.getCampaignByCode(code);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      return res.json(campaign);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/code/:code:", error);
      return res.status(500).json({ message: "Erro ao buscar campanha pelo código" });
    }
  });

  // GET /api/campaigns/:id: Busca campanha por ID
  app.get("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da campanha inválido" });
       }
      // Usa o método do storage em memória
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      return res.json(campaign);
    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/:id:", error);
      return res.status(500).json({ message: "Erro ao buscar campanha" });
    }
  });


  // POST /api/campaigns: Cria uma nova campanha (requer autenticação)
  app.post("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo

       // Extrai os dados do corpo da requisição
      const {
          title, description, location,
          startDate: startDateString, endDate: endDateString, // Strings do input date
          imageUrl, urgent = false, active = true,
          pickupSchedule, districts // Objetos/Arrays do frontend
      } = req.body;


      // --- CORREÇÃO: Converter strings de data para objetos Date antes da validação Zod ---
      const parsedStartDate = startDateString ? new Date(startDateString) : null; // Converte para Date ou null
      const parsedEndDate = new Date(endDateString); // Converte para Date (obrigatório)

      // Opcional: Verificar se as datas resultaram em objetos Date válidos
       if (endDateString && isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({ message: "Data de término inválida" });
       }
        if (startDateString && parsedStartDate && isNaN(parsedStartDate.getTime())) {
           return res.status(400).json({ message: "Data de início inválida" });
        }


      // Preparar os dados no formato esperado pelo insertCampaignSchema Zod
      const campaignDataForValidation = {
          title: title,
          description: description,
          location: location,
          startDate: parsedStartDate, // <-- Passa objeto Date ou null
          endDate: parsedEndDate,     // <-- Passa objeto Date
          imageUrl: imageUrl || null, // Assegura que é string ou null
          active: active,
          createdBy: user.id, // Atribui o ID do usuário logado (número)
          // uniqueCode: generateUniqueCode(), // Gerar código único aqui
          urgent: urgent,
          // Campos JSON: storage em memória lida com objetos/arrays diretamente, mas é bom serializar/parsear na camada storage real
          // Enviamos os objetos/arrays do frontend. O storage mock vai JSON.stringify.
          pickupSchedule: pickupSchedule || null,
          districts: districts || [],
      };

       console.log("Dados preparados para validação (POST /api/campaigns):", campaignDataForValidation);

      // Validar os dados com o insertCampaignSchema (que espera Date para datas)
      const validatedData = insertCampaignSchema.parse(campaignDataForValidation);

       console.log("Dados validados pelo Zod:", validatedData);

      // Usa o método do storage em memória para criar campanha
      // storage.createCampaign serializa/parseia JSON internamente no mock
      const campaign = await storage.createCampaign(validatedData);
      console.log("Campanha criada no storage:", campaign);

      return res.status(201).json(campaign); // Retorna a campanha criada

    } catch (error) {
      console.error("Erro na rota POST /api/campaigns:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro ao criar campanha" });
    }
  });

  // PUT /api/campaigns/:id: Atualiza uma campanha existente (requer autenticação)
   app.put("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "ID da campanha inválido" });
      }
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo

       // Verificar se o usuário logado é o criador da campanha ou admin
       const campaign = await storage.getCampaign(id);
       if (!campaign) {
           return res.status(404).json({ message: "Campanha não encontrada" });
       }
        // Verifica se o createdBy da campanha corresponde ao ID do usuário logado OU se o usuário é admin
        if (user.role !== 'admin' && campaign.createdBy !== user.id) {
             return res.status(403).json({ message: "Você não tem permissão para editar esta campanha" });
        }

       // Extrair dados para atualização do corpo da requisição
       const {
           title, description, location,
           startDate: startDateString, endDate: endDateString,
           imageUrl, urgent, active,
           pickupSchedule, districts
       } = req.body;

       // Preparar dados para atualização, incluindo a conversão de data se vierem
       const updateData: Partial<Campaign> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (location !== undefined) updateData.location = location;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
        if (urgent !== undefined) updateData.urgent = urgent;
        if (active !== undefined) updateData.active = active;
        // Campos JSON: Passar objeto/array, storage mock serializa/parseia
        if (pickupSchedule !== undefined) updateData.pickupSchedule = pickupSchedule || null;
        if (districts !== undefined) updateData.districts = districts || [];

        // Converter strings de data para objetos Date SOMENTE se vierem na requisição de PUT
        if (startDateString !== undefined) {
             const parsedStartDate = startDateString ? new Date(startDateString) : null;
             if (startDateString && parsedStartDate && isNaN(parsedStartDate.getTime())) {
                 return res.status(400).json({ message: "Data de início inválida para atualização" });
             }
             updateData.startDate = parsedStartDate; // Passa Date ou null
        }
         if (endDateString !== undefined) { // endDate é obrigatório no schema, mas pode ser enviado no PUT
             const parsedEndDate = new Date(endDateString);
              if (endDateString && isNaN(parsedEndDate.getTime())) {
                 return res.status(400).json({ message: "Data de término inválida para atualização" });
             }
             updateData.endDate = parsedEndDate; // Passa Date
        }

      // storage.updateCampaign usa o método em memória
      const updatedCampaign = await storage.updateCampaign(id, updateData);

      if (!updatedCampaign) {
        // Se o storage não encontrar/atualizar, retorna 404 (embora já tenhamos verificado antes)
        return res.status(404).json({ message: "Campanha não encontrada após atualização" });
      }

      // storage.updateCampaign em memória já retorna o objeto parseado
      return res.json(updatedCampaign);

    } catch (error) {
      console.error("Erro na rota PUT /api/campaigns/:id:", error);
       if (error instanceof z.ZodError) { // Lidar com erros de validação na atualização
         return res.status(400).json({ message: "Erro de validação", errors: error.errors });
       }
      return res.status(500).json({ message: "Erro ao atualizar campanha" });
    }
  });


  // DELETE /api/campaigns/:id: Exclui uma campanha (requer autenticação)
  app.delete("/api/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         return res.status(400).json({ message: "ID da campanha inválido" });
      }
      // requireAuth garante que req.user está definido
      const user = req.user as User; // Asserção de tipo

      // Verificar se a campanha pertence ao usuário logado ou se é admin
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      // Verifica se o createdBy da campanha corresponde ao ID do usuário logado OU se o usuário é admin
      if (user.role !== 'admin' && campaign.createdBy !== user.id) {
        return res.status(403).json({ message: "Você não tem permissão para excluir esta campanha" });
      }

      // Usa o método do storage em memória para excluir campanha (e relacionados em memória)
      const deleted = await storage.deleteCampaign(id);

      if (!deleted) {
        // Este caso pode ocorrer se a campanha foi encontrada, mas a exclusão no storage falhou por algum motivo
         console.error(`Falha na exclusão do storage em memória para campanha ID ${id}.`);
        return res.status(500).json({ message: "Erro ao excluir campanha no armazenamento" });
      }

      return res.json({ message: "Campanha excluída com sucesso" });
    } catch (error) {
      console.error("Erro na rota DELETE /api/campaigns/:id:", error);
      return res.status(500).json({ message: "Erro ao excluir campanha" });
    }
  });


  // Gerar QR Code para campanha
  app.get("/api/campaigns/:id/qrcode", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da campanha inválido" });
       }
      // Usa o método do storage em memória
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      // Gerar URL com base no domínio da requisição e no código único da campanha
      const host = req.headers.host;
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;
      const campaignUrl = `${baseUrl}/doar/codigo/${campaign.uniqueCode}`;

      // Gerar QR Code como string base64
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(campaignUrl);
         if (!qrCodeDataUrl) {
             throw new Error("Falha ao gerar data URL do QR Code");
         }
        return res.json({ qrCodeDataUrl, campaignUrl });
      } catch (qrError) {
          console.error("Erro ao gerar QR Code Data URL:", qrError);
          return res.status(500).json({ message: "Erro ao gerar imagem do QR Code" });
      }


    } catch (error) {
      console.error("Erro na rota GET /api/campaigns/:id/qrcode:", error);
      // Se o erro não for 404 (já tratado), é 500
      if (res.statusCode !== 404) {
         return res.status(500).json({ message: "Erro ao gerar QR Code" });
      }
       return; // Já enviou 404
    }
  });

  // Rotas de Categorias
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      // Usa o método do storage em memória
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
       console.error("Erro na rota GET /api/categories:", error);
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  // Rotas de Itens Necessários
  app.get("/api/campaigns/:campaignId/items", async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
       if (isNaN(campaignId)) {
          return res.status(400).json({ message: "ID da campanha inválido" });
       }
      // Usa o método do storage em memória
      const items = await storage.getNeededItems(campaignId);
      return res.json(items);
    } catch (error) {
       console.error("Erro na rota GET /api/campaigns/:campaignId/items:", error);
      return res.status(500).json({ message: "Erro ao buscar itens necessários" });
    }
  });

  // POST /api/needed-items: Cria um novo item necessário (requer autenticação)
  app.post("/api/needed-items", requireAuth, async (req: Request, res: Response) => {
    try {
      // Valida a entrada com o esquema
      const data = insertNeededItemSchema.parse(req.body);
      // Usa o método do storage em memória
      const neededItem = await storage.createNeededItem(data);
      return res.status(201).json(neededItem);
    } catch (error) {
       console.error("Erro na rota POST /api/needed-items:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro ao criar item necessário" });
    }
  });

  // PUT /api/needed-items/:id: Atualiza item necessário (requer autenticação)
  app.put("/api/needed-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID do item inválido" });
       }
       // Opcional: verificar se o usuário logado tem permissão sobre este item (ex: é dono da campanha)
       // const item = await storage.getNeededItem(id);
       // if (!item) return res.status(404).json({ message: "Item não encontrado" });
       // const campaign = await storage.getCampaign(item.campaignId);
       // const user = req.user as User;
       // if (user.role !== 'admin' && campaign.createdBy !== user.id) {
       //      return res.status(403).json({ message: "Você não tem permissão para editar este item" });
       // }

      // Validar apenas os campos permitidos para atualização se necessário
      // try {
      //     insertNeededItemSchema.partial().parse(req.body);
      // } catch (zodError) {
      //    if (zodError instanceof z.ZodError) {
      //        return res.status(400).json({ message: "Erro de validação na atualização do item", errors: zodError.errors });
      //    }
      //    throw zodError;
      // }


      // Usa o método do storage em memória para atualizar
      const updatedItem = await storage.updateNeededItem(id, req.body);

      if (!updatedItem) {
        return res.status(404).json({ message: "Item necessário não encontrado" });
      }

      return res.json(updatedItem);
    } catch (error) {
       console.error("Erro na rota PUT /api/needed-items/:id:", error);
      return res.status(500).json({ message: "Erro ao atualizar item necessário" });
    }
  });

  // DELETE /api/needed-items/:id: Exclui item necessário (requer autenticação)
  app.delete("/api/needed-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID do item inválido" });
       }
      // Opcional: verificar se o usuário logado tem permissão sobre este item (como no PUT)
      // const item = await storage.getNeededItem(id);
      // if (!item) return res.status(404).json({ message: "Item não encontrado" });
      // const campaign = await storage.getCampaign(item.campaignId);
      // const user = req.user as User;
      // if (user.role !== 'admin' && campaign.createdBy !== user.id) {
      //      return res.status(403).json({ message: "Você não tem permissão para excluir este item" });
      // }

      // Usa o método do storage em memória para excluir (e remover itens de doação relacionados em memória)
      const deleted = await storage.deleteNeededItem(id);

      if (!deleted) {
         console.error(`Falha na exclusão do storage em memória para item ID ${id}.`);
        return res.status(404).json({ message: "Item não encontrado para exclusão" });
      }

      return res.json({ message: "Item excluído com sucesso" });
    } catch (error) {
      console.error("Erro na rota DELETE /api/needed-items/:id:", error);
      return res.status(500).json({ message: "Erro ao excluir item necessário" });
    }
  });

  // --- Rotas de Doações Materiais (Itens) ---

  // POST /api/donations: Registra uma nova doação material (não requer autenticação por padrão)
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      // Validar dados da doação principal com o schema correto
      const validatedDonationData = donationProcessSchema.parse(req.body);

      // Usa o método do storage em memória para criar a doação principal
      const donation = await storage.createDonation({
          campaignId: validatedDonationData.campaignId,
          donorName: validatedDonationData.donorName,
          donorPhone: validatedDonationData.donorPhone,
          donorEmail: validatedDonationData.donorEmail || null, // Permitir email opcional
          address: validatedDonationData.address,
          city: validatedDonationData.city,
          state: validatedDonationData.state,
          zipCode: validatedDonationData.zipCode,
          // Armazenar data como string YYYY-MM-DD no storage mock (ou Date se storage suportar)
          // Zod valida como Date, mas o mock storage armazena como string
          pickupDate: validatedDonationData.pickupDate.toISOString().split('T')[0],
          pickupTime: validatedDonationData.pickupTime,
          pickupInstructions: validatedDonationData.pickupInstructions || null,
          status: "pending" // Status inicial
      });

      // Processar os itens da doação após a criação da doação principal
      if (validatedDonationData.items && Array.isArray(validatedDonationData.items)) {
        for (const item of validatedDonationData.items) {
          // Usa o método do storage em memória para criar itens de doação
          await storage.createDonationItem({
            donationId: donation.id, // Usa o ID da doação principal criada
            neededItemId: item.neededItemId,
            quantity: item.quantity
          });
        }
      }

      // Retornar a doação criada (sem itens relacionados no objeto principal)
      return res.status(201).json(donation);

    } catch (error) {
      console.error("Erro na rota POST /api/donations:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro ao registrar doação" });
    }
  });

  // GET /api/donations: Lista doações (opcionalmente filtradas por campanha) (requer autenticação)
  app.get("/api/donations", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      if (campaignId !== undefined && isNaN(campaignId)) {
         return res.status(400).json({ message: "ID da campanha inválido" });
      }
      // Usa o método do storage em memória
      const donations = await storage.getDonations(campaignId);

      // Para cada doação, buscar os itens (storage.getDonationItems usa método em memória)
      const donationsWithItems = await Promise.all(
        donations.map(async (donation) => {
          const items = await storage.getDonationItems(donation.id);
          return { ...donation, items };
        })
      );

      return res.json(donationsWithItems);
    } catch (error) {
       console.error("Erro na rota GET /api/donations:", error);
      return res.status(500).json({ message: "Erro ao buscar doações" });
    }
  });

  // GET /api/donations/:id: Busca doação por ID (requer autenticação)
  app.get("/api/donations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação inválido" });
       }
      // Usa o método do storage em memória
      const donation = await storage.getDonation(id);

      if (!donation) {
        return res.status(404).json({ message: "Doação não encontrada" });
      }

      // Buscar os itens da doação (storage.getDonationItems usa método em memória)
      const items = await storage.getDonationItems(donation.id);

      return res.json({ ...donation, items });
    } catch (error) {
      console.error("Erro na rota GET /api/donations/:id:", error);
      return res.status(500).json({ message: "Erro ao buscar doação" });
    }
  });

  // PUT /api/donations/:id/status: Atualiza status da doação (requer autenticação)
  app.put("/api/donations/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação inválido" });
       }
      const { status } = req.body;

      // Validar o status recebido
      const allowedStatuses = ["pending", "confirmed", "scheduled", "collected", "cancelled"]; // Ajuste os status permitidos conforme seu schema
      if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }

      // Opcional: verificar permissão (admin ou dono da campanha)
      // ... (lógica comentada) ...


      // Usa o método do storage em memória para atualizar status
      const updatedDonation = await storage.updateDonationStatus(id, status);

      if (!updatedDonation) {
        return res.status(404).json({ message: "Doação não encontrada para atualização de status" });
      }

      return res.json(updatedDonation);
    } catch (error) {
       console.error("Erro na rota PUT /api/donations/:id/status:", error);
      return res.status(500).json({ message: "Erro ao atualizar status da doação" });
    }
  });

  // --- Rotas de Gerenciadores de Campanha / Contas Bancárias (COMENTADAS - Mocks Incompletos) ---
  // Conforme discutido, estas rotas são mocks e não parte do fluxo principal de autenticação.
  // Elas permanecem comentadas.

  // app.post("/api/campaign-managers/register", async (req: Request, res: Response) => { /* ... */ });
  // app.post("/api/campaign-managers/login", async (req: Request, res: Response) => { /* ... */ });
  // const requireManager = (req: Request, res: Response, next: Function) => { /* ... */ };
  // app.post("/api/campaigns", requireManager, async (req: Request, res: Response) => { /* ... */ });


  // --- Rotas de Doações Financeiras ---

  // POST /api/financial-donations: Registra uma nova doação financeira (não requer autenticação por padrão)
  app.post("/api/financial-donations", async (req: Request, res: Response) => {
    try {
      // Validar e processar os dados da doação financeira com o schema correto
      const validatedData = financialDonationProcessSchema.parse(req.body);

      // Informações da conta bancária para doação (FIXAS neste mock)
      const accountInfoMock = {
           banco: "Banco do Brasil",
           agencia: "1234-5",
           conta: "12345-6",
           pix: "contato@sousolidario.org.br", // Chave PIX mockada
           favorecido: "Associação Sou Solidário"
       };

      // Usa o método do storage em memória para criar doação financeira
      const financialDonation = await storage.createFinancialDonation({
        campaignId: validatedData.campaignId,
        donorName: validatedData.donorName,
        donorEmail: validatedData.donorEmail,
        donorPhone: validatedData.donorPhone,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        accountInfo: accountInfoMock, // Passa o objeto mockado
        message: validatedData.message,
        status: "pendente" // Status inicial
      });

      // storage.createFinancialDonation em memória serializa/parseia JSON internamente.
      // Retornamos o objeto criado pelo storage (que já deve ter o accountInfo parseado)
      return res.status(201).json(financialDonation);

    } catch (error) {
      console.error("Erro na rota POST /api/financial-donations:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro ao registrar doação financeira" });
    }
  });

  // GET /api/financial-donations: Lista doações financeiras (opcionalmente filtradas por campanha) (requer autenticação)
  app.get("/api/financial-donations", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      if (campaignId !== undefined && isNaN(campaignId)) {
         return res.status(400).json({ message: "ID da campanha inválido" });
      }
      // Usa o método do storage em memória
      const donations = await storage.getFinancialDonations(campaignId);

      // storage.getFinancialDonations em memória já retorna com accountInfo parseado

      return res.json(donations);
    } catch (error) {
       console.error("Erro na rota GET /api/financial-donations:", error);
      return res.status(500).json({ message: "Erro ao buscar doações financeiras" });
    }
  });

  // GET /api/financial-donations/:id: Busca doação financeira por ID (requer autenticação)
  app.get("/api/financial-donations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação financeira inválido" });
       }
      // Usa o método do storage em memória
      const donation = await storage.getFinancialDonation(id);

      if (!donation) {
        return res.status(404).json({ message: "Doação financeira não encontrada" });
      }

      // storage.getFinancialDonation em memória já retorna com accountInfo parseado
      return res.json(donation);
    } catch (error) {
      console.error("Erro na rota GET /api/financial-donations/:id:", error);
      return res.status(500).json({ message: "Erro ao buscar doação financeira" });
    }
  });

  // PUT /api/financial-donations/:id/status: Atualiza status da doação financeira (requer autenticação)
  app.put("/api/financial-donations/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
       if (isNaN(id)) {
          return res.status(400).json({ message: "ID da doação financeira inválido" });
       }
      const { status } = req.body;

      // Validar o status recebido
      const allowedStatuses = ["pendente", "confirmado", "cancelado"]; // Ajuste os status permitidos conforme seu schema
      if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }

      // Opcional: verificar permissão (admin ou dono da campanha)
      // ... (lógica comentada) ...

      // Usa o método do storage em memória para atualizar status
      const updatedDonation = await storage.updateFinancialDonationStatus(id, status);

      if (!updatedDonation) {
        return res.status(404).json({ message: "Doação financeira não encontrada para atualização de status" });
      }

      // storage.updateFinancialDonationStatus em memória já retorna com accountInfo parseado
      return res.json(updatedDonation);
    } catch (error) {
       console.error("Erro na rota PUT /api/financial-donations/:id/status:", error);
      return res.status(500).json({ message: "Erro ao atualizar status da doação financeira" });
    }
  });


  // API do Chatbot (simplificada) - Não requer autenticação por padrão
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, campaignId } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Mensagem inválida" });
      }

      let response = "Olá! Como posso ajudar você com sua doação hoje?";

      // Lógica simples para respostas do chatbot baseada em palavras-chave
      const messageLower = message.toLowerCase();

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
        response = "Você pode agendar a coleta durante o fluxo de doação de itens. Geralmente, as coletas ocorrem em dias úteis, em horários comerciais. Os horários específicos dependem da campanha.";
      }
      else if (messageLower.includes("contato") || messageLower.includes("telefone") || messageLower.includes("email")) {
        response = "Para mais informações, você pode entrar em contato conosco pelo e-mail contato@sousolidario.org.br";
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
             const campaign = await storage.getCampaign(id); // Busca campanha no storage em memória
             // Somente busca itens e personaliza se a campanha for encontrada
             if (campaign) {
                const items = await storage.getNeededItems(id); // Busca itens para a campanha encontrada no storage em memória

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
                    response = `A campanha "${campaign.title}" está acontecendo em ${campaign.location}. ${campaign.description}. Ela está ativa até ${campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('pt-BR') : 'Data indefinida'}. Você pode ver mais detalhes na página da campanha.`; // Usar endDate parseada se vier assim do storage mock
                }
                // Adicionar outras respostas personalizadas com base na campanha
                // ...
             } else {
                // Campanha não encontrada para o ID fornecido no storage
                 response = "Não encontrei detalhes para esta campanha específica. Como posso ajudar com outra coisa?";
             }
           } else {
                // ID da campanha não é um número válido
                 response = "ID da campanha inválido. Por favor, selecione uma campanha para perguntar sobre ela.";
           }
        } catch (error) {
          // Ignorar erros na busca por detalhes da campanha no storage e usar resposta padrão
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
}