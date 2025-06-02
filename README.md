# 🤝 Sou Solidário

Olá a todos! Meu nome é Assis Berlanda de Medeiros, estudante de Engenharia de Software na Unicesumar e motivado por um curso em Google Cloud e AI, busquei criar uma plataforma que fosse além da Responsabilidade Social e Acessibilidade Digital.

## 🎯 Visão Geral

O **Sou Solidário** é uma plataforma digital responsiva concebida durante um projeto pessoal em maio de 2024 e adaptado ao **Hackathon Unicesumar** como uma resposta prática e inovadora aos desafios sociais urgentes, após a tragédia da enchente no Rio Grande do Sul [veja aqui](https://www.cnnbrasil.com.br/nacional/sul/rs/alagamentos-destruicao-e-183-mortes-relembre-a-tragedia-das-chuvas-no-rs-que-marcou-2024/), que devastou a cidade e destruiu famílias. Com o objetivo de conectar doadores à Campanhas Humanitárias e Ações Sociais. O projeto foca no Tema 01: Responsabilidade Social e Acessibilidade Digital, propondo a utilização de tecnologias de Google Cloud Computing e Inteligência Artificial para promover inclusão digital, acessibilidade e capacitação para populações vulneráveis. 

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
-   **UI Components:** Shadcn UI (desenvolvido com Radix UI)
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
-   **Authentication:** Passport.js (Estratégia Local), `crypto` (para hash de senha)
-   **Session Management:** express-session, memorystore (armazenamento de sessão na memória)
-   **Database (Planned/Configured):** PostgreSQL (implícito na configuração do Drizzle), Neon Database (@neondatabase/serverless) # Não usado no Localhost
-   **ORM (Planned/Configured):** Drizzle ORM (`drizzle-kit`, `drizzle-zod`)
-   **Environment Variables:** dotenv
-   **Utilities:** uuid, qrcode
-   **API Interaction (parcial):** Supabase JS (usado diretamente em algumas rotas em `server/index.ts`, para uso futuro)
-   **WebSockets (implícito pela dependência):** ws (provavelmente para recursos em tempo real, embora não explicitamente mostrado na lógica do servidor fornecida)

**Ferramentas de construção e desenvolvimento:**
-   TypeScript
-   Vite (@vitejs/plugin-react, @replit/vite-plugin-shadcn-theme-json, @replit/vite-plugin-cartographer, @replit/vite-plugin-runtime-error-modal)
-   tsx (para executar arquivos TypeScript diretamente)
-   esbuild (para empacotamento de backend)
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
    * Instalar a biblioteca multer
        ```bash
        npm install multer # OU 
        yarn add multer # OU
        pnpm add multer
        npm install --save-dev @types/multer

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