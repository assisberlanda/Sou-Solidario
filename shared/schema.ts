import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (empresas/administradores)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  city: text("city"),
  district: text("district"),
  about: text("about"),
  organization: text("organization"),
  role: text("role").notNull().default("empresa"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true),
  createdBy: integer("created_by").notNull(), // FK to users.id
  uniqueCode: text("unique_code").notNull().unique(),
  urgent: boolean("urgent").default(false),
  pickupSchedule: json("pickup_schedule"), // Store horarios_inicio, horarios_fim
  districts: json("districts"), // Store bairros array
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true, 
  createdAt: true,
  uniqueCode: true // Generated server-side
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

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

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});