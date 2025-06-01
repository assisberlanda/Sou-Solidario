# 🤝 Sou Solidário

<!-- ![Logo do Projeto (Opcional)](/path/to/your/logo.png) --> <!-- Uncomment and replace with the path to your logo image --> 

## 🎯 Visão Geral

O **Sou Solidário** é uma plataforma digital responsiva concebida durante um projeto pessoal em maio de 2024 e adaptado ao **Hackathon Unicesumar** com o objetivo de conectar doadores a campanhas humanitárias e Ações Sociais. O projeto foca em Tema 01: Responsabilidade Social e Acessibilidade Digital, propondo a utilização de tecnologias de Google Cloud Computing e Inteligência Artificial para promover inclusão digital, acessibilidade e capacitação para populações vulneráveis.

## ✨ Funcionalidades

A plataforma Sou Solidário oferece diversas funcionalidades, abordando diferentes aspectos da doação, inclusão e gestão:

### 🌐 Core
- Cadastro e login de usuários (Incluindo roles como 'empresa' e 'admin').
- Criação, listagem e gerenciamento de campanhas solidárias (incluindo campos como título, descrição, localização, datas, urgência e imagens).
- Criação, listagem e gerenciamento de Itens Necessários por campanha, com prioridade e quantidade.
- Geração de QR Codes únicos para campanhas, facilitando o compartilhamento e a doação direcionada.
- Registro e visualização de doações materiais (itens e quantidades) com detalhes do doador e agendamento de coleta/entrega.
- Registro e visualização de doações financeiras (com detalhes sobre métodos de pagamento e conta/chave PIX).
- Interface totalmente responsiva para diversos dispositivos (desktops, tablets, smartphones).

### 📚 Educação Solidária
- Empresas e instituições podem doar vagas em cursos gratuitos como forma de contribuição.
- Área exclusiva para doadores educacionais e listagem organizada de cursos por categoria.
- Integração com plataformas externas de conteúdo (ex: YouTube, Coursera).
- Classificação clara dos tipos de doações: financeira, material ou educacional.

### 🧑‍🦯 Acessibilidade Digital
- Compatibilidade aprimorada com leitores de tela (utilizando WAI-ARIA).
- Navegação fluida via teclado.
- Alto contraste visual para melhor legibilidade.
- Comandos de voz para navegação (status: experimental).
- Tradução automática dos conteúdos da plataforma (integrado com Google Cloud Translate).

### 🧠 Inteligência Artificial e Cloud
- Sistema de recomendação de cursos e campanhas personalizado com base no perfil e histórico do usuário (utilizando Firebase ML).
- Chatbot inteligente para responder dúvidas sobre serviços da plataforma e fornecer orientações sobre capacitação digital (utilizando Dialogflow).
- Análise de impacto social em real-time com dashboards e insights (utilizando BigQuery e Cloud Functions; 

## 🛠️ Tecnologias Utilizadas

**Frontend:**
-   **Framework:** React
-   **Routing:** Wouter
-   **State Management/Data Fetching:** TanStack Query
-   **UI Components:** Shadcn UI (built on Radix UI)
-   **Styling:** Tailwind CSS (`tailwindcss-animate`, `@tailwindcss/typography`)
-   **Animations:** Framer Motion
-   **Date Handling:** date-fns, React Day Picker
-   **Forms & Validation:** React Hook Form, Zod, @hookform/resolvers
-   **Icons:** Lucide React, React Icons
-   **Charts:** Recharts
-   **QR Scanning:** @yudiel/react-qr-scanner
-   **Other UI:** embla-carousel-react, input-otp, react-resizable-panels, vaul

**Backend:**
-   **Framework:** Express
-   **Authentication:** Passport.js (Local Strategy), `crypto` (for password hashing)
-   **Session Management:** express-session, memorystore (in-memory session store)
-   **Database (Planned/Configured):** PostgreSQL (implied by Drizzle config), Neon Database (@neondatabase/serverless)
-   **ORM (Planned/Configured):** Drizzle ORM (`drizzle-kit`, `drizzle-zod`)
-   **Environment Variables:** dotenv
-   **Utilities:** uuid, qrcode
-   **API Interaction (partial):** Supabase JS (used directly in some routes in `server/index.ts`)
-   **WebSockets (implied by dependency):** ws (likely for real-time features, though not explicitly shown in the provided server logic)

**Build & Development Tools:**
-   TypeScript
-   Vite (@vitejs/plugin-react, @replit/vite-plugin-shadcn-theme-json, @replit/vite-plugin-cartographer, @replit/vite-plugin-runtime-error-modal)
-   tsx (for running TypeScript files directly)
-   esbuild (for backend bundling)
-   autoprefixer, postcss

## 📈 Impacto Social Esperado

-   Ampliação significativa do acesso à educação digital para populações carentes.
-   Inclusão efetiva de comunidades vulneráveis, idosos e pessoas com deficiência no ambiente digital.
-   Fortalecimento da cultura de doação e engajamento em responsabilidade social empresarial.
-   Fornecimento de dados reais sobre o impacto das ações no combate à exclusão digital, especialmente entre idosos.

## ✅ Alinhamento com o Tema do Hackathon (Responsabilidade Social e Acessibilidade Digital)

O projeto Sou Solidário aborda integralmente os critérios propostos pelo Hackathon:

1.  **Inclusão Social:** Foco em comunidades carentes. ✅
2.  **Acessibilidade:** Desenvolvimento pensando em pessoas com deficiência. ✅
3.  **Combate à Exclusão Digital:** Ações direcionadas, com destaque para idosos. ✅
4.  **Educação Digital:** Oferta de cursos e capacitação para populações vulneráveis. ✅

## 🌱 Potencial do Projeto

Com uma base tecnológica robusta (visando a integração com GCP/AI) e um propósito social claro e forte, o Sou Solidário demonstra grande potencial para escalabilidade e para gerar um impacto social real e positivo em larga escala.

## 💰 Potencial de Monetização e Sustentabilidade

Para garantir a continuidade e escalabilidade do projeto Sou Solidário, exploramos modelos de monetização que possam cobrir custos operacionais (infraestrutura de cloud, desenvolvimento, marketing, etc.) e, idealmente, gerar excedente para ser reinvestido nas próprias ações sociais e iniciativas de acessibilidade digital.

As formas de monetização consideradas incluem:

1.  **Taxa Mínima sobre Doações Financeiras:**
    *   Um modelo potencial é aplicar uma pequena taxa percentual ou fixa sobre as doações financeiras realizadas através da plataforma.
    *   Esta taxa seria claramente informada ao doador antes da conclusão da transação, garantindo total transparência.
    *   A implementação dependeria da integração com **APIs de Gateways de Pagamento** seguros e confiáveis, como:
        *   **Stripe:** Amplamente utilizado globalmente, oferece processamento de pagamentos via cartão de crédito, PIX (em alguns mercados) e outros métodos.
        *   **PayPal:** Plataforma popular para pagamentos online.
        *   **PagSeguro / Mercado Pago:** Soluções robustas e populares no Brasil, com diversas opções de pagamento (PIX, boleto, cartão).
        *   **Integrações Bancárias Diretas:** Possibilidade de integrar diretamente com APIs bancárias para transferências e depósitos.
    *   A receita gerada por esta taxa ajudaria a subsidiar a infraestrutura e os custos de desenvolvimento e manutenção da plataforma, permitindo que as doações de itens e as funcionalidades de acessibilidade e educação digital permaneçam gratuitas.

2.  **Publicidade Não Intrusiva e Conteúdo Patrocinado:**
    *   Outra fonte de receita pode vir da exibição de anúncios e conteúdos patrocinados dentro da plataforma.
    *   Para manter o foco social e a experiência do usuário positiva, esta publicidade seria cuidadosamente gerenciada para ser o menos intrusiva possível, possivelmente em formatos como banners discretos ou cards de "Campanhas em Destaque Patrocinadas".
    *   Empresas parceiras ou interessadas em Responsabilidade Social poderiam patrocinar campanhas específicas, seções do site (ex: seção de cursos), ou ter sua marca exibida de forma contextualizada.
    *   Este modelo requer integração com plataformas de anúncios (como Google AdSense para anúncios gerais, ou acordos diretos para patrocínios específicos), garantindo que o conteúdo publicitário esteja alinhado com os valores do projeto e não seja enganoso ou inapropriado.

A busca por sustentabilidade financeira é essencial para a longevidade e o impacto do Sou Solidário, sempre mantendo a prioridade na missão de conectar e apoiar quem mais precisa, com transparência e respeito aos doadores e beneficiados.

---

## 💻 Configuração e Execução Local

Para configurar e rodar o projeto Sou Solidário localmente, siga os passos abaixo:

**Pré-requisitos:**

*   Node.js (versão 18 ou superior é recomendada com base nos `engines` de algumas dependências) e npm (ou yarn/pnpm).
*   Git (para clonar o repositório, se aplicável, embora você tenha um arquivo zip).


## 💻 Configuração e Execução Local (Modo em Memória)

Para configurar e rodar o frontend e backend do projeto Sou Solidário **localmente, utilizando armazenamento em memória (não persistente)**, siga os passos abaixo. Este modo é ideal para testes rápidos e visualização do aplicativo sem a necessidade de configurar um banco de dados externo.

**Atenção:** Neste modo, todos os dados (usuários, campanhas, doações, etc.) serão armazenados apenas na memória enquanto o servidor estiver rodando. **Os dados serão perdidos ao encerrar o servidor.**

**Passo a Passo:**

1.  **Obtenha o Código:**
    *   Certifique-se de que você possui o arquivo `Sou-Solidario.zip`.
    *   Crie uma pasta onde deseja extrair o projeto.
    *   Extraia o conteúdo do arquivo zip para esta pasta.
        ```bash
        unzip Sou-Solidario.zip -d ./sou-solidario
        ```
    *   Navegue até o diretório que contém o `package.json`. Provavelmente será uma subpasta após a extração do zip.
        ```bash
        cd ./sou-solidario-project/Sou-Solidario # Ajuste o caminho se necessário
        ```

2.  **Instale as Dependências:**
    *   Dentro do diretório do projeto, instale todas as dependências necessárias:
        ```bash
        npm install # ou yarn install ou pnpm install
        ```

3. **Execute o Projeto:**
    *   Utilize o script de desenvolvimento, que iniciará o servidor backend e o servidor de desenvolvimento do frontend (Vite):
        ```bash
        npm run dev # ou yarn dev ou pnpm dev
        ```
    *   O terminal mostrará mensagens indicando que o servidor Express e o servidor Vite estão iniciando. Ele informará o endereço local onde a aplicação estará disponível (geralmente `http://localhost:5000`).
  
4.  **Acesse a Aplicação:**
    *   Abra seu navegador e acesse o endereço fornecido no terminal (ex: `http://localhost:5000`).
    *   A aplicação frontend será carregada, e as chamadas para a API (`/api/...`) serão processadas pelo servidor Express que está rodando localmente, utilizando os dados armazenados temporariamente na memória.

**Limitações deste Modo de Execução:**

*   **Dados Não Persistentes:** Todas as alterações e cadastros feitos na aplicação (novos usuários, campanhas, doações) serão perdidos ao parar e reiniciar o servidor.





















1.  **Obtenha o Código:**
    *   Certifique-se de que você possui o arquivo `Sou-Solidario-copia.zip`.
    *   Crie uma pasta onde deseja extrair o projeto.
    *   Extraia o conteúdo do arquivo zip para esta pasta.
        ```bash
        unzip Sou-Solidario-copia.zip -d ./sou-solidario-project
        ```
    *   Navegue até o diretório do projeto extraído:
        ```bash
        cd sou-solidario-project/Sou-Solidario - cópia # O nome da pasta pode variar dependendo da extração
        ```
        *(Verifique o conteúdo da pasta extraída e ajuste o comando `cd` se necessário. Procure pelo arquivo `package.json`).*

2.  **Configure as Variáveis de Ambiente:**
    *   Crie um arquivo chamado `.env` na raiz do diretório do projeto (`Sou-Solidario - cópia/`).
    *   Adicione as seguintes variáveis:
        ```env
        DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require" # Substitua pela URL do seu banco de dados PostgreSQL
        SESSION_SECRET="sua_chave_secreta_aleatoria_para_sessao" # Substitua por uma string longa e aleatória
        SUPABASE_URL="your_supabase_url" # Necessário para algumas rotas de API nos snippets
        SUPABASE_KEY="your_supabase_anon_key" # Necessário para algumas rotas de API nos snippets
        ```
    *   **Importante:** A URL do `DATABASE_URL` é usada pelo Drizzle Kit (`drizzle.config.ts`) para gerenciar o schema do banco de dados. O `SESSION_SECRET` é usado para criptografar as sessões de usuário no backend. Os valores `SUPABASE_URL` e `SUPABASE_KEY` são necessários para que as rotas que interagem com o Supabase em `server/index.ts` funcionem, mesmo que o core do auth/storage nos outros arquivos use memória.

3.  **Configuração do Banco de Dados (via Drizzle Kit):**
    *   Certifique-se de que seu banco de dados PostgreSQL está rodando e acessível via a `DATABASE_URL` definida no `.env`.
    *   Execute o comando para "empurrar" (push) o schema definido em `./shared/schema.ts` para o banco de dados.
        ```bash
        npm run db:push # ou yarn db:push ou pnpm db:push
        ```
        *Este comando criará as tabelas `users`, `campaigns`, `categories`, `neededItems`, `donations`, `donationItems`, `financialDonations` no seu banco de dados PostgreSQL.*

4.  **Instale as Dependências:**
    *   Dentro do diretório do projeto (`Sou-Solidario - cópia/`), instale as dependências do frontend e backend:
        ```bash
        npm install # ou yarn install ou pnpm install
        ```
    *   Se a instalação falhar em alguma dependência opcional (como `bufferutil`), geralmente é seguro ignorar, a menos que o projeto utilize intensivamente funcionalidades que dependem dela.

5.  **Execute o Projeto Localmente:**
    *   Utilize o script de desenvolvimento:
        ```bash
        npm run dev # ou yarn dev ou pnpm dev
        ```
    *   Este comando, definido no `package.json` como `"dev": "tsx server/index.ts"`, fará o seguinte:
        *   Executará o arquivo `server/index.ts` usando `tsx` (que permite rodar arquivos TypeScript diretamente).
        *   `server/index.ts` configurará o middleware do Vite (`setupVite`) para servir e recarregar o frontend (`client/`).
        *   O servidor Express iniciará na porta 5000 (conforme `server/index.ts`).

6.  **Acesse a Aplicação:**
    *   Abra seu navegador e acesse `http://localhost:5000`.
    *   O frontend (aplicativo React) será servido, e as chamadas de API serão direcionadas para o mesmo servidor Express na porta 5000.

**Notas Importantes:**

*   **Armazenamento de Dados:** Conforme análise do código, a maior parte dos dados (usuários, campanhas, doações, etc.) é armazenada **apenas em memória** (`server/storage.ts: MemStorage`) durante a execução do script `npm run dev`. Isso significa que **todos os dados serão perdidos** ao reiniciar o servidor. A configuração do Drizzle e do PostgreSQL (`drizzle.config.ts`, `db:push`) parece ser para uma implementação de banco de dados que *não está totalmente integrada* nos snippets do servidor principal fornecido (`server/index.ts`, `server/routes.ts`, `server/auth.ts`). Para uma persistência real, seria necessário integrar o Drizzle ORM ao Express/Passport/etc. no backend.
*   **Supabase vs Memory Store:** Há rotas em `server/index.ts` que usam `supabase` diretamente, enquanto a maioria das rotas de doação/campanha em `server/routes.ts` usam a `MemStorage`. O script `npm run dev` *aparentemente* roda apenas o `server/index.ts` e a lógica do Vite, o que significa que a maioria das funcionalidades de campanha/doação (que parecem estar em `server/routes.ts` usando a MemStorage) *não estarão disponíveis* ao rodar com `npm run dev` conforme configurado no `package.json`. Pode ser necessário ajustar o script `dev` ou `server/index.ts` para importar e usar as rotas definidas em `server/routes.ts`. A rota `/api/admin/empresas-campanhas` está definida tanto em `server/index.ts` (usando Supabase) quanto em `server/admin.ts` (usando Hono/Supabase e uma porta diferente - 3000), sugerindo que `server/admin.ts` é um painel separado.
*   **Autenticação:** A autenticação implementada nos snippets (`server/auth.ts`) utiliza Passport.js com estratégia local e armazena usuários/sessões na `MemStorage`, não no Firebase Auth como mencionado na visão.
*   **Funcionalidades de AI/Cloud:** As funcionalidades mais avançadas de AI e Cloud mencionadas na visão (Firebase ML, Dialogflow, BigQuery, Cloud Functions) parecem ser apenas conceituais para o Hackathon e não estão implementadas nos snippets de código fornecidos.
*   **Imagens de Exemplo:** As imagens usadas (`/assets/porto_alegre.jpeg`, `/assets/petropolis.jpeg`, etc.) são servidas diretamente da pasta `client/src/assets/images` via uma rota estática em `server/routes.ts`. Se a lógica de rotas em `server/routes.ts` não for carregada pelo `server/index.ts`, estas imagens podem não ser encontradas. A imagem do QR Code PIX (`qr-code-pix.png`) é carregada diretamente no frontend (`client/src/pages/donation/financial-donation.tsx`) e precisa estar no caminho `client/src/assets/images/`.

## 📄 Licença

MIT

## 🧑‍💻 Equipe

(Liste aqui os nomes dos membros da equipe que participaram do Hackathon)