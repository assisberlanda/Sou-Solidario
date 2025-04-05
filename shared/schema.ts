import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Usuários (organizações/administradores)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  organization: text("organization"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campanhas de doação
export const campaignManagers = pgTable("campaign_managers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  document: text("document").notNull(), // CPF
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  managerId: integer("manager_id").notNull(),
  bankName: text("bank_name").notNull(),
  bankCode: text("bank_code").notNull(),
  agency: text("agency").notNull(),
  account: text("account").notNull(),
  document: text("document").notNull(),
  pixKeys: json("pix_keys").notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  endDate: text("end_date").notNull(),
  managerId: integer("manager_id").notNull(),
  urgent: boolean("urgent").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true),
  uniqueCode: text("unique_code").notNull().unique(),
  bankAccountId: integer("bank_account_id").notNull(),
});

// Categorias de itens
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

// Itens necessários para cada campanha
export const neededItems = pgTable("needed_items", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  priority: integer("priority").default(1),
});

// Doações
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  donorName: text("donor_name").notNull(),
  donorPhone: text("donor_phone").notNull(),
  donorEmail: text("donor_email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  pickupDate: text("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Itens doados
export const donationItems = pgTable("donation_items", {
  id: serial("id").primaryKey(),
  donationId: integer("donation_id").notNull(),
  neededItemId: integer("needed_item_id").notNull(),
  quantity: integer("quantity").notNull(),
});

// Doações financeiras
export const financialDonations = pgTable("financial_donations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  donorPhone: text("donor_phone").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  accountInfo: text("account_info").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas para inserção
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertNeededItemSchema = createInsertSchema(neededItems).omit({ id: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export const insertDonationItemSchema = createInsertSchema(donationItems).omit({ id: true });
export const insertFinancialDonationSchema = createInsertSchema(financialDonations).omit({ id: true, createdAt: true });

// Schemas para mensagens do chat
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

// Schemas estendidos para validação
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Nome de usuário é obrigatório" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

export const donationProcessSchema = z.object({
  campaignId: z.number(),
  items: z.array(z.object({
    neededItemId: z.number(),
    quantity: z.number().positive(),
  })),
  donorName: z.string().min(1, { message: "Nome é obrigatório" }),
  donorPhone: z.string().min(10, { message: "Telefone é obrigatório" }),
  donorEmail: z.string().email().optional(),
  address: z.string().min(1, { message: "Endereço é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(2, { message: "Estado é obrigatório" }),
  zipCode: z.string().min(1, { message: "CEP é obrigatório" }),
  pickupDate: z.string().min(1, { message: "Data de coleta é obrigatória" }),
  pickupTime: z.string().min(1, { message: "Horário de coleta é obrigatório" }),
});

export const financialDonationProcessSchema = z.object({
  campaignId: z.number(),
  donorName: z.string().min(1, { message: "Nome é obrigatório" }),
  donorEmail: z.string().email({ message: "Email inválido" }),
  donorPhone: z.string().min(10, { message: "Telefone é obrigatório" }),
  amount: z.number().min(1, { message: "Valor deve ser maior que zero" }),
  paymentMethod: z.enum(["pix", "cartao", "deposito"], { 
    errorMap: () => ({ message: "Selecione um método de pagamento válido" }) 
  }),
  message: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type NeededItem = typeof neededItems.$inferSelect;
export type InsertNeededItem = z.infer<typeof insertNeededItemSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type DonationItem = typeof donationItems.$inferSelect;
export type InsertDonationItem = z.infer<typeof insertDonationItemSchema>;

export type FinancialDonation = typeof financialDonations.$inferSelect;
export type InsertFinancialDonation = z.infer<typeof insertFinancialDonationSchema>;
export type FinancialDonationProcess = z.infer<typeof financialDonationProcessSchema>;

export type ChatMessage = z.infer<typeof chatMessageSchema>;
