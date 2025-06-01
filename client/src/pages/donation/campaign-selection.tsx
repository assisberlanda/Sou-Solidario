import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@shared/schema";
import { Droplet, Home, Heart, MapPin, Clock } from "lucide-react";

const CampaignSelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    onSuccess: (data) => {
      setActiveCampaigns(data?.filter((campaign) => campaign.active) || []);
    },
    onError: (error) => {
      console.error("Erro ao carregar campanhas:", error);
    },
  });

  const filteredCampaigns = activeCampaigns?.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Selecione uma Campanha</h1>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8 relative">
          <div className="w-full absolute top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {["Selecionar Campanha", "Escolher Itens", "Informar Dados", "Agendar Coleta", "Confirmação"].map(
            (step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
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
          ) : filteredCampaigns.length === 0 ? (
            <div className="col-span-2 text-center py-4 text-gray-500">
              Nenhuma campanha ativa no momento.
            </div>
          ) : (
            filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="cursor-pointer hover:shadow-lg transition p-4"
                onClick={() => navigate(`/campaign/${campaign.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-start">
                    <div className={`${campaign.urgent ? 'bg-compassion-light text-[#e86c00]' : 'bg-hope-light text-[#1eaa70]'} p-3 rounded-lg mr-4`}>
                      {campaign.title.toLowerCase().includes("enchente") ? (
                        <Droplet className="h-6 w-6" />
                      ) : campaign.title.toLowerCase().includes("reconstrução") ? (
                        <Home className="h-6 w-6" />
                      ) : (
                        <Heart className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading font-bold text-lg">{campaign.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {campaign.description.length > 60
                          ? campaign.description.substring(0, 60) + "..."
                          : campaign.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{campaign.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-peace flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Até {new Date(campaign.endDate).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-sm font-medium text-hope hover:text-[#1eaa70]">
                          Ver detalhes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
  );
};

export default CampaignSelection;