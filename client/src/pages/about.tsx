
import { text } from "express";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Sobre o Sou Solidário</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold text-primary-dark mb-4">
          Solidariedade, Inclusão e Capacitação para um Impacto Social Real!
        </h2>
        
        <p className="mb-4">
          Olá a todos! Meu nome é Assis Berlanda de Medeiros, estudante de Engenharia de Software na Unicesumar e motivado por um curso em Google Cloud e AI, busquei criar uma plataforma que fosse além da Responsabilidade Social e Acessibilidade Digital. O projeto <strong><em>Sou Solidário</em></strong> foi concebido em 2024 e adaptado no contexto do <strong><em>Hackathon Unicesumar</em></strong> como uma resposta prática e inovadora aos desafios sociais urgentes, após a tragédia da enchente no Rio Grande do Sul <a href="https://www.cnnbrasil.com.br/nacional/sul/rs/alagamentos-destruicao-e-183-mortes-relembre-a-tragedia-das-chuvas-no-rs-que-marcou-2024/" target="_blank">veja aqui</a>
, que devastou a cidade e destruiu famílias.
        </p>

        <p className="mb-4">
          Pois naquela época a recente enchente em Porto Alegre mobilizou pessoas em todo o país dispostas a ajudar as vítimas. Doações foram solicitadas por diversos meios, mas nem sempre era fácil contribuir. A falta de tempo, o esquecimento e a dificuldade em levar as doações até os pontos de coleta foram obstáculos comuns. Um exemplo disso foi o carro de som que passou pelo meu condomínio pedindo doações. A idéia de contribuir era ótima, mas a correria do dia a dia e a dúvida sobre o que doar naquele momento me impediram de ajudar.
        </p>

        <p className="mb-4">
          Pensando nisso eu tive a idéia de desenvolver um protótipo de um aplicativo que facilitasse o processo de doação. Que pudesse ajudar as pessoas nessas situações. Com ele será possível:
        </p>

        <ul className="list-disc pl-6 mb-4">
          <li>Conhecer as necessidades específicas das vítimas: O app informaria quais itens são mais urgentes, evitando doações inadequadas.</li>
          <li>Agendar a coleta das doações em casa: Eliminando a necessidade de deslocamento a pontos de coletas e otimizando o tempo.</li>
          <li>Fazer doações em dinheiro de forma segura: Oferecendo uma opção prática para quem prefere contribuir financeiramente, se assim for de interesse.</li>
        </ul>

        <p className="mb-4">
          Entendemos a Responsabilidade Social de forma mais ampla: não apenas reagir a crises, mas também construir com um futuro mais equitativo. Por isso, o <strong>Sou Solidário</strong> se propõe a ser um ecossistema digital que facilita a ajuda humanitária e promove a inclusão digital e a capacitação para populações vulneráveis.
        </p>

        <h3 className="text-xl font-semibold text-primary-dark mb-3">Sobre o App SouSolidário</h3>
        <p>
          <ul className="list-disc pl-6 mb-4">
          <li><strong>Educação Solidária como Alavanca de Inclusão:</strong> Reconhecendo o poder da educação para a transformação social, o <strong>Sou Solidário</strong> integra uma área dedicada à Educação Solidária. Empresas e instituições podem doar <strong>cursos gratuitos</strong> online, criando um acervo acessível por categoria. Esta iniciativa visa combater a exclusão digital e capacitar indivíduos em comunidades carentes, idosos e pessoas com deficiência, um componente vital de nossa responsabilidade social de longo prazo.</li>
          <li><strong>Acessibilidade Digital como Princípio Fundamental:</strong> Desde a concepção, a Acessibilidade Digital é tratada como um requisito essencial, não um adicional. A plataforma é desenvolvida buscando compatibilidade total com leitores de tela (WAI-ARIA), navegação por teclado e opções de alto contraste visual. A futura integração de comandos de voz e tradução automática (Google Cloud Translate) são passos para garantir que o Sou Solidário seja verdadeiramente utilizável por todos, independentemente de suas capacidades ou localização, reforçando nosso compromisso com a inclusão.</li>
          <li><strong>Inteligência Artificial para Otimizar o Impacto:</strong> Utilizamos (ou propomos utilizar) tecnologias de <strong>Google Cloud Computing e IA</strong> para otimizar a plataforma. Isso inclui recomendações personalizadas de campanhas/cursos (Firebase ML), um chatbot de suporte inteligente (Dialogflow) para auxiliar doadores e beneficiados, e análises em tempo real do impacto social (BigQuery/Cloud Functions), fornecendo dados concretos para direcionar esforços e medir resultados.</li>
        </ul>
        </p>
        <p>
          Ao alinhar-se perfeitamente com os temas do <strong>Hackathon – Responsabilidade
Social e Acessibilidade Digital</strong> – o Sou Solidário demonstra um potencial significativo para ir além da resposta emergencial, construindo uma comunidade mais forte, inclusiva e capacitada. Com um propósito social claro e o uso estratégico da tecnologia, buscamos gerar um impacto real e duradouro.
        </p>
        <p>
          As funcionalidades do <strong>Sou Solidário</strong> refletem todos estes compromissos.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
