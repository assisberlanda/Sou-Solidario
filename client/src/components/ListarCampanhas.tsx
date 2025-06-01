
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Campanha {
  id: string;
  title: string;
  description?: string;
  image?: string;
  data_inicio?: string;
  data_fim?: string;
}

export default function ListarCampanhas() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: campaigns, isLoading } = useQuery<Campanha[]>({
    queryKey: ["/api/campaigns"],
  });

  const filteredCampaigns = campaigns?.filter(campaign => 
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!campaigns || campaigns.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <p className="text-xl text-gray-600">Não existem campanhas cadastradas ainda</p>
            <p className="text-gray-500">Aguarde novas campanhas serem cadastradas.</p>
          </div>
        </Card>
      );
    }

    if (filteredCampaigns?.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <p className="text-xl text-gray-600">Nenhuma campanha encontrada</p>
            <p className="text-gray-500">Tente usar outras palavras na sua busca.</p>
          </div>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredCampaigns?.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            {campaign.image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
              <Button className="w-full">Ver Detalhes</Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}
