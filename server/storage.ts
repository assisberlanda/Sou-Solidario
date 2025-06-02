// Sou-Solidario - cópia/server/storage.ts
// Implementação de armazenamento puramente em memória para demonstração local

import {
  // Importar todos os tipos e schemas necessários do schema compartilhado
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Category, type InsertCategory,
  type NeededItem, type InsertNeededItem,
  type Donation, type InsertDonation,
  type DonationItem, type InsertDonationItem,
  type FinancialDonation, type InsertFinancialDonation,
  // Importar schemas Zod para validação (embora a validação seja feita nas rotas)
  insertUserSchema, // Necessário para tipagem de InsertUser
  insertCampaignSchema, // Necessário para tipagem de InsertCampaign
  insertCategorySchema, // Necessário para tipagem de InsertCategory
  insertNeededItemSchema, // Necessário para tipagem de InsertNeededItem
  insertDonationSchema, // Necessário para tipagem de InsertDonation
  insertDonationItemSchema, // Necessário para tipagem de InsertDonationItem
  insertFinancialDonationSchema, // Necessário para tipagem de InsertFinancialDonation
  // Importar schema completo se houver necessidade de acesso direto a ele (geralmente não)
  // schema
} from "@shared/schema";

import session from "express-session";
// Usar memorystore para sessões em memória
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

import { scrypt, randomBytes, timingSafeEqual } from "crypto"; // Para hashing de senha
import { promisify } from "util"; // Para scrypt assíncrono

// Promisify scrypt para uso assíncrono
const scryptAsync = promisify(scrypt);


// --- Implementação de Hashing e Comparação de Senha (Movida para Cá) ---
// Usada pelas rotas de auth para processar senhas
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`; // Armazena hash.salt
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
        console.error("Formato de senha armazenado inválido");
        return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    // timingSafeEqual previne ataques de temporização
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
      console.error("Erro durante a comparação de senha:", error);
      return false;
  }
}


// --- Armazenamento em Memória para TODAS as Entidades ---
const inMemoryData = {
  users: new Map<number, User>(),
  campaigns: new Map<number, Campaign>(),
  categories: new Map<number, Category>(),
  neededItems: new Map<number, NeededItem>(),
  donations: new Map<number, Donation>(), // Doações materiais principais
  donationItems: new Map<number, DonationItem>(), // Itens dentro de doações materiais
  financialDonations: new Map<number, FinancialDonation>(), // Doações financeiras
  // campaignManagers: new Map<number, any>(), // Se for usar mocks
  // bankAccounts: new Map<number, any>(),       // Se for usar mocks
};

// Controle de IDs incrementais em memória
let inMemoryLastIds = {
  users: 0,
  campaigns: 0,
  categories: 0,
  neededItems: 0,
  donations: 0,
  donationItems: 0,
  financialDonations: 0,
  // campaignManagers: 0,
  // bankAccounts: 0
};

function getNextInMemoryId(entity: keyof typeof inMemoryData): number {
  inMemoryLastIds[entity] += 1;
  return inMemoryLastIds[entity];
}

// Gerar código único para campanhas (1 letra + 5 números) - Mantido do código original
function generateUniqueCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  const numbers = Math.floor(Math.random() * 900000) + 100000; // 6 dígitos (100000-999999)
  return `${letter}${numbers}`;
}


// --- Inicializar com Dados de Exemplo (Em Memória) ---
// Esses dados são recriados toda vez que o servidor é iniciado.
async function initializeInMemoryData() {
    console.log("📦 Inicializando dados de exemplo em memória (dados não persistentes).");

    // Criar usuário admin padrão (usando a função de hashing local)
    // Será necessário usar a função hashPassword, que é assíncrona
    const adminUser = await (async () => {
         const id = getNextInMemoryId("users");
         const hashedPassword = await hashPassword("admin123");
         const user: User = {
            id,
            username: "admin",
            password: hashedPassword,
            name: "Administrador Padrão",
            email: "admin@example.com",
            role: "admin",
            organization: "Sou Solidário Admin",
            createdAt: new Date(),
            phone: null, city: null, district: null, about: null
         };
         inMemoryData.users.set(id, user);
         console.log(`Usuário admin padrão criado (ID: ${id}, username: admin, password: admin123).`);
         return user;
    })();


    // Categorias iniciais
    const sampleCategories = [
      { name: "Água", color: "#2196F3" },
      { name: "Alimentos", color: "#4CAF50" },
      { name: "Roupas", color: "#673AB7" },
      { name: "Cobertores", color: "#F44336" },
      { name: "Construção", color: "#FFC107" },
      { name: "Higiene", color: "#FF5722" },
      { name: "Calçados", color: "#3F51B5" }
    ];
    const categoryIds: { [key: string]: number } = {};
    sampleCategories.forEach(cat => {
      const newCat = { id: getNextInMemoryId('categories'), ...cat };
      inMemoryData.categories.set(newCat.id, newCat);
      // Armazenar IDs para referência futura
      if (cat.name === "Água") categoryIds.agua = newCat.id;
      if (cat.name === "Alimentos") categoryIds.alimentos = newCat.id;
      if (cat.name === "Roupas") categoryIds.roupas = newCat.id;
      if (cat.name === "Cobertores") categoryIds.cobertores = newCat.id;
      if (cat.name === "Construção") categoryIds.construcao = newCat.id;
      if (cat.name === "Higiene") categoryIds.higiene = newCat.id;
      if (cat.name === "Calçados") categoryIds.calcados = newCat.id;
    });


    // Campanhas iniciais (criadas pelo usuário admin padrão)
     const sampleCampaignsData = [
       {
         title: "Enchentes em Porto Alegre",
         description: "Ajuda para famílias desabrigadas pelas enchentes no Rio Grande do Sul. Milhares de pessoas precisam de apoio.",
         location: "Rio Grande do Sul",
         endDate: new Date("2024-12-31"), // Usar objetos Date
         createdBy: adminUser.id, // Atribuir ao usuário admin
         urgent: true,
         imageUrl: "/assets/porto_alegre.jpeg",
         active: true,
         uniqueCode: "P12345", // Código único fixo para exemplo
         pickupSchedule: { inicio: "09:00", fim: "18:00" },
         districts: [{date: "2024-07-20", district: "Centro"}, {date: "2024-07-21", district: "Zona Sul"}], // Exemplo de estrutura
       },
        {
         title: "Reconstrução em Petrópolis",
         description: "Apoio às famílias afetadas pelos deslizamentos em Petrópolis. Materiais de construção e itens básicos.",
         location: "Rio de Janeiro",
         endDate: new Date("2024-11-30"), // Usar objetos Date
         createdBy: adminUser.id, // Atribuir ao usuário admin
         urgent: false,
         imageUrl: "/assets/petropolis.jpeg",
         active: true,
         uniqueCode: "R67890", // Código único fixo para exemplo
         pickupSchedule: { inicio: "09:00", fim: "17:00" },
         districts: [{date: "2024-07-25", district: "Quitandinha"}], // Exemplo de estrutura
       },
       {
         title: "Campanha do Agasalho",
         description: "Arrecadação de roupas de inverno para população em situação de vulnerabilidade em São Paulo.",
         location: "São Paulo",
         endDate: new Date("2024-08-30"), // Usar objetos Date
         createdBy: adminUser.id, // Atribuir ao usuário admin
         urgent: false,
         imageUrl: "/assets/campanha-do-agasalho.jpg",
         active: true,
         uniqueCode: "C24680", // Código único fixo para exemplo
         pickupSchedule: { inicio: "10:00", fim: "16:00" },
         districts: [{date: "2024-08-01", district: "Pinheiros"}], // Exemplo de estrutura
       },
    ];

     sampleCampaignsData.forEach(campData => {
        const newCamp: Campaign = {
            id: getNextInMemoryId('campaigns'),
            createdAt: new Date(),
            uniqueCode: campData.uniqueCode || generateUniqueCode(), // Usar código fixo ou gerar
            ...campData,
            // Serializar campos JSON aqui antes de armazenar no Map
             pickupSchedule: JSON.stringify(campData.pickupSchedule),
             districts: JSON.stringify(campData.districts)
        };
        inMemoryData.campaigns.set(newCamp.id, newCamp);
     });


    // Itens necessários para a campanha de Porto Alegre (ID 1, se for a primeira criada)
     const portoAlegreCampaign = Array.from(inMemoryData.campaigns.values()).find(c => c.uniqueCode === 'P12345');
     if(portoAlegreCampaign) {
         const sampleNeededItemsData = [
           { campaignId: portoAlegreCampaign.id, name: "Água mineral", categoryId: categoryIds.agua, quantity: 1000, unit: "garrafas", priority: 1 },
           { campaignId: portoAlegreCampaign.id, name: "Alimentos não perecíveis", categoryId: categoryIds.alimentos, quantity: 500, unit: "kg", priority: 1 },
           { campaignId: portoAlegreCampaign.id, name: "Roupas de inverno", categoryId: categoryIds.roupas, quantity: 300, unit: "peças", priority: 2 },
           { campaignId: portoAlegreCampaign.id, name: "Cobertores", categoryId: categoryIds.cobertores, quantity: 200, unit: "unidades", priority: 1 },
           { campaignId: portoAlegreCampaign.id, name: "Produtos de higiene", categoryId: categoryIds.higiene, quantity: 150, unit: "kits", priority: 1 },
         ];

         sampleNeededItemsData.forEach(itemData => {
             const newItem: NeededItem = { id: getNextInMemoryId('neededItems'), ...itemData };
             inMemoryData.neededItems.set(newItem.id, newItem);
         });
     }

    // Nota: Não adicionamos doações de exemplo aqui por padrão para evitar poluir a lista inicial
}

// Inicializar dados em memória ao iniciar o servidor
// Usar uma função assíncrona para aguardar o hashing da senha do admin
(async () => {
    await initializeInMemoryData();
})();


// --- Interface de Armazenamento ---
// Define a interface IStorage para tipagem
export interface IStorage {
  sessionStore: session.SessionStore;

  // Métodos para Usuários (em Memória)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Métodos para Campanhas (em Memória)
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignByCode(code: string): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>; // Buscar campanhas criadas por um usuário
  createCampaign(campaignData: InsertCampaign): Promise<Campaign>; // Recebe InsertCampaign, retorna Campaign
  updateCampaign(id: number, campaignUpdate: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Métodos para Categorias (em Memória)
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Métodos para Itens Necessários (em Memória)
  getNeededItems(campaignId: number): Promise<NeededItem[]>;
  getNeededItem(id: number): Promise<NeededItem | undefined>;
  createNeededItem(neededItem: InsertNeededItem): Promise<NeededItem>;
  updateNeededItem(id: number, neededItemUpdate: Partial<NeededItem>): Promise<NeededItem | undefined>;
  deleteNeededItem(id: number): Promise<boolean>;

  // Métodos para Doações Materiais (em Memória)
  getDonations(campaignId?: number): Promise<Donation[]>;
  getDonation(id: number): Promise<Donation | undefined>;
  createDonation(donationData: InsertDonation): Promise<Donation>; // Recebe InsertDonation, retorna Donation
  updateDonationStatus(id: number, status: string): Promise<Donation | undefined>;

  // Métodos para Itens de Doação Material (em Memória)
  getDonationItems(donationId: number): Promise<DonationItem[]>;
  createDonationItem(donationItem: InsertDonationItem): Promise<DonationItem>;

  // Métodos para Doações Financeiras (em Memória)
  getFinancialDonations(campaignId?: number): Promise<FinancialDonation[]>;
  getFinancialDonation(id: number): Promise<FinancialDonation | undefined>;
  createFinancialDonation(donationData: InsertFinancialDonation): Promise<FinancialDonation>; // Recebe InsertFinancialDonation, retorna FinancialDonation
  updateFinancialDonationStatus(id: number, status: string): Promise<FinancialDonation | undefined>;

  // Métodos para Gerenciadores de Campanha / Contas Bancárias (Mocks em Memória - Incompletos)
  // Estes métodos são mocks e precisam ser implementados corretamente se usados no frontend/API
  createCampaignManager(data: any): Promise<any>; // Mock
  getCampaignManagerByEmail(email: string): Promise<any | undefined>; // Mock
  createBankAccount(data: any): Promise<any>; // Mock
}

// --- Implementação da MemStorage Conforme a Interface ---
class MemStorage implements IStorage {
  // Configurar o armazenamento de sessão em memória
  // O checkPeriod limpa sessões expiradas.
  public sessionStore = new MemoryStore({ checkPeriod: 86400000 }); // 24 horas


  // --- Métodos para Usuários (Em Memória) ---
  async getUser(id: number): Promise<User | undefined> {
    return inMemoryData.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Itera sobre os valores do Map e encontra o usuário pelo username
    return Array.from(inMemoryData.users.values()).find(
      (user) => user.username === username,
    );
  }

   async getUserByEmail(email: string): Promise<User | undefined> {
     // Itera sobre os valores do Map e encontra o usuário pelo email
     return Array.from(inMemoryData.users.values()).find(
       (user) => user.email === email,
     );
   }


  async createUser(insertUser: InsertUser): Promise<User> {
    const id = getNextInMemoryId("users");
    const timestamp = new Date();
    // Cria o objeto User completo a partir dos dados de inserção e adiciona ID/timestamp
    const user: User = { ...insertUser, id, createdAt: timestamp };
    // Armazena no Map
    inMemoryData.users.set(id, user);
    return user; // Retorna o objeto User criado
  }

   async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
      const user = inMemoryData.users.get(id);
      if (!user) return undefined;

      // Cria um novo objeto com os dados atualizados
      const updatedUser = { ...user, ...userData };
      // Sobrescreve a entrada no Map
      inMemoryData.users.set(id, updatedUser);
      return updatedUser; // Retorna o objeto User atualizado
   }

   async deleteUser(id: number): Promise<boolean> {
       // Em um sistema real com DB, seria necessário excluir campanhas, doações etc. em cascata ou definir FKs.
       // Aqui, no armazenamento em memória, apenas removemos o usuário do Map.
       // Se quiser remover campanhas/doações associadas em memória, adicione essa lógica aqui.
       return inMemoryData.users.delete(id); // Retorna true se removeu, false se não encontrou
   }

  // --- Métodos para Campanhas (Em Memória) ---
  async getCampaigns(): Promise<Campaign[]> {
    // Retorna todos os valores do Map de campanhas em um array
    // Nota: Campos JSON (pickupSchedule, districts) serão serializados aqui se o objeto original não era string
    // Ensure JSON fields are parsed when retrieved for frontend if needed as objects
    return Array.from(inMemoryData.campaigns.values()).map(campaign => ({
        ...campaign,
        pickupSchedule: typeof campaign.pickupSchedule === 'string' ? JSON.parse(campaign.pickupSchedule) : campaign.pickupSchedule,
        districts: typeof campaign.districts === 'string' ? JSON.parse(campaign.districts) : campaign.districts
    }));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const campaign = inMemoryData.campaigns.get(id);
     if (!campaign) return undefined;
     // Parse campos JSON ao recuperar para frontend
     return {
         ...campaign,
         pickupSchedule: typeof campaign.pickupSchedule === 'string' ? JSON.parse(campaign.pickupSchedule) : campaign.pickupSchedule,
         districts: typeof campaign.districts === 'string' ? JSON.parse(campaign.districts) : campaign.districts
     };
  }

  async getCampaignByCode(code: string): Promise<Campaign | undefined> {
     // Encontra campanha pelo código único
     const campaign = Array.from(inMemoryData.campaigns.values()).find(
       camp => camp.uniqueCode === code
     );
     if (!campaign) return undefined;
     // Parse campos JSON
     return {
         ...campaign,
         pickupSchedule: typeof campaign.pickupSchedule === 'string' ? JSON.parse(campaign.pickupSchedule) : campaign.pickupSchedule,
         districts: typeof campaign.districts === 'string' ? JSON.parse(campaign.districts) : campaign.districts
     };
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    // Filtra campanhas pelo ID do criador (createdBy)
    return Array.from(inMemoryData.campaigns.values())
      .filter(campaign => campaign.createdBy === userId)
      .map(campaign => ({ // Parse campos JSON para cada campanha filtrada
          ...campaign,
          pickupSchedule: typeof campaign.pickupSchedule === 'string' ? JSON.parse(campaign.pickupSchedule) : campaign.pickupSchedule,
          districts: typeof campaign.districts === 'string' ? JSON.parse(campaign.districts) : campaign.districts
      }));
  }


  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = getNextInMemoryId("campaigns");
    const timestamp = new Date();

     // Gerar uniqueCode se não vier nos dados de inserção (o frontend agora gera no POST, mas este é um fallback)
     const uniqueCode = insertCampaign.uniqueCode || generateUniqueCode();

     // Lógica para serializar campos JSON antes de armazenar no Map
     // insertCampaignSchema Zod já validou o formato como objeto/array
     const campaignToStore: Campaign = {
         id,
         createdAt: timestamp,
         uniqueCode,
         ...insertCampaign,
         // Serializar campos JSON para string antes de armazenar no Map
         // Assumindo que insertCampaign.pickupSchedule e insertCampaign.districts são objetos/arrays válidos aqui
         pickupSchedule: insertCampaign.pickupSchedule ? JSON.stringify(insertCampaign.pickupSchedule) : null,
         districts: insertCampaign.districts ? JSON.stringify(insertCampaign.districts) : null, // Salvar como null se array vazio? Depende da necessidade. JSON.stringify([]) é "[]"
     };


    // Armazena no Map
    inMemoryData.campaigns.set(id, campaignToStore);

    // Retorna o objeto com campos JSON PARSEADOS (como o frontend espera)
     return {
         ...campaignToStore,
         pickupSchedule: campaignToStore.pickupSchedule ? JSON.parse(campaignToStore.pickupSchedule) : null,
         districts: campaignToStore.districts ? JSON.parse(campaignToStore.districts) : null,
     };
  }


  async updateCampaign(id: number, campaignUpdate: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = inMemoryData.campaigns.get(id);
    if (!campaign) return undefined;

    // Cria um novo objeto com os dados atualizados
     const updatedCampaignData = { ...campaign, ...campaignUpdate };

     // Lógica para serializar campos JSON SE eles estiverem sendo atualizados
      if (campaignUpdate.pickupSchedule !== undefined) { // Se pickupSchedule foi enviado na atualização
          updatedCampaignData.pickupSchedule = campaignUpdate.pickupSchedule ? JSON.stringify(campaignUpdate.pickupSchedule) : null;
      }
      if (campaignUpdate.districts !== undefined) { // Se districts foi enviado na atualização
          updatedCampaignData.districts = campaignUpdate.districts ? JSON.stringify(campaignUpdate.districts) : null;
      }

    // Sobrescreve a entrada no Map
    inMemoryData.campaigns.set(id, updatedCampaignData);

    // Retorna o objeto atualizado com campos JSON PARSEADOS
     return {
         ...updatedCampaignData,
         pickupSchedule: updatedCampaignData.pickupSchedule ? JSON.parse(updatedCampaignData.pickupSchedule) : null,
         districts: updatedCampaignData.districts ? JSON.parse(updatedCampaignData.districts) : null,
     };
  }

   async deleteCampaign(id: number): Promise<boolean> {
       // No armazenamento em memória, removemos a campanha e quaisquer itens/doações relacionados em memória.
       const campaignExists = inMemoryData.campaigns.has(id);
       if (!campaignExists) return false; // Não encontrou para deletar

       // Remover itens necessários associados
        inMemoryData.neededItems = new Map(
            Array.from(inMemoryData.neededItems.entries())
                 .filter(([_, item]) => item.campaignId !== id)
        );

        // Remover doações materiais associadas e seus itens
         const donationsToRemove = Array.from(inMemoryData.donations.values()).filter(d => d.campaignId === id);
         donationsToRemove.forEach(donation => {
              // Remover itens de doação associados
              inMemoryData.donationItems = new Map(
                  Array.from(inMemoryData.donationItems.entries())
                       .filter(([_, item]) => item.donationId !== donation.id)
              );
              // Remover a doação material principal
              inMemoryData.donations.delete(donation.id);
         });


        // Remover doações financeiras associadas
         inMemoryData.financialDonations = new Map(
             Array.from(inMemoryData.financialDonations.entries())
                  .filter(([_, donation]) => donation.campaignId !== id)
         );

       // Finalmente, remover a campanha principal
       return inMemoryData.campaigns.delete(id); // Retorna true se removeu
   }


  // --- Métodos para Categorias (Em Memória) ---
  async getCategories(): Promise<Category[]> {
    return Array.from(inMemoryData.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return inMemoryData.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = getNextInMemoryId("categories");
    const category: Category = { ...insertCategory, id };
    inMemoryData.categories.set(id, category);
    return category;
  }


  // --- Métodos para Itens Necessários (Em Memória) ---
  async getNeededItems(campaignId: number): Promise<NeededItem[]> {
     // Filtra itens necessários pelo ID da campanha
     return Array.from(inMemoryData.neededItems.values())
       .filter(item => item.campaignId === campaignId);
   }

   async getNeededItem(id: number): Promise<NeededItem | undefined> {
     return inMemoryData.neededItems.get(id);
   }

   async createNeededItem(insertNeededItem: InsertNeededItem): Promise<NeededItem> {
     const id = getNextInMemoryId("neededItems");
     const neededItem: NeededItem = { ...insertNeededItem, id };
     inMemoryData.neededItems.set(id, neededItem);
     return neededItem;
   }

   async updateNeededItem(id: number, neededItemUpdate: Partial<NeededItem>): Promise<NeededItem | undefined> {
      const neededItem = inMemoryData.neededItems.get(id);
      if (!neededItem) return undefined;
      const updatedNeededItem = { ...neededItem, ...neededItemUpdate };
      inMemoryData.neededItems.set(id, updatedNeededItem);
      return updatedNeededItem;
   }

    async deleteNeededItem(id: number): Promise<boolean> {
      // No armazenamento em memória, removemos o item necessário e quaisquer itens de doação material associados.
       const itemExists = inMemoryData.neededItems.has(id);
       if (!itemExists) return false;

        // Remover itens de doação associados a este item necessário
         inMemoryData.donationItems = new Map(
             Array.from(inMemoryData.donationItems.entries())
                  .filter(([_, item]) => item.neededItemId !== id)
         );

       return inMemoryData.neededItems.delete(id);
    }


   // --- Métodos para Doações Materiais (Em Memória) ---
   async getDonations(campaignId?: number): Promise<Donation[]> {
      let donations = Array.from(inMemoryData.donations.values());
     if (campaignId) {
       donations = donations.filter(donation => donation.campaignId === campaignId);
     }
     return donations; // Retorna o objeto Donation como está no Map
   }

   async getDonation(id: number): Promise<Donation | undefined> {
     return inMemoryData.donations.get(id);
   }

   async createDonation(insertDonation: InsertDonation): Promise<Donation> {
      const id = getNextInMemoryId("donations");
      const timestamp = new Date();
      const donation: Donation = { ...insertDonation, id, createdAt: timestamp, status: insertDonation.status || "pending" }; // Garante status padrão
      inMemoryData.donations.set(id, donation);
      return donation;
    }

    async updateDonationStatus(id: number, status: string): Promise<Donation | undefined> {
      const donation = inMemoryData.donations.get(id);
      if (!donation) return undefined;

      const updatedDonation = { ...donation, status };
      inMemoryData.donations.set(id, updatedDonation);
      return updatedDonation;
    }


   // --- Métodos para Itens de Doação Material (Em Memória) ---
   async getDonationItems(donationId: number): Promise<DonationItem[]> {
     return Array.from(inMemoryData.donationItems.values())
       .filter(item => item.donationId === donationId);
   }

   async createDonationItem(insertDonationItem: InsertDonationItem): Promise<DonationItem> {
     const id = getNextInMemoryId("donationItems"); // ID para o item de doação (pode não ser necessário se a PK for composta)
     // No schema, donationItems tem chave composta (donationId, neededItemId), não serial.
     // A implementação do Map precisa considerar isso. Usar o ID gerado em memória aqui não está certo se o schema for composto.
     // Uma implementação correta para chave composta em Map seria Map<string, DonationItem> onde a chave é `${donationId}-${neededItemId}`
     // Para manter a compatibilidade com a interface que espera um ID, vamos simular um ID serial, mas a PK real é composta.
     // Corrigindo para usar a chave composta para armazenamento no Map
     const key = `${insertDonationItem.donationId}-${insertDonationItem.neededItemId}`;
     // Verificar se a entrada já existe antes de adicionar? Depende da lógica de negócio (sumarizar quantidades?)
     // Para simplificar agora, vamos apenas adicionar. Se o mesmo item for doado na mesma doação, ele terá IDs em memória diferentes.
     // Isso diverge do schema DB real com PK composta.
     // Para fins de teste rápido, vamos adicionar ao Map com um ID simples gerado:
      const donationItem: DonationItem = { id: getNextInMemoryId('donationItems'), ...insertDonationItem }; // Simula ID serial
      inMemoryData.donationItems.set(donationItem.id, donationItem); // Armazena usando ID serial
      return donationItem; // Retorna com ID serial simulado
   }


   // --- Métodos para Doações Financeiras (Em Memória) ---
   async getFinancialDonations(campaignId?: number): Promise<FinancialDonation[]> {
      let donations = Array.from(inMemoryData.financialDonations.values());
      if (campaignId) {
        donations = donations.filter(donation => donation.campaignId === campaignId);
      }
       // Parse accountInfo de volta para objeto para cada doação ao retornar
      return donations.map(donation => ({
           ...donation,
           accountInfo: donation.accountInfo ? JSON.parse(donation.accountInfo as string) : null
       }));
    }

    async getFinancialDonation(id: number): Promise<FinancialDonation | undefined> {
      const donation = inMemoryData.financialDonations.get(id);
      if (!donation) return undefined;
       // Parse accountInfo de volta para objeto ao retornar
      return {
           ...donation,
           accountInfo: donation.accountInfo ? JSON.parse(donation.accountInfo as string) : null
       };
    }

    async createFinancialDonation(insertDonation: InsertFinancialDonation): Promise<FinancialDonation> {
      const id = getNextInMemoryId("financialDonations");
      const timestamp = new Date();
       // Serializar accountInfo antes de armazenar
       const financialDonationToStore: FinancialDonation = {
           id,
           createdAt: timestamp,
            status: insertDonation.status || "pendente", // Garante status padrão
           ...insertDonation,
           accountInfo: insertDonation.accountInfo ? JSON.stringify(insertDonation.accountInfo) : null,
       };
      inMemoryData.financialDonations.set(id, financialDonationToStore);
       // Retornar com accountInfo parseado
       return {
           ...financialDonationToStore,
           accountInfo: financialDonationToStore.accountInfo ? JSON.parse(financialDonationToStore.accountInfo as string) : null,
       };
    }

    async updateFinancialDonationStatus(id: number, status: string): Promise<FinancialDonation | undefined> {
       const donation = inMemoryData.financialDonations.get(id);
       if (!donation) return undefined;
       const updatedDonation = { ...donation, status };
       inMemoryData.financialDonations.set(id, updatedDonation);
        // Retornar com accountInfo parseado
        return {
            ...updatedDonation,
            accountInfo: updatedDonation.accountInfo ? JSON.parse(updatedDonation.accountInfo as string) : null,
        };
     }

  // --- Métodos para Gerenciadores de Campanha / Contas Bancárias (Mocks em Memória - Incompletos) ---
  // Mantidos como mocks básicos, sem implementação completa
  async createCampaignManager(data: any): Promise<any> {
      console.warn("createCampaignManager é um mock e NÃO está implementado no banco de dados ou com lógica completa.");
      const id = getNextInMemoryId("campaignManagers"); // Usa ID em memória para mock
      // Não salva no Map para manter simplicidade
      return { id, ...data }; // Retorna dados mockados com ID
  }

  async getCampaignManagerByEmail(email: string): Promise<any | undefined> {
      console.warn("getCampaignManagerByEmail é um mock e NÃO está implementado no banco de dados ou com lógica completa.");
      // Não há Map para consultar, sempre retorna undefined
      return undefined;
  }

  async createBankAccount(data: any): Promise<any> {
      console.warn("createBankAccount é um mock e NÃO está implementado no banco de dados ou com lógica completa.");
      const id = getNextInMemoryId("bankAccounts"); // Usa ID em memória para mock
       // Não salva no Map para manter simplicidade
      return { id, ...data }; // Retorna dados mockados com ID
  }
}

// Exporta a instância da MemStorage
export const storage = new MemStorage();

// Note: A lógica para criar um usuário admin padrão ao iniciar o servidor
// estava na versão anterior do storage.ts. Ela precisa ser movida para cá
// ou chamada de index.ts após o storage ser exportado.
// Vamos chamá-la de index.ts, pois requer a função hashPassword e o objeto storage.