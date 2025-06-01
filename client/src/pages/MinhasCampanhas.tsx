// client/src/pages/MinhasCampanhas.tsx

// Importações necessárias
import { useState, useEffect } from "react"; // Manter useEffect se necessário para outra lógica (atualmente não usada explicitamente aqui)
import { Link, useLocation } from "wouter"; // Para navegação
// Importe useQuery para buscar os dados
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Importe useAuth para obter o usuário logado
import { useAuth } from "@/hooks/use-auth"; // Assumindo que o hook está em use-auth.tsx
// Importe componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card"; // Adicionado CardFooter
import { Plus, Edit, Trash2 } from "lucide-react"; // Ícones de Adicionar, Editar, Excluir
import { useToast } from "@/hooks/use-toast"; // Hook para mostrar notificações
// Importe o tipo Campaign do schema compartilhado
import { Campaign } from "@shared/schema"; // Importe o tipo Campaign
import { apiRequest } from "@/lib/queryClient"; // Importe apiRequest para DELETE

export default function MinhasCampanhas() {
  // Hooks
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth(); // Obtém o usuário logado e status de carregamento da autenticação
  const queryClient = useQueryClient(); // Obtém o cliente de query para invalidar o cache

  // Buscar campanhas do usuário logado usando TanStack Query
  // O endpoint /api/campaigns/my no backend já filtra pelo user.id baseado na sessão
  const { data: campaigns, isLoading: isLoadingCampaigns, error: campaignsError } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns/my"], // Chave de query para este endpoint
    enabled: !!user, // Só executa a query se o usuário estiver autenticado
    onError: (error) => {
      console.error("Erro ao carregar campanhas do usuário:", error);
      toast({
        title: "Erro ao carregar campanhas",
        description: "Não foi possível carregar suas campanhas. " + (error instanceof Error ? error.message : ""),
        variant: "destructive",
      });
    },
  });

  // Manipulador para excluir uma campanha
  const handleDeleteCampaign = async (id: number) => {
    // Confirmação antes de excluir
    if (!window.confirm("Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // Chama o endpoint DELETE no backend
      const response = await apiRequest("DELETE", `/api/campaigns/${id}`);

      if (!response.ok) {
          // Tenta ler a resposta para obter a mensagem de erro do backend
          const errorBody = await response.json(); // Assumimos que o backend retorna JSON com mensagem
          throw new Error(errorBody.message || "Erro desconhecido ao excluir campanha");
      }

      // Mostra toast de sucesso
      toast({
        title: "Sucesso",
        description: "Campanha excluída com sucesso.",
        variant: "default", // Verde suave
      });

      // Invalida o cache da query para recarregar a lista de campanhas do usuário
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/my"] });

    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      // Mostra toast de erro
      toast({
        title: "Erro ao excluir campanha",
        description: "Erro: " + (error instanceof Error ? error.message : "Não foi possível excluir a campanha."),
        variant: "destructive",
        duration: 8000, // Mantém a mensagem de erro por mais tempo
      });
    }
  };

  // Estado de carregamento combinado (autenticação + campanhas)
  const isLoading = isAuthLoading || isLoadingCampaigns;

  // Renderização condicional com base no estado de carregamento e dados
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado (embora a ProtectedRoute deva impedir isso)
  if (!user) {
      return (
          <div className="flex justify-center items-center h-64">
              <Card className="p-8 text-center">
                  <CardContent>
                      <p className="text-xl text-gray-600 mb-4">Acesso Negado</p>
                      <p className="text-gray-500">Você precisa estar logado para ver suas campanhas.</p>
                      <Link href="/auth">
                           <Button className="mt-4">Fazer Login</Button>
                      </Link>
                  </CardContent>
               </Card>
           </div>
      );
  }


  // Se não houver campanhas cadastradas para este usuário
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Minhas Campanhas</h1>
        </div>
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-xl text-gray-600 mb-4">Você ainda não cadastrou nenhuma campanha.</p>
            {/* Botão para cadastrar nova campanha */}
            <Link href="/cadastro-campanha">
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Campanha
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se houver campanhas, exibe a lista
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Minhas Campanhas</h1>
        {/* Botão para cadastrar nova campanha */}
        <Link href="/cadastro-campanha">
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" /> Nova Campanha
            </Button>
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mapeia sobre as campanhas obtidas pela query */}
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
             {/* Exibe a primeira imagem se existir */}
            {campaign.imageUrl && ( // Usando imageUrl que é o campo correto agora
              <div className="h-48 overflow-hidden">
                <img
                   // imageUrl é a URL completa agora (ex: /uploads/...)
                  src={campaign.imageUrl}
                  alt={`Imagem da campanha ${campaign.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              {/* Exibe título e descrição */}
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              {/* Botão Editar Campanha */}
              <Link href={`/editar-campanha/${campaign.id}`}>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  size="sm" // Tamanho menor para botões no card footer
                >
                   <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
              {/* Botão Excluir Campanha */}
              <Button
                variant="destructive"
                onClick={() => handleDeleteCampaign(campaign.id)} // Chama a função handleDeleteCampaign
                className="flex-1 flex items-center gap-2"
                size="sm" // Tamanho menor
              >
                 <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}