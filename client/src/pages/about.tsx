
import { text } from "express";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Sobre o Sou Solidário</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold text-primary-dark mb-4">
          Solidariedade em tempo de crise. Ajudando quem precisa com um toque!
        </h2>
        
        <p className="mb-4">
          Olá a todos! Meu nome é Assis Berlanda de Medeiros, estou me formando em Engenharia de Software pela Unicesumar, e após alguns cursos e projetos, em abril de 2024, finalizei um curso livre pela Alura de Google AI e havia um desafio de projeto para que eu criasse um aplicativo que tivesse um impacto social e resolvesse um problema iminente. E naquele mesmo mês havia acontecido a tragédia da enchente no Rio Grande do Sul <a href="https://www.cnnbrasil.com.br/nacional/sul/rs/alagamentos-destruicao-e-183-mortes-relembre-a-tragedia-das-chuvas-no-rs-que-marcou-2024/" target="_blank">veja aqui</a>
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
          Com um aplicativo como esse, a solidariedade se torna mais acessível, permitindo que mais pessoas ajudem de forma prática e eficiente.
        </p>

        <h3 className="text-xl font-semibold text-primary-dark mb-3">Sobre o App SouSolidário</h3>
        <p>
          O aplicativo "Sou Solidario" surge como uma solução eficiente para conectar doadores e instituições que apoiam vítimas de desastres ou pessoas em situação de emergências.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
