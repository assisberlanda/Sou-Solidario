
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Campaign {
  id: number;
  titulo: string;
  descricao: string;
  imagens: string[];
  data_inicio: string;
  data_fim: string;
}

export default function MinhasCampanhas() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns/my"],
    onError: (error) => {
      console.error("Erro ao carregar campanhas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas campanhas",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCampaign = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta campanha?")) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Erro ao excluir campanha");
      
      toast({
        title: "Sucesso",
        description: "Campanha excluída com sucesso",
      });
      
      // Refresh the page to update the campaign list
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir campanha",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Minhas Campanhas</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-xl text-gray-600 mb-4">Nenhuma campanha cadastrada</p>
            <Button 
              onClick={() => navigate("/cadastro-campanha")}
              className="bg-primary hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              {campaign.imagens?.[0] && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={campaign.imagens[0]} 
                    alt={campaign.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{campaign.titulo}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.descricao}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/editar-campanha/${campaign.id}`)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="flex-1"
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
