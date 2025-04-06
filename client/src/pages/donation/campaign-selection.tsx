import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatBot from "@/components/ChatBot";
import QRCodeScanner from "@/components/ui/qr-scanner";
import { Campaign } from "@shared/schema";
import { ArrowRight, Search, QrCode, Droplet, Home, Heart, MapPin, Clock } from "lucide-react";

interface CampaignSelectionProps {
  onCampaignSelect: (campaignId: number) => void;
}

const CampaignSelection = ({ onCampaignSelect }: CampaignSelectionProps) => {
  const [_, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [openScanner, setOpenScanner] = useState(false);

  // Buscar campanhas
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Filtrar campanhas ativas
  const activeCampaigns = campaigns
    ? campaigns.filter(
        (campaign) =>
          campaign.active &&
          (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           campaign.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Função para lidar com a seleção de campanha
  const handleSelectCampaign = (campaignId: number) => {
    navigate(`/campanha/${campaignId}`);
  };

  // Função para lidar com o scanner de QR Code
  const handleQrCodeScan = (data: string) => {
    try {
      // Verificar se o QR code contém uma URL válida
      const url = new URL(data);
      // Extrair o ID da campanha da URL
      const pathParts = url.pathname.split("/");
      const campaignId = parseInt(pathParts[pathParts.length - 1]);
      
      if (!isNaN(campaignId)) {
        onCampaignSelect(campaignId);
        navigate(`/doar/itens`);
      }
    } catch (error) {
      console.error("QR Code inválido:", error);
    }
  };

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

          <h3 className="text-xl font-heading font-semibold mb-4">
            Selecione uma campanha para doar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {isLoading ? (
              // Skeleton loading
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
            ) : activeCampaigns.length === 0 ? (
              <div className="col-span-2 text-center py-4 text-gray-500">
                {searchTerm
                  ? "Nenhuma campanha encontrada com esse termo. Tente outra busca."
                  : "Nenhuma campanha ativa no momento."}
              </div>
            ) : (
              // Lista de campanhas
              activeCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer p-4"
                  onClick={() => handleSelectCampaign(campaign.id)}
                >
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
                </div>
              ))
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Você também pode acessar uma campanha diretamente pelo QR Code:
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Button
              onClick={() => setOpenScanner(true)}
              className="flex items-center btn-peace px-4 py-2 rounded-lg transition"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Escanear QR Code
            </Button>
            <span className="text-gray-500">ou</span>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Digite o nome ou local da campanha"
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Link href="/">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Link href="/campanhas">
              <Button className="btn-hope font-medium">
                Ver Todas as Campanhas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot />

      {/* QR Code Scanner */}
      <QRCodeScanner
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        onScan={handleQrCodeScan}
      />
    </div>
  );
};

export default CampaignSelection;
