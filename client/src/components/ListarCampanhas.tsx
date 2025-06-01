// client/src/components/ListarCampanhas.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter"; // Importar Link para navegação
// Importar componentes UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Heart, Droplet, Home as HomeIcon } from "lucide-react"; // Ícones
// Importar componentes do Carrossel
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious, // Botão "Anterior"
  CarouselNext,     // Botão "Próximo"
} from "@/components/ui/carousel";

// Importar tipo Campaign
import { Campaign } from "@shared/schema";

// Definir o tipo para a campanha na listagem (com campos do backend)
interface CampanhaListData extends Campaign {
    // No backend atual (MemStorage), a imagem é 'imageUrl'.
    // Se o backend for atualizado para array, pode ser 'imageUrls'.
    // Adicionamos aqui para compatibilidade visual no frontend.
    // imageUrls?: string[]; // Mantido como comentário se o backend não retornar explicitamente assim
}


export default function ListarCampanhas() {
  // Hooks
  const [searchTerm, setSearchTerm] = useState("");
  // Buscar campanhas usando TanStack Query
  const { data: campaigns, isLoading } = useQuery<CampanhaListData[]>({
    queryKey: ["/api/campaigns"], // Endpoint para buscar todas as campanhas
  });

  // Filtragem de campanhas (por título, descrição ou local)
  const filteredCampaigns = campaigns?.filter(campaign =>
    (campaign.title?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || // Usa nullish coalescing para segurança
    (campaign.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (campaign.location?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  // Função auxiliar para obter a lista de URLs de imagem para o carrossel
  const getImageUrls = (campaign: CampanhaListData): string[] => {
      // Assume que o backend retorna 'imageUrl' para a imagem principal.
      // Se você atualizar o backend para retornar um array 'imageUrls', use campaign.imageUrls.
      // Por enquanto, colocamos a única URL em um array.
      if ((campaign as any).imageUrls && Array.isArray((campaign as any).imageUrls) && (campaign as any).imageUrls.length > 0) {
          return (campaign as any).imageUrls; // Usa array se existir e não for vazio
      }
      if (campaign.imageUrl) {
          return [campaign.imageUrl]; // Retorna a única URL em um array se existir
      }
      return []; // Retorna array vazio se nenhuma imagem
  };

   // Função auxiliar para determinar o ícone da campanha (opcional, para consistência visual)
    const getCampaignIcon = (campaign: CampanhaListData) => {
        if (campaign.title?.toLowerCase().includes("enchente")) {
          return <Droplet className="h-6 w-6" />;
        } else if (campaign.title?.toLowerCase().includes("reconstrução")) {
          return <HomeIcon className="h-6 w-6" />;
        } else {
          return <Heart className="h-6 w-6" />;
        }
    };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Exibe mensagem se não houver campanhas carregadas
    if (!campaigns || campaigns.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CardContent className="p-0 space-y-4">
            <p className="text-xl text-gray-600">Não existem campanhas ativas no momento.</p>
            <p className="text-gray-500">Aguarde novas campanhas serem cadastradas.</p>
          </CardContent>
        </Card>
      );
    }

    // Exibe mensagem se a busca não encontrar resultados
    if (filteredCampaigns?.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CardContent className="p-0 space-y-4">
            <p className="text-xl text-gray-600">Nenhuma campanha encontrada com este termo.</p>
            <p className="text-gray-500">Tente usar outras palavras na sua busca.</p>
          </CardContent>
        </Card>
      );
    }

    // Renderiza a lista de campanhas filtradas com cards e carrossel
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredCampaigns?.map((campaign) => {
             const imageUrls = getImageUrls(campaign); // Obtém as URLs para o carrossel
             return (
               <Card key={campaign.id} className="overflow-hidden shadow-sm hover:shadow-md transition">
                 {/* Área do Carrossel/Imagem */}
                 <div className="relative bg-gray-100 h-48"> {/* Container relativo para posicionar botões do carrossel */}
                    {imageUrls.length > 0 ? (
                       // --- Adicionar Carrossel ---
                       <Carousel className="w-full h-full"> {/* O carrossel ocupa todo o espaço do container */}
                           <CarouselContent className="h-full">
                               {imageUrls.map((url, index) => (
                                   <CarouselItem key={index} className="h-full">
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
                           {/* Botões de navegação do carrossel */}
                            {imageUrls.length > 1 && ( // Mostra botões apenas se tiver mais de 1 imagem
                                <>
                                    <CarouselPrevious className="left-4" /> {/* Posiciona botões dentro do container relativo */}
                                    <CarouselNext className="right-4" />
                                </>
                            )}
                       </Carousel>
                       // --- Fim Carrossel ---
                    ) : (
                       // Placeholder ou imagem padrão se não houver imagens
                       <div className="flex items-center justify-center h-full text-gray-500">
                           Sem imagem disponível
                       </div>
                    )}
                     {/* Badge de Urgência (se houver) */}
                      {campaign.urgent && (
                        <div className="absolute top-2 left-2 m-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10"> {/* Ajustado z-index para ficar sobre a imagem */}
                          URGENTE
                        </div>
                      )}
                 </div>

                 {/* Conteúdo do Card */}
                 <CardContent className="p-4">
                   <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                   {/* Descrição com limite de linhas */}
                   <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>

                   {/* Informações da campanha */}
                   <div className="flex items-center text-sm text-gray-500 mb-3">
                     <MapPin className="h-3 w-3 mr-1" />
                     <span>{campaign.location}</span>
                     <span className="mx-2">•</span>
                     <Clock className="h-3 w-3 mr-1" />
                     {/* Formatar data (ajustar conforme o tipo de endDate do backend/storage) */}
                     <span>Até {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('pt-BR') : 'Data indefinida'}</span> {/* Adicionado check para data */}
                   </div>

                   {/* Botão para ver detalhes */}
                   <Link href={`/campanha/${campaign.id}`}> {/* Link no botão, não no card */}
                     <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition">
                       Ver Detalhes
                     </Button>
                   </Link>
                 </CardContent>
               </Card>
            );
        })}
      </div>
    );
  };

  return (
    // Container principal da página de listagem de campanhas
    <div className="container mx-auto px-4 py-6">
      {/* Campo de busca no topo */}
       <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Campanhas Ativas</h1> {/* Título da página */}
          <div className="relative w-full max-w-sm">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
             <Input
               type="text"
               placeholder="Buscar campanhas por título, descrição ou local..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9" // Adicionar padding esquerdo para o ícone
             />
          </div>
       </div>

      {renderContent()} {/* Renderiza o conteúdo (loading, vazio, lista) */}
    </div>
  );
}