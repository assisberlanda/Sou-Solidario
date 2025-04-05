import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatBot from "@/components/ChatBot";
import { Campaign, NeededItem, Category } from "@shared/schema";
import { ArrowRight, ArrowLeft, Plus, Minus, AlertCircle } from "lucide-react";

interface ItemSelectionProps {
  campaignId: number;
  selectedItemIds: number[];
  onItemsSelect: (items: { neededItemId: number; quantity: number }[]) => void;
}

const ItemSelection = ({ campaignId, selectedItemIds, onItemsSelect }: ItemSelectionProps) => {
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
  
  // Inicializar os itens selecionados quando os dados chegarem
  useEffect(() => {
    if (neededItems && selectedItemIds && selectedItemIds.length > 0) {
      const initialItems = selectedItemIds.map(id => ({
        neededItemId: id,
        quantity: 1
      }));
      setSelectedItems(initialItems);
    }
  }, [neededItems, selectedItemIds]);

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

  // Filtrar apenas os itens selecionados
  const filteredItems = neededItems 
    ? neededItems.filter((item: NeededItem) => selectedItemIds.includes(item.id))
    : [];
    
  // Separar itens por prioridade
  const priorityItems = filteredItems.filter((item: NeededItem) => item.priority === 1);
  const otherItems = filteredItems.filter((item: NeededItem) => item.priority !== 1);

  // Continuar para a próxima etapa
  const handleContinue = () => {
    if (hasSelectedItems) {
      onItemsSelect(selectedItems);
      navigate("/doar/dados");
    }
  };

  // Se não tiver campanhaId ou itens selecionados, redirecionar
  useEffect(() => {
    if (!campaignId) {
      navigate("/doar/campanha");
    } else if (!selectedItemIds || selectedItemIds.length === 0) {
      navigate(`/doar/selecionar-itens`);
    }
  }, [campaignId, selectedItemIds, navigate]);

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
              Defina a quantidade para cada item
            </h3>
            <p className="text-gray-600">
              Campanha: <strong>{campaign.title}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-4">{campaign.description}</p>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6 flex items-start">
              <AlertCircle className="text-amber-500 h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-medium mb-1">
                  Informe a quantidade
                </p>
                <p className="text-amber-700 text-sm">
                  Para cada item selecionado, defina a quantidade que você pretende doar utilizando os botões + e -.
                </p>
              </div>
            </div>
          </div>

          {/* Lista de itens selecionados com controles de quantidade */}
          <div className="space-y-3 mb-6">
            {filteredItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhum item selecionado. Volte para selecionar itens.
              </p>
            ) : (
              filteredItems.map((item: NeededItem) => (
                <Card 
                  key={item.id} 
                  className={`border-l-4 ${item.priority === 1 ? 'bg-red-50' : ''}`}
                  style={{ borderLeftColor: getCategoryColor(item.categoryId) }}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium flex items-center">
                        {item.name}
                        {item.priority === 1 && (
                          <Badge className="bg-red-500 ml-2 text-xs">Prioritário</Badge>
                        )}
                      </div>
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
              ))
            )}
          </div>

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
