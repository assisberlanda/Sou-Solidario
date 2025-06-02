// client/src/pages/MinhasCampanhas.tsx

// Importações necessárias
// Removido: import { useState, useEffect } from "react"; // UseQuery gerencia o estado e o carregamento
import { Link, useLocation } from "wouter"; // Para navegação
// Importe useQuery e useQueryClient para buscar e invalidar dados
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Importe useAuth para obter o usuário logado
import { useAuth } from "@/hooks/use-auth"; // <-- Importação corrigida (assumindo use-auth.tsx)
// Importe componentes UI
import { Button } from "@/components/ui/button";
// Adicionado CardFooter para os botões
import { Card, CardContent, CardFooter } from "@/components/ui/card";
// Importe ícones
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"; // Adicionado Loader2
// Importe useToast para mostrar notificações
import { useToast } from "@/hooks/use-toast";
// Importe apiRequest para fazer chamadas de API (DELETE)
import { apiRequest } from "@/lib/queryClient";
// Importe o tipo Campaign do schema compartilhado para tipagem
import { Campaign } from "@shared/schema";

// Definir o tipo da campanha para consistência com o backend (ajuste conforme necessário)
interface CampaignData extends Campaign {
  // Adicione campos específicos se o backend retornar algo a mais ou diferente do tipo Campaign
  // Por exemplo, se imageUrls for um array, adicione aqui:
  // imageUrls?: string[]; // Manter comentado se o backend não retornar
}


export default function MinhasCampanhas() {
  // Hooks
  const [, navigate] = useLocation(); // Para navegação
  const { toast } = useToast(); // Para mostrar notificações
  const { user, isLoading: isAuthLoading } = useAuth(); // Obtém o usuário logado e status de carregamento da autenticação
  const queryClient = useQueryClient(); // Obtém o cliente de query para invalidar o cache

  // Buscar campanhas do usuário logado usando TanStack Query
  // O endpoint /api/campaigns/my no backend já filtra pelo user.id baseado na sessão
  const {
    data: campaigns, // Renomeado de 'data' para 'campaigns' para clareza
    isLoading: isLoadingCampaigns, // Status de carregamento da query
    error: campaignsError // Erro da query (se houver)
  } = useQuery<CampaignData[]>({ // Tipagem com o tipo definido acima
    queryKey: ["/api/campaigns/my", user?.id], // Chave de query, inclui user.id para invalidar se o usuário mudar
    queryFn: async () => {
       // apiRequest já lida com credenciais: 'include' e verifica res.ok
       const response = await apiRequest("GET", "/api/campaigns/my");
       return response.json(); // Retorna a promessa da conversão para JSON
    },
    enabled: !!user, // A query só é habilitada/executada se user não for null/undefined
    staleTime: 5 * 60 * 1000, // Mantém os dados "frescos" por 5 minutos antes de buscar novamente em background
    onError: (error) => {
      console.error("Erro ao carregar campanhas do usuário:", error);
      toast({
        title: "Erro ao carregar campanhas",
        description: "Não foi possível carregar suas campanhas. " + (error instanceof Error ? error.message : ""),
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  // Manipulador para excluir uma campanha
  const handleDeleteCampaign = async (id: number) => {
    // Confirmação antes de excluir
    if (!window.confirm("Tem certeza que deseja excluir esta campanha? Esta ação é permanente e não pode ser desfeita.")) {
      return;
    }

    try {
      // Chama o endpoint DELETE no backend
      const response = await apiRequest("DELETE", `/api/campaigns/${id}`);

      if (!response.ok) {
          // Tenta ler a resposta para obter a mensagem de erro do backend
          const errorBody = await response.json(); // Assume que o backend retorna JSON com mensagem
          throw new Error(errorBody.message || `Erro ${response.status}: Falha ao excluir campanha`);
      }

      // Mostra toast de sucesso
      toast({
        title: "Sucesso",
        description: "Campanha excluída com sucesso.",
        variant: "default", // Cor padrão (geralmente verde/azul suave)
      });

      // Invalida o cache da query para forçar a recarga da lista de campanhas do usuário
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

  // Combina os estados de carregamento de autenticação e da query de campanhas
  const isLoading = isAuthLoading || isLoadingCampaigns;

  // --- Renderização condicional com base no estado ---

  // Estado de carregamento inicial (autenticação ou busca de campanhas)
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-lg text-gray-600">Carregando campanhas...</span>
      </div>
    );
  }

  // Se o usuário não estiver autenticado (embora a ProtectedRoute deva lidar com isso)
  // Esta condição é um fallback, a ProtectedRoute deve redirecionar antes.
  if (!user) {
      return (
          <div className="container mx-auto px-4 py-6 flex justify-center items-center">
              <Card className="p-8 text-center">
                  <CardContent className="p-0">
                      <p className="text-xl text-gray-600 mb-4">Acesso Negado</p>
                      <p className="text-gray-500">Você precisa estar logado para ver suas campanhas.</p>
                      <Link href="/auth">
                           <Button className="mt-4 bg-primary hover:bg-primary-dark">Fazer Login</Button>
                      </Link>
                  </CardContent>
               </Card>
           </div>
      );
  }


  // Se o usuário está logado, mas não tem campanhas cadastradas (a query retornou array vazio ou null)
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Minhas Campanhas</h1>
          {/* Botão para cadastrar nova campanha */}
          <Link href="/cadastro-campanha">
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Campanha
              </Button>
           </Link>
        </div>
        <Card className="text-center p-8">
          <CardContent className="p-0">
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

      {/* Grid para exibir os cards das campanhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mapeia sobre as campanhas obtidas pela query */}
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
             {/* Exibe a imagem da campanha (imageUrl) */}
            {/* Note que o backend mock armazena a URL em `imageUrl` */}
            {campaign.imageUrl && ( // Usando imageUrl que é o campo para a URL da imagem
              <div className="h-48 overflow-hidden bg-gray-100"> {/* Container para a imagem */}
                <img
                   // imageUrl é a URL completa agora (ex: /uploads/...)
                  src={campaign.imageUrl}
                  alt={`Imagem da campanha ${campaign.title}`} // Alt text acessível
                  className="w-full h-full object-cover" // Faz a imagem cobrir o container
                />
              </div>
            )}
            {!campaign.imageUrl && ( // Placeholder se não houver imagem
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                    Sem imagem
                </div>
            )}

            <CardContent className="p-4">
              {/* Exibe título e descrição */}
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p> {/* Limita para 3 linhas */}
              {/* TODO: Adicionar outras informações da campanha como localização, data, etc. */}
            </CardContent>

            {/* Rodapé do card com botões de ação */}
            <CardFooter className="p-4 pt-0 flex gap-2">
              {/* Botão Editar Campanha */}
              <Link href={`/editar-campanha/${campaign.id}`} className="flex-1"> {/* Link no botão */}
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2" // w-full para ocupar o espaço disponível
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
                className="flex-1 flex items-center gap-2" // w-full para ocupar o espaço disponível
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