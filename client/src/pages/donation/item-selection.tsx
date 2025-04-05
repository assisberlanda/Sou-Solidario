import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatBot from "@/components/ChatBot";
import { Campaign, NeededItem, Category } from "@shared/schema";
import { ArrowRight, ArrowLeft, Plus, Minus } from "lucide-react";

interface ItemSelectionProps {
  campaignId: number;
  onItemsSelect: (items: { neededItemId: number; quantity: number }[]) => void;
}

const ItemSelection = ({ campaignId, onItemsSelect }: ItemSelectionProps) => {
  const [_, navigate] = useLocation();
  const [selectedItems, setSelectedItems] = useState<
    { neededItemId: number; quantity: number }[]
  >([]);

  // Buscar detalhes da campanha
  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  // Buscar itens necessários
  const { data: neededItems, isLoading: itemsLoading } = useQuery<NeededItem[]>({
    queryKey: [`/api/campaigns/${campaignId}/items`],
  });

  // Buscar categorias
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Obter cor da categoria
  const getCategoryColor = (categoryId: number) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.color || "#cccccc";
  };

  // Atualizar quantidade de um item
  const updateItemQuantity = (itemId: number, quantity: number) => {
    if (quantity < 0) return;

    const existingItemIndex = selectedItems.findIndex(
      (item) => item.neededItemId === itemId
    );

    if (existingItemIndex !== -1) {
      // Se o item já existe e a quantidade é 0, remover o item
      if (quantity === 0) {
        const newItems = [...selectedItems];
        newItems.splice(existingItemIndex, 1);
        setSelectedItems(newItems);
      } else {
        // Atualizar quantidade
        const newItems = [...selectedItems];
        newItems[existingItemIndex].quantity = quantity;
        setSelectedItems(newItems);
      }
    } else if (quantity > 0) {
      // Adicionar novo item
      setSelectedItems([...selectedItems, { neededItemId: itemId, quantity }]);
    }
  };

  // Obter quantidade atual de um item
  const getItemQuantity = (itemId: number) => {
    const item = selectedItems.find((item) => item.neededItemId === itemId);
    return item ? item.quantity : 0;
  };

  // Verificar se há algum item selecionado
  const hasSelectedItems = selectedItems.length > 0;

  // Agrupar itens por prioridade
  const priorityItems = neededItems
    ? neededItems.filter((item) => item.priority === 1)
    : [];
  const otherItems = neededItems
    ? neededItems.filter((item) => item.priority !== 1)
    : [];

  // Continuar para a próxima etapa
  const handleContinue = () => {
    if (hasSelectedItems) {
      onItemsSelect(selectedItems);
      navigate("/doar/dados");
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
              Selecione os itens para doação
            </h3>
            <p className="text-gray-600">
              Campanha: <strong>{campaign.title}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
          </div>

          {/* Itens Prioritários */}
          {priorityItems.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-3 flex items-center">
                <Badge className="bg-red-500 mr-2">Prioritário</Badge>
                Itens de Alta Prioridade
              </h4>
              <div className="space-y-3">
                {priorityItems.map((item) => (
                  <Card key={item.id} className="border-l-4" style={{ borderLeftColor: getCategoryColor(item.categoryId) }}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Necessários: {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(item.id, Math.max(0, getItemQuantity(item.id) - 1))
                          }
                          disabled={getItemQuantity(item.id) === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          className="w-16 text-center"
                          value={getItemQuantity(item.id)}
                          onChange={(e) =>
                            updateItemQuantity(item.id, parseInt(e.target.value) || 0)
                          }
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(item.id, getItemQuantity(item.id) + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Outros Itens */}
          {otherItems.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-3">Outros Itens Necessários</h4>
              <div className="space-y-3">
                {otherItems.map((item) => (
                  <Card key={item.id} className="border-l-4" style={{ borderLeftColor: getCategoryColor(item.categoryId) }}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Necessários: {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(item.id, Math.max(0, getItemQuantity(item.id) - 1))
                          }
                          disabled={getItemQuantity(item.id) === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          className="w-16 text-center"
                          value={getItemQuantity(item.id)}
                          onChange={(e) =>
                            updateItemQuantity(item.id, parseInt(e.target.value) || 0)
                          }
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(item.id, getItemQuantity(item.id) + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Resumo da seleção */}
          {hasSelectedItems && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Resumo da sua doação:</h4>
              <ul className="space-y-1">
                {selectedItems.map((selectedItem) => {
                  const item = neededItems?.find((i) => i.id === selectedItem.neededItemId);
                  return (
                    <li key={selectedItem.neededItemId} className="text-sm">
                      <span className="font-medium">{item?.name}:</span>{" "}
                      {selectedItem.quantity} {item?.unit}
                    </li>
                  );
                })}
              </ul>
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

export default ItemSelection;
