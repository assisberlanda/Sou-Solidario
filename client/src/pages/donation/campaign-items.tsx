import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ChatBot from "@/components/ChatBot";
import { Campaign, NeededItem, Category } from "@shared/schema";
import { ArrowRight, ArrowLeft, AlertTriangle, DollarSign, ShoppingBag } from "lucide-react";

interface CampaignItemsProps {
  campaignId: number;
  onItemsSelect: (selectedItemIds: number[]) => void;
}

const CampaignItems = ({ campaignId, onItemsSelect }: CampaignItemsProps) => {
  const [_, navigate] = useLocation();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

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

  // Pegar os 10 itens mais prioritários
  const topItems = sortedItems.slice(0, 10);

  // Obter cor da categoria
  const getCategoryColor = (categoryId: number) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.color || "#cccccc";
  };

  // Toggle para selecionar/deselecionar item
  const toggleItem = (itemId: number) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Verificar se há algum item selecionado
  const hasSelectedItems = selectedItems.length > 0;

  // Continuar para a próxima etapa
  const handleContinue = () => {
    if (hasSelectedItems) {
      onItemsSelect(selectedItems);
      navigate("/doar/itens");
    }
  };

  // Se não tiver campanhaId, redirecionar para seleção de campanha
  useEffect(() => {
    if (!campaignId) {
      navigate("/doar/campanha");
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
            <Link href="/doar/campanha">
              <Button className="mt-4">Selecionar outra campanha</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-4">
            Processo de Doação
          </h2>

          {/* Step Indicator */}
          <div className="flex justify-between mb-8 relative">
            <div className="w-full absolute top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

            {["Selecionar Campanha", "Escolher Itens", "Informar Dados", "Agendar Coleta", "Confirmação"].map(
              (step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index < 2
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center">{step}</span>
                </div>
              )
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-heading font-semibold mb-2">
              Como você deseja ajudar?
            </h3>
            <p className="text-gray-600">
              Campanha: <strong>{campaign.title}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-4">{campaign.description}</p>
            
            {/* Opções de doação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Opção de doação de itens */}
              <div className="border rounded-lg p-5 bg-white hover:border-primary transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-medium text-lg">Doar Itens</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione itens específicos para doar, como alimentos, roupas, produtos de higiene, etc.
                </p>
              </div>
              
              {/* Opção de doação financeira */}
              <Link href={`/doar/financeira/${campaignId}`}>
                <div className="border rounded-lg p-5 bg-white hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-lg">Doar em Dinheiro</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Faça uma contribuição financeira por PIX, transferência ou depósito bancário.
                  </p>
                </div>
              </Link>
            </div>
            
            <Separator className="my-6" />
            
            <h3 className="text-xl font-heading font-semibold mb-4">
              Selecione os itens que deseja doar
            </h3>
            
            <div className="p-4 bg-amber-100 border border-amber-300 rounded-lg mb-6 flex items-start">
              <AlertTriangle className="text-amber-600 h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 text-sm font-medium mb-1">
                  Itens mais necessários
                </p>
                <p className="text-amber-800 text-sm">
                  Selecione abaixo os itens que você pode doar. Na próxima tela, você poderá informar a quantidade.
                </p>
              </div>
            </div>
          </div>

          {/* Lista de itens com checkboxes */}
          <div className="space-y-3 mb-6">
            {topItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Não há itens cadastrados para esta campanha.
              </p>
            ) : (
              topItems.map((item) => (
                <Card key={item.id} className="border-l-4" style={{ borderLeftColor: getCategoryColor(item.categoryId) }}>
                  <CardContent className="p-4 flex items-center">
                    <Checkbox 
                      id={`item-${item.id}`} 
                      className="mr-3" 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`item-${item.id}`} 
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">
                          Necessários: {item.quantity} {item.unit}
                        </span>
                      </label>
                    </div>
                    {item.priority === 1 && (
                      <Badge className="bg-red-500 ml-2">Prioritário</Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Resumo da seleção */}
          {hasSelectedItems && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Itens selecionados: {selectedItems.length}</h4>
              <p className="text-sm text-gray-600">
                Na próxima tela, você poderá definir a quantidade para cada item.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Link href="/doar/campanha">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button
              className="bg-primary hover:bg-primary-dark text-white font-medium"
              disabled={!hasSelectedItems}
              onClick={handleContinue}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot campaignId={campaignId} />
    </div>
  );
};

export default CampaignItems;