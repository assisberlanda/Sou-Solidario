import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ChatBot from "@/components/ChatBot";
import { Campaign, NeededItem, Category } from "@shared/schema";
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  ShoppingBag,
  CalendarDays,
  Users,
  Droplet,
  Home as HomeIcon,
  Heart
} from "lucide-react";

interface CampaignDetailsProps {
  campaignId: number;
}

const CampaignDetails = ({ campaignId }: CampaignDetailsProps) => {
  const [_, navigate] = useLocation();

  // Buscar detalhes da campanha
  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  // Buscar itens necessários
  const { data: neededItems, isLoading: itemsLoading } = useQuery<NeededItem[]>({
    queryKey: [`/api/campaigns/${campaignId}/items`],
    enabled: !!campaignId,
  });

  // Buscar categorias
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Ordenar itens por prioridade
  const sortedItems = neededItems
    ? [...neededItems].sort((a, b) => {
        // Primeiro por prioridade (1 é mais alta)
        const priorityA = a.priority || 999;
        const priorityB = b.priority || 999;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        // Depois por nome
        return a.name.localeCompare(b.name);
      })
    : [];

  // Obter cor da categoria
  const getCategoryColor = (categoryId: number) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.color || "#cccccc";
  };

  // Se não tiver campanhaId, redirecionar para a lista de campanhas
  useEffect(() => {
    if (!campaignId) {
      navigate("/campanhas");
    }
  }, [campaignId, navigate]);

  if (campaignLoading || itemsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6 text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-32 bg-gray-200 rounded w-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6 text-center py-8">
            <h3 className="text-lg font-medium text-red-600">
              Campanha não encontrada
            </h3>
            <p className="text-gray-600 mt-2">
              A campanha que você está tentando acessar não existe ou foi removida.
            </p>
            <Link href="/campanhas">
              <Button className="mt-4">Ver todas as campanhas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determinar o ícone com base no título da campanha
  const getCampaignIcon = () => {
    if (campaign.title.includes("Enchentes")) {
      return <Droplet className="h-6 w-6" />;
    } else if (campaign.title.includes("Reconstrução")) {
      return <HomeIcon className="h-6 w-6" />;
    } else {
      return <Heart className="h-6 w-6" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6 overflow-hidden">
        <div className="relative h-48 md:h-64 bg-neutral-100">
          {campaign.imageUrl && (
            <img 
              src={campaign.imageUrl} 
              alt={campaign.title} 
              className="w-full h-full object-cover"
            />
          )}
          {campaign.urgent && (
            <div className="absolute top-0 left-0 m-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
              URGENTE
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-heading font-bold text-neutral-dark mb-3">
              {campaign.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                <span>{campaign.location}</span>
              </div>
              
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                <span>Até {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span>Criada por {campaign.createdBy}</span>
              </div>
            </div>
            
            <p className="text-gray-700 whitespace-pre-line mb-6">
              {campaign.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href={`/doar/${campaignId}`}>
                <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 h-auto">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Quero Doar Itens
                </Button>
              </Link>
              
              <Link href={`/doacao-financeira/${campaignId}`}>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6 py-3 h-auto">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Doar em Dinheiro
                </Button>
              </Link>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-semibold">Itens Necessários</h2>
              <Link href={`/doar/${campaignId}`}>
                <Button variant="link" className="text-primary">
                  Doar Agora
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {sortedItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Não há itens cadastrados para esta campanha.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedItems.map((item) => (
                  <Card key={item.id} className="border-l-4" style={{ borderLeftColor: getCategoryColor(item.categoryId) }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-lg">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Necessários: <span className="font-medium">{item.quantity} {item.unit}</span>
                          </p>
                        </div>
                        {item.priority === 1 && (
                          <Badge className="bg-red-500">Prioritário</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="p-4 mt-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-blue-600 h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900 text-sm font-medium mb-1">
                    Como você pode ajudar?
                  </p>
                  <p className="text-blue-800 text-sm">
                    Clique em "Quero Doar Itens" para selecionar os itens e quantidades que você deseja doar. 
                    Em seguida, você poderá agendar a coleta da sua doação ou combinar um ponto de entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot campaignId={campaignId} />
    </div>
  );
};

export default CampaignDetails;