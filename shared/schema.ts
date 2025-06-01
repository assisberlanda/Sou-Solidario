// Sou-Solidario - cópia/shared/schema.ts

import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod"; // Importa createSelectSchema também
import { z } from "zod";
import { relations } from "drizzle-orm"; // Importa relations para definir relacionamentos

// Users (empresas/administradores/doadores)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Pode ser o email ou um username separado
  password: text("password").notNull(), // Armazenar senha hash
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  city: text("city"),
  district: text("district"),
  about: text("about"), // Campo para descrição da empresa ou pessoa
  organization: text("organization"), // Nome da organização se for tipo 'empresa'
  role: text("role").notNull().default("user"), // 'user', 'empresa', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    createdCampaigns: many(campaigns),
}));


// Categories (para itens necessários)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color"), // Ex: #RRGGBB ou nome da cor
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    neededItems: many(neededItems),
}));


// Campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(), // Cidade/Região principal
  startDate: timestamp("start_date", { mode: 'date' }), // Usar tipo timestamp para datas
  endDate: timestamp("end_date", { mode: 'date' }).notNull(), // Usar tipo timestamp para datas
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
  createdBy: integer("created_by").notNull(), // FK para users.id (quem criou a campanha, ex: empresa ou admin)
  uniqueCode: text("unique_code").notNull().unique(), // Código curto para compartilhar
  urgent: boolean("urgent").default(false).notNull(),
  pickupSchedule: json("pickup_schedule"), // Armazenar horários/dias de coleta específicos (ex: { "days": [1, 3, 5], "hours": "09:00-18:00" })
  districts: json("districts"), // Armazenar bairros/áreas de coleta atendidas (array de strings)
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
    creator: one(users, {
        fields: [campaigns.createdBy],
        references: [users.id],
    }),
    neededItems: many(neededItems),
    donations: many(donations),
    financialDonations: many(financialDonations),
}));


// Needed Items (Itens específicos que uma campanha precisa)
export const neededItems = pgTable("needed_items", {
    id: serial("id").primaryKey(),
    campaignId: integer("campaign_id").notNull(), // FK para campaigns.id
    name: text("name").notNull(), // Nome do item (ex: Água, Cobertores)
    categoryId: integer("category_id").notNull(), // FK para categories.id
    quantity: integer("quantity").notNull(), // Quantidade necessária
    unit: text("unit").notNull(), // Unidade de medida (ex: litros, unidades, kg)
    priority: integer("priority").default(2).notNull(), // 1 para alta, 2 para normal
    // Pode adicionar campos como 'quantity_donated', 'progress' etc. se necessário
});

export const neededItemsRelations = relations(neededItems, ({ one, many }) => ({
    campaign: one(campaigns, {
        fields: [neededItems.campaignId],
        references: [campaigns.id],
    }),
    category: one(categories, {
        fields: [neededItems.categoryId],
        references: [categories.id],
    }),
    donationItems: many(donationItems),
}));


// Donations (Registro de uma doação material por um doador)
export const donations = pgTable("donations", {
    id: serial("id").primaryKey(),
    campaignId: integer("campaign_id").notNull(), // FK para campaigns.id
    donorName: text("donor_name").notNull(),
    donorPhone: text("donor_phone").notNull(),
    donorEmail: text("donor_email"), // Opcional
    address: text("address").notNull(), // Endereço para coleta/entrega
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    pickupDate: timestamp("pickup_date", { mode: 'date' }).notNull(), // Data agendada para coleta
    pickupTime: text("pickup_time").notNull(), // Horário agendado (ex: "14:00")
    pickupInstructions: text("pickup_instructions"), // Instruções adicionais para coleta
    status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'scheduled', 'collected', 'cancelled'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Pode adicionar FK para user.id se o doador for um usuário cadastrado
});

export const donationsRelations = relations(donations, ({ one, many }) => ({
    campaign: one(campaigns, {
        fields: [donations.campaignId],
        references: [campaigns.id],
    }),
    donationItems: many(donationItems),
    // donorUser: one(users, { // Se adicionar FK para user.id
    //     fields: [donations.donorUserId],
    //     references: [users.id],
    // }),
}));


// Donation Items (Itens específicos dentro de uma doação material)
export const donationItems = pgTable("donation_items", {
    donationId: integer("donation_id").notNull(), // FK para donations.id
    neededItemId: integer("needed_item_id").notNull(), // FK para neededItems.id
    quantity: integer("quantity").notNull(), // Quantidade doada deste item específico
    // Pode adicionar mais campos se necessário (ex: 'status', 'notes')
}, (t) => ({
    pk: primaryKey({ columns: [t.donationId, t.neededItemId] }), // Chave primária composta
}));

export const donationItemsRelations = relations(donationItems, ({ one }) => ({
    donation: one(donations, {
        fields: [donationItems.donationId],
        references: [donations.id],
    }),
    neededItem: one(neededItems, {
        fields: [donationItems.neededItemId],
        references: [neededItems.id],
    }),
}));


// Financial Donations (Registro de uma doação financeira)
export const financialDonations = pgTable("financial_donations", {
    id: serial("id").primaryKey(),
    campaignId: integer("campaign_id").notNull(), // FK para campaigns.id
    donorName: text("donor_name").notNull(),
    donorEmail: text("donor_email").notNull(),
    donorPhone: text("donor_phone").notNull(),
    amount: integer("amount").notNull(), // Valor da doação (ex: em centavos para evitar float)
    paymentMethod: text("payment_method").notNull(), // 'pix', 'cartao', 'deposito', etc.
    accountInfo: json("account_info"), // Informações da conta/chave PIX para o doador (JSON)
    message: text("message"), // Mensagem opcional do doador
    status: text("status").notNull().default("pendente"), // 'pendente', 'confirmado', 'falhou', etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
     // Pode adicionar FK para user.id se o doador for um usuário cadastrado
    // Pode adicionar campos de gateway de pagamento (transaction_id, etc.)
});

export const financialDonationsRelations = relations(financialDonations, ({ one }) => ({
    campaign: one(campaigns, {
        fields: [financialDonations.campaignId],
        references: [campaigns.id],
    }),
     // donorUser: one(users, { // Se adicionar FK para user.id
    //     fields: [financialDonations.donorUserId],
    //     references: [users.id],
    // }),
}));

// Session table (usada por connect-pg-simple) - Drizzle Kit cria se createTableIfMissing: true
// export const session = pgTable("session", { /* ... */ });


// Definir objeto schema completo para Drizzle
const schema = {
    users,
    campaigns,
    categories,
    neededItems,
    donations,
    donationItems,
    financialDonations,
    usersRelations,
    campaignsRelations,
    categoriesRelations,
    neededItemsRelations,
    donationsRelations,
    donationItemsRelations,
    financialDonationsRelations,
    // Incluir outras tabelas e relations se existirem
};

// --- Esquemas Zod para Validação e Inserção ---

// Esquemas de Inserção (derivados das tabelas Drizzle, usados principalmente no backend para validação antes de inserir)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  uniqueCode: true, // Gerado server-side, não vem do input direto
});
export const insertCategorySchema = createInsertSchema(categories).omit({
    id: true,
});
export const insertNeededItemSchema = createInsertSchema(neededItems).omit({
    id: true,
});
export const insertDonationSchema = createInsertSchema(donations).omit({
    id: true,
    createdAt: true,
    status: true, // Status inicial é definido no backend
});
export const insertDonationItemSchema = createInsertSchema(donationItems); // Chave composta no Drizzle, verificar se schema Zod lida bem
export const insertFinancialDonationSchema = createInsertSchema(financialDonations).omit({
    id: true,
    createdAt: true,
    status: true, // Status inicial é definido no backend
    accountInfo: true, // Info da conta é definida no backend/campanha
});


// Esquemas de Processo/Formulário (usados principalmente no frontend para validar input do usuário)
// donationProcessSchema (doação material combinada)
export const donationProcessSchema = z.object({
  campaignId: z.number({ required_error: "ID da campanha é obrigatório" }),
  items: z.array(z.object({
    neededItemId: z.number({ required_error: "ID do item necessário é obrigatório" }),
    quantity: z.number({ required_error: "Quantidade é obrigatória" }).int().positive({ message: "Quantidade deve ser um número inteiro positivo" }),
  }), { required_error: "Lista de itens doados é obrigatória" }).min(1, { message: "Selecione pelo menos um item para doar" }),
  donorName: z.string().min(1, { message: "Nome é obrigatório" }),
  donorPhone: z.string().min(10, { message: "Telefone é obrigatório" }), // Ajustar validação para formato (00) 90000-0000 se necessário
  donorEmail: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')), // Email opcional
  address: z.string().min(1, { message: "Endereço é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(2, { message: "Estado é obrigatório" }),
  zipCode: z.string().min(8, { message: "CEP é obrigatório" }), // Ajustar validação para formato 00000-000 se necessário
  pickupDate: z.date({ required_error: "Data de coleta é obrigatória", invalid_type_error: "Data inválida" }), // Validar como objeto Date
  pickupTime: z.string().min(1, { message: "Horário de coleta é obrigatório" }),
  pickupInstructions: z.string().optional(), // Instruções opcionais
});


// financialDonationProcessSchema (doação financeira)
export const financialDonationProcessSchema = z.object({
  campaignId: z.number({ required_error: "ID da campanha é obrigatório" }),
  donorName: z.string().min(1, { message: "Nome é obrigatório" }),
  donorEmail: z.string().email({ message: "Email inválido" }), // Email obrigatório para financeira? Ajustar se opcional
  donorPhone: z.string().min(10, { message: "Telefone é obrigatório" }), // Ajustar validação para formato se necessário
  amount: z.number({ required_error: "Valor é obrigatório" }).int().positive({ message: "Valor deve ser um número inteiro positivo" }), // Valor em R$
  paymentMethod: z.enum(["pix", "cartao", "deposito"], {
    errorMap: () => ({ message: "Selecione um método de pagamento válido" })
  }),
  message: z.string().optional(),
});


// chatMessageSchema (schema para mensagens do chatbot - usado em server/routes.ts)
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});


// Exportar o objeto schema completo para configuração do Drizzle
export { schema };

// Exportar todos os tipos gerados pelo Drizzle
export type {
    User, InsertUser,
    Campaign, InsertCampaign,
    Category, InsertCategory,
    NeededItem, InsertNeededItem,
    Donation, InsertDonation,
    DonationItem, InsertDonationItem,
    FinancialDonation, InsertFinancialDonation,
};

// Exportar outros tipos úteis se existirem
// Ex: export type CampaignManager = typeof campaignManagers.$inferSelect;
// Ex: export type BankAccount = typeof bankAccounts.$inferSelect;