// client/src/pages/home.tsx

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Importar componentes do Carrossel
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { Campaign } from "@shared/schema"; // Importar tipo Campaign
// Importar ícones necessários
import { ArrowRight, Droplet, Home as HomeIcon, Heart, Clock, MapPin, Search } from "lucide-react"; // Adicionado HomeIcon
// Importe useAuth corretamente (assumindo que está em use-auth.tsx)
import { useAuth } from "@/hooks/use-auth"; // <-- Importação corrigida

const HomePage = () => {
  // Usa useAuth apenas para obter o usuário se necessário, mas a página home é pública
  const { user } = useAuth(); // Pode ser útil no futuro para personalizar algo

  // Buscar campanhas usando TanStack Query
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
     // O backend MemStorage.getCampaigns() retorna todas. Filtramos por active no frontend.
  });

    // Função auxiliar para obter a lista de URLs de imagem (copiada/mantida aqui para a aba específica)
    const getImageUrls = (campaign: Campaign): string[] => {
         // TODO: backend deve retornar imageUrls: string[] ou { imageUrl: string, imageUrls?: string[] }
        if ((campaign as any).imageUrls && Array.isArray((campaign as any).imageUrls) && (campaign as any).imageUrls.length > 0) {
            return (campaign as any).imageUrls; // Usa array se existir e não for vazio
        }
        if (campaign.imageUrl) {
            return [campaign.imageUrl]; // Retorna a única URL em um array para o carrossel
        }
        return []; // Retorna array vazio se nenhuma imagem
    };

   // Função auxiliar para determinar o ícone da campanha (opcional)
    const getCampaignIcon = (campaign: Campaign) => {
        if (campaign.title?.toLowerCase().includes("enchente")) {
          return <Droplet className="h-6 w-6" />;
        } else if (campaign.title?.toLowerCase().includes("reconstrução")) {
          return <HomeIcon className="h-6 w-6" />;
        } else {
          return <Heart className="h-6 w-6" />;
        }
    };


  return (
    // Container principal da página Home
    <div className="container mx-auto px-4 py-6">

      {/* Hero Section */}
       <section className="relative rounded-xl mb-12 overflow-hidden min-h-[100px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          {/* Caminho da imagem de background - verificar se está correto */}
          {/* Assumindo que /client/src/assets/images é servido estaticamente em /assets */}
          <img
            src="/assets/background.jpeg" // <-- Ajustado caminho para /assets
            alt="Ajuda humanitária"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-[#1eaa70]/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ajude quem mais precisa em momentos de crise
          </h1>
          <p className="text-lg mb-8 text-white/90">
            A plataforma Sou Solidário conecta pessoas que desejam ajudar com vítimas de desastres naturais em situações de emergência ou inclusão digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Link para iniciar o processo de doação */}
            <Link href="/doar/selecionar-campanha">
              <Button className="btn-compassion font-semibold px-6 py-3 h-auto text-base">
                Quero Doar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {/* Botão "Ver Campanhas" removido do Hero, agora acessível na aba */}
          </div>
        </div>
      </section>


      {/* Tabs Section */}
      <Tabs defaultValue="fazer-doacao" className="mb-12">
        {/* Lista de abas */}
        <TabsList className="mb-6 border-b border-gray-200 w-full justify-start">
          <TabsTrigger value="fazer-doacao" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Fazer Doação
          </TabsTrigger>
          <TabsTrigger value="campanhas-ativas" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Campanhas Ativas
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba "Fazer Doação" */}
        <TabsContent value="fazer-doacao">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-4">Processo de Doação</h2>

              {/* Step Indicator (simplificado, pois o fluxo completo é em outras páginas) */}
              {/* Você pode manter um indicador visual aqui para as etapas principais */}
               <div className="flex justify-between mb-8 relative">
                <div className="w-full absolute top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

                {["Campanha", "Itens", "Dados", "Agendar", "Confirmar"].map( // Nomes mais curtos para caber
                  (step, index) => (
                    <div key={index} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${ // Tamanho menor para texto no círculo
                          index === 0
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 font-medium text-center max-w-[60px] whitespace-normal">{step}</span> {/* Quebra de linha para nomes longos */}
                    </div>
                  )
                )}
              </div>


              <h3 className="text-xl font-heading font-semibold mb-4">Selecione uma campanha para doar</h3>

              {/* Lista das primeiras campanhas para seleção rápida */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {isLoading ? (
                  // Skeleton loading
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="flex items-start">
                        <div className="bg-gray-200 h-12 w-12 rounded-lg mr-4"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : campaigns && campaigns.filter(camp => camp.active).length > 0 ? ( // Filtra apenas ativas para esta seção
                  campaigns.filter(camp => camp.active).slice(0, 2).map((campaign) => ( // Exibe apenas as 2 primeiras
                    <Link key={campaign.id} href={`/campanha/${campaign.id}`}>
                      <a className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer p-4">
                        <div className="flex items-start">
                          {/* Ícone da Campanha */}
                           <div className={`${campaign.urgent ? 'bg-compassion-light text-[#e86c00]' : 'bg-hope-light text-[#1eaa70]'} p-3 rounded-lg mr-4`}>
                            {getCampaignIcon(campaign)} {/* Usa a função auxiliar para ícone */}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-heading font-bold text-lg">{campaign.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{campaign.description}</p> {/* Limita descrição */}
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{campaign.location}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-primary flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {/* Formatar data (ajustar conforme o tipo de endDate do backend/storage) */}
                                <span>Até {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('pt-BR') : 'Data indefinida'}</span> {/* Adicionado check para data */}
                              </span>
                              <span className="text-sm font-medium text-secondary hover:text-secondary-dark">
                                Ver detalhes
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-gray-500">
                    Nenhuma campanha ativa encontrada.
                  </p>
                )}
              </div>

             {/* Botão para ver todas as campanhas de doação (link para a lista completa) */}
             <div className="text-center mt-6">
                 <Link href="/campanhas">
                     <Button variant="outline">
                        Ver Todas as Campanhas para Doar
                        <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                 </Link>
             </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da aba "Campanhas Ativas" com Carrossel */}
        <TabsContent value="campanhas-ativas">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-neutral-dark">Campanhas em Destaque</h2> {/* Título ajustado */}
               {/* Botão para ver todas as campanhas - Redireciona para /campanhas */}
               <Link href="/campanhas">
                  <Button variant="link" className="text-primary">
                    Ver Todas
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
               </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {isLoading ? (
                // Skeleton loading
                [...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                      {/* <div className="flex gap-2 mb-4"> // Removido se não usar botões */}
                      {/*   <div className="h-6 bg-gray-200 rounded w-16"></div> */}
                      {/*   <div className="h-6 bg-gray-200 rounded w-16"></div> */}
                      {/* </div> */}
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : campaigns && campaigns.filter(camp => camp.active).length > 0 ? ( // Filtra apenas ativas
                campaigns.filter(camp => camp.active).map((campaign) => { // Mapeia campanhas ativas
                   const imageUrls = getImageUrls(campaign); // Obtém URLs
                  return (
                    <Link key={campaign.id} href={`/campanha/${campaign.id}`}>
                      <Card className="overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                        {/* Área do Carrossel/Imagem */}
                         <div className="relative bg-gray-100 h-40 mb-12"> {/* Container relativo */}
                            {imageUrls.length > 0 ? (
                               <Carousel className="w-full h-full"> {/* Carrossel ocupa todo o espaço */}
                                   <CarouselContent className="h-full"> {/* Conteúdo ocupa toda a altura */}
                                       {imageUrls.map((url, index) => (
                                           <CarouselItem key={index} className="h-full"> {/* Item ocupa toda a altura */}
                                               <div className="flex items-center justify-center h-full">
                                                   <img
                                                       src={url}
                                                       alt={`Imagem ${index + 1} da campanha ${campaign.title}`}
                                                       className="w-full h-full object-cover" // Imagem cobre o item do carrossel
                                                   />
                                               </div>
                                           </CarouselItem>
                                       ))}
                                   </CarouselContent>
                                    {/* Botões de navegação do Carrossel */}
                                    {imageUrls.length > 1 && ( // Mostra botões apenas se tiver mais de 1 imagem
                                        <>
                                            <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 absolute" /> {/* Posiciona botões */}
                                            <CarouselNext className="right-4 top-1/2 -translate-y-1/2 absolute" />
                                        </>
                                    )}
                               </Carousel>
                            ) : (
                               // Placeholder se sem imagens
                               <div className="flex items-center justify-center h-full text-gray-500">
                                   Sem imagem disponível
                               </div>
                            )}
                             {campaign.urgent && (
                                <div className="absolute top-2 left-2 m-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10"> {/* Ajustado z-index */}
                                  URGENTE
                                </div>
                             )}
                         </div>

                        {/* Conteúdo do Card */}
                        <CardContent className="p-4">
                          <h4 className="font-heading font-bold text-lg">{campaign.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {campaign.description}
                          </p>

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{campaign.location}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            {/* Formatar data (ajustar conforme o tipo de endDate do backend/storage) */}
                            <span>Até {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('pt-BR') : 'Data indefinida'}</span> {/* Adicionado check para data */}
                          </div>

                          <div className="w-full flex">
                            <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition">
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              ) : (
                <p className="col-span-3 text-center text-gray-500">
                  Nenhuma campanha ativa encontrada. Tente novamente mais tarde.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* How it Works Section */}
       <section className="mb-12">
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-hope-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-hope" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">1. Escolha uma Campanha</h3>
              <p className="text-gray-600 text-sm">
                Navegue pelas campanhas ativas.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-compassion-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-compassion" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">2. Selecione Itens para Doar</h3>
              <p className="text-gray-600 text-sm">
                Escolha entre os itens necessários e informe a quantidade que você pode doar.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-peace-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-peace" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">3. Agende a Coleta</h3>
              <p className="text-gray-600 text-sm">
                Informe seus dados e agende uma data para que a doação seja coletada em seu endereço.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* CTA Section */}
       <section className="relative bg-[#64b5f6] rounded-xl p-8 text-white text-center overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#64b5f6] to-[#4a98db] opacity-80"></div>
        <div className="absolute inset-0 z-0 opacity-20">
           {/* Caminho da imagem de background - verificar se está correto */}
          <img
            src="/client/src/assets/images/background.jpeg" // <-- Verificar caminho correto para assets servidos estaticamente
            alt="Ajuda humanitária"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-heading font-bold mb-4 text-white drop-shadow-md">
            Faça a diferença hoje mesmo!
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-white drop-shadow-md">
            Sua doação pode transformar a vida de pessoas afetadas por desastres naturais,  emergências ou permitir que uma pessoa tenha um impacto social com a acessibilidade digital.
            Não importa o tamanho da sua contribuição, cada item doado tem um impacto significativo.
          </p>
          <Link href="/campanhas">
            <Button className="btn-compassion px-6 py-3 h-auto text-base font-semibold">
              Quero Doar Agora
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;