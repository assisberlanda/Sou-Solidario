import { 
  users, type User, type InsertUser,
  campaigns, type Campaign, type InsertCampaign,
  categories, type Category, type InsertCategory,
  neededItems, type NeededItem, type InsertNeededItem,
  donations, type Donation, type InsertDonation,
  donationItems, type DonationItem, type InsertDonationItem,
  financialDonations, type FinancialDonation, type InsertFinancialDonation
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignByCode(code: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Needed Items
  getNeededItems(campaignId: number): Promise<NeededItem[]>;
  getNeededItem(id: number): Promise<NeededItem | undefined>;
  createNeededItem(neededItem: InsertNeededItem): Promise<NeededItem>;
  updateNeededItem(id: number, neededItem: Partial<NeededItem>): Promise<NeededItem | undefined>;
  deleteNeededItem(id: number): Promise<boolean>;
  
  // Donations
  getDonations(campaignId?: number): Promise<Donation[]>;
  getDonation(id: number): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonationStatus(id: number, status: string): Promise<Donation | undefined>;
  
  // Donation Items
  getDonationItems(donationId: number): Promise<DonationItem[]>;
  createDonationItem(donationItem: InsertDonationItem): Promise<DonationItem>;
  
  // Financial Donations
  getFinancialDonations(campaignId?: number): Promise<FinancialDonation[]>;
  getFinancialDonation(id: number): Promise<FinancialDonation | undefined>;
  createFinancialDonation(donation: InsertFinancialDonation): Promise<FinancialDonation>;
  updateFinancialDonationStatus(id: number, status: string): Promise<FinancialDonation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private categories: Map<number, Category>;
  private neededItems: Map<number, NeededItem>;
  private donations: Map<number, Donation>;
  private donationItems: Map<number, DonationItem>;
  private financialDonations: Map<number, FinancialDonation>;
  private lastIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.categories = new Map();
    this.neededItems = new Map();
    this.donations = new Map();
    this.donationItems = new Map();
    this.financialDonations = new Map();
    this.lastIds = {
      users: 0,
      campaigns: 0,
      categories: 0,
      neededItems: 0,
      donations: 0,
      donationItems: 0,
      financialDonations: 0
    };
    
    // Inicializando com dados de exemplo
    this.initializeData();
  }

  private getNextId(entity: string): number {
    this.lastIds[entity] += 1;
    return this.lastIds[entity];
  }

  // Gerar código único para campanhas (1 letra + 5 números)
  private generateUniqueCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    const numbers = Math.floor(Math.random() * 900000) + 100000; // 6 dígitos (100000-999999)
    return `${letter}${numbers}`;
  }

  // Inicializar com dados de exemplo
  private initializeData() {
    // Categorias iniciais
    const categoryIds = {
      agua: this.createCategory({ name: "Água", color: "#2196F3" }).id,
      alimentos: this.createCategory({ name: "Alimentos", color: "#4CAF50" }).id,
      roupas: this.createCategory({ name: "Roupas", color: "#673AB7" }).id,
      cobertores: this.createCategory({ name: "Cobertores", color: "#F44336" }).id,
      construcao: this.createCategory({ name: "Construção", color: "#FFC107" }).id,
      higiene: this.createCategory({ name: "Higiene", color: "#FF5722" }).id,
      calcados: this.createCategory({ name: "Calçados", color: "#3F51B5" }).id
    };
    
    // Usuário admin
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Administrador",
      email: "admin@sousolidario.org",
      role: "admin",
      organization: "Sou Solidário"
    });
    
    // Campanhas iniciais
    const enchentesRS = this.createCampaign({
      title: "Enchentes em Porto Alegre",
      description: "Ajuda para famílias desabrigadas pelas enchentes no Rio Grande do Sul. Milhares de pessoas precisam de apoio.",
      location: "Rio Grande do Sul",
      endDate: "2023-08-30",
      createdBy: 1,
      urgent: true,
      imageUrl: "/assets/porto_alegre.jpeg",
      active: true,
      uniqueCode: "P12345"
    });
    
    this.createCampaign({
      title: "Reconstrução em Petrópolis",
      description: "Apoio às famílias afetadas pelos deslizamentos em Petrópolis. Materiais de construção e itens básicos.",
      location: "Rio de Janeiro",
      endDate: "2023-09-15",
      createdBy: 1,
      urgent: false,
      imageUrl: "/assets/petropolis.jpeg",
      active: true,
      uniqueCode: "R67890"
    });
    
    this.createCampaign({
      title: "Campanha do Agasalho",
      description: "Arrecadação de roupas de inverno para população em situação de vulnerabilidade em São Paulo.",
      location: "São Paulo",
      endDate: "2023-07-30",
      createdBy: 1,
      urgent: false,
      imageUrl: "/assets/campanha-do-agasalho.jpg",
      active: true,
      uniqueCode: "C24680"
    });
    
    // Itens necessários
    this.createNeededItem({
      campaignId: enchentesRS.id,
      name: "Água mineral",
      categoryId: categoryIds.agua,
      quantity: 1000,
      unit: "garrafas",
      priority: 1
    });
    
    this.createNeededItem({
      campaignId: enchentesRS.id,
      name: "Alimentos não perecíveis",
      categoryId: categoryIds.alimentos,
      quantity: 500,
      unit: "kg",
      priority: 1
    });
    
    this.createNeededItem({
      campaignId: enchentesRS.id,
      name: "Roupas de inverno",
      categoryId: categoryIds.roupas,
      quantity: 300,
      unit: "peças",
      priority: 2
    });
    
    this.createNeededItem({
      campaignId: enchentesRS.id,
      name: "Cobertores",
      categoryId: categoryIds.cobertores,
      quantity: 200,
      unit: "unidades",
      priority: 1
    });
    
    this.createNeededItem({
      campaignId: enchentesRS.id,
      name: "Produtos de higiene",
      categoryId: categoryIds.higiene,
      quantity: 150,
      unit: "kits",
      priority: 1
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getNextId("users");
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignByCode(code: string): Promise<Campaign | undefined> {
    return Array.from(this.campaigns.values()).find(
      campaign => campaign.uniqueCode === code
    );
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.getNextId("campaigns");
    const timestamp = new Date();
    
    // Se não foi fornecido um código único, gere um automaticamente
    const uniqueCode = insertCampaign.uniqueCode || this.generateUniqueCode();
    
    const campaign: Campaign = { ...insertCampaign, id, createdAt: timestamp, uniqueCode };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, campaignUpdate: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...campaignUpdate };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.getNextId("categories");
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Needed Items
  async getNeededItems(campaignId: number): Promise<NeededItem[]> {
    return Array.from(this.neededItems.values())
      .filter(item => item.campaignId === campaignId);
  }

  async getNeededItem(id: number): Promise<NeededItem | undefined> {
    return this.neededItems.get(id);
  }

  async createNeededItem(insertNeededItem: InsertNeededItem): Promise<NeededItem> {
    const id = this.getNextId("neededItems");
    const neededItem: NeededItem = { ...insertNeededItem, id };
    this.neededItems.set(id, neededItem);
    return neededItem;
  }

  async updateNeededItem(id: number, neededItemUpdate: Partial<NeededItem>): Promise<NeededItem | undefined> {
    const neededItem = this.neededItems.get(id);
    if (!neededItem) return undefined;
    
    const updatedNeededItem = { ...neededItem, ...neededItemUpdate };
    this.neededItems.set(id, updatedNeededItem);
    return updatedNeededItem;
  }

  async deleteNeededItem(id: number): Promise<boolean> {
    return this.neededItems.delete(id);
  }

  // Donations
  async getDonations(campaignId?: number): Promise<Donation[]> {
    let donations = Array.from(this.donations.values());
    if (campaignId) {
      donations = donations.filter(donation => donation.campaignId === campaignId);
    }
    return donations;
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.getNextId("donations");
    const timestamp = new Date();
    const donation: Donation = { ...insertDonation, id, createdAt: timestamp };
    this.donations.set(id, donation);
    return donation;
  }

  async updateDonationStatus(id: number, status: string): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;
    
    const updatedDonation = { ...donation, status };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  // Donation Items
  async getDonationItems(donationId: number): Promise<DonationItem[]> {
    return Array.from(this.donationItems.values())
      .filter(item => item.donationId === donationId);
  }

  async createDonationItem(insertDonationItem: InsertDonationItem): Promise<DonationItem> {
    const id = this.getNextId("donationItems");
    const donationItem: DonationItem = { ...insertDonationItem, id };
    this.donationItems.set(id, donationItem);
    return donationItem;
  }

  // Financial Donations
  async getFinancialDonations(campaignId?: number): Promise<FinancialDonation[]> {
    let donations = Array.from(this.financialDonations.values());
    if (campaignId) {
      donations = donations.filter(donation => donation.campaignId === campaignId);
    }
    return donations;
  }

  async getFinancialDonation(id: number): Promise<FinancialDonation | undefined> {
    return this.financialDonations.get(id);
  }

  async createFinancialDonation(insertDonation: InsertFinancialDonation): Promise<FinancialDonation> {
    const id = this.getNextId("financialDonations");
    const timestamp = new Date();
    const donation: FinancialDonation = { ...insertDonation, id, createdAt: timestamp };
    this.financialDonations.set(id, donation);
    return donation;
  }

  async updateFinancialDonationStatus(id: number, status: string): Promise<FinancialDonation | undefined> {
    const donation = this.financialDonations.get(id);
    if (!donation) return undefined;
    
    const updatedDonation = { ...donation, status };
    this.financialDonations.set(id, updatedDonation);
    return updatedDonation;
  }
}

export const storage = new MemStorage();
