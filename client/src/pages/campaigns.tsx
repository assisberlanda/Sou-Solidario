import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@shared/schema";
import {
  Search,
  Map,
  Calendar,
  MapPin,
  Filter,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const CampaignsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Buscar campanhas
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Filtrar campanhas
  const filteredCampaigns = campaigns
    ? campaigns.filter((campaign) => {
        const matchesSearch =
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.location.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeFilter === "all") return matchesSearch && campaign.active;
        if (activeFilter === "urgent") return matchesSearch && campaign.urgent && campaign.active;
        
        // Filtros por tipo de campanha (baseado no título)
        if (activeFilter === "flood" && matchesSearch && campaign.active) {
          return campaign.title.toLowerCase().includes("enchente") || 
                 campaign.title.toLowerCase().includes("inundação") ||
                 campaign.title.toLowerCase().includes("água");
        }
        if (activeFilter === "clothing" && matchesSearch && campaign.active) {
          return campaign.title.toLowerCase().includes("agasalho") || 
                 campaign.title.toLowerCase().includes("roupa") ||
                 campaign.title.toLowerCase().includes("vestuário");
        }
        if (activeFilter === "reconstruction" && matchesSearch && campaign.active) {
          return campaign.title.toLowerCase().includes("reconstrução") || 
                 campaign.title.toLowerCase().includes("construção") ||
                 campaign.title.toLowerCase().includes("reforma");
        }
        
        return false;
      })
    : [];

  // Simular marcadores para o mapa (baseado nos dados de campanha)
  const mapMarkers = campaigns
    ? campaigns
        .filter((c) => c.active)
        .map((campaign) => ({
          id: campaign.id,
          title: campaign.title,
          location: campaign.location,
          // Coordenadas simuladas para efeito visual
          position: {
            lat: Math.random() * 10 + 20,
            lng: Math.random() * 10 - 50,
          },
          urgent: campaign.urgent,
        }))
    : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Campanhas Ativas</h1>
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Buscar campanhas..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={activeFilter === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveFilter("all")}
                  >
                    Todas
                  </Badge>
                  <Badge
                    variant={activeFilter === "urgent" ? "default" : "outline"}
                    className={`cursor-pointer ${
                      activeFilter === "urgent" ? "bg-red-500" : ""
                    }`}
                    onClick={() => setActiveFilter("urgent")}
                  >
                    Urgentes
                  </Badge>
                  <Badge
                    variant={activeFilter === "flood" ? "default" : "outline"}
                    className={`cursor-pointer ${
                      activeFilter === "flood" ? "bg-blue-500" : ""
                    }`}
                    onClick={() => setActiveFilter("flood")}
                  >
                    Enchentes
                  </Badge>
                  <Badge
                    variant={activeFilter === "clothing" ? "default" : "outline"}
                    className={`cursor-pointer ${
                      activeFilter === "clothing" ? "bg-purple-500" : ""
                    }`}
                    onClick={() => setActiveFilter("clothing")}
                  >
                    Agasalhos
                  </Badge>
                  <Badge
                    variant={activeFilter === "reconstruction" ? "default" : "outline"}
                    className={`cursor-pointer ${
                      activeFilter === "reconstruction" ? "bg-amber-500" : ""
                    }`}
                    onClick={() => setActiveFilter("reconstruction")}
                  >
                    Reconstrução
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {isLoading ? (
                  // Skeleton loading
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
                      <div className="h-40 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : filteredCampaigns.length === 0 ? (
                  <div className="col-span-full py-8 text-center">
                    <p className="text-gray-500">
                      Nenhuma campanha encontrada com os critérios selecionados.
                    </p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveFilter("all");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden shadow-sm hover:shadow-md transition">
                      <div className="h-40 bg-gray-200 relative">
                        {campaign.imageUrl ? (
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400">Sem imagem</span>
                          </div>
                        )}
                        {campaign.urgent && (
                          <div className="absolute top-0 left-0 m-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            URGENTE
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-heading font-bold text-lg">{campaign.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {campaign.description}
                        </p>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{campaign.location}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Até {new Date(campaign.endDate).toLocaleDateString("pt-BR")}</span>
                        </div>

                        <Link href={`/doar/${campaign.id}`}>
                          <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition">
                            Doar Agora
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {filteredCampaigns.length > 0 && (
                <div className="flex justify-center mt-6">
                  <div className="flex">
                    <Button variant="outline" size="sm" className="rounded-r-none">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-none bg-primary text-white">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-none">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-l-none">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Mapa de Campanhas</CardTitle>
              <CardDescription>
                Visualize a distribuição geográfica das campanhas ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden mb-4">
                {/* Simulação de mapa para visualização */}
                <div className="absolute inset-0 bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                    alt="Mapa do Brasil"
                    className="w-full h-full object-cover opacity-30"
                  />

                  {/* Marcadores simulados no mapa */}
                  {mapMarkers.map((marker) => (
                    <Link key={marker.id} href={`/doar/${marker.id}`}>
                      <a
                        className={`absolute ${
                          marker.urgent ? "bg-red-500" : "bg-primary"
                        } text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer`}
                        style={{
                          top: `${marker.position.lat}%`,
                          left: `${marker.position.lng}%`,
                        }}
                        title={marker.title}
                      >
                        <span className="text-xs">{marker.id}</span>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="outline" className="cursor-pointer bg-blue-100 text-blue-800">
                  <Map className="h-3 w-3 mr-1" /> Nordeste
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-green-100 text-green-800">
                  <Map className="h-3 w-3 mr-1" /> Sudeste
                </Badge>
                <Badge variant="outline" className="cursor-pointer bg-amber-100 text-amber-800">
                  <Map className="h-3 w-3 mr-1" /> Sul
                </Badge>
              </div>

              <Card className="border border-gray-200">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button variant="ghost" size="sm" className="justify-start">
                      Rio Grande do Sul
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      São Paulo
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      Rio de Janeiro
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      Minas Gerais
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      Bahia
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      Pernambuco
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 mt-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Tipos de Campanha
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="enchentes" className="mr-2" />
                      <label htmlFor="enchentes" className="text-sm">Enchentes e Inundações</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="deslizamentos" className="mr-2" />
                      <label htmlFor="deslizamentos" className="text-sm">Deslizamentos</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="incendios" className="mr-2" />
                      <label htmlFor="incendios" className="text-sm">Incêndios</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="agasalho" className="mr-2" />
                      <label htmlFor="agasalho" className="text-sm">Campanha do Agasalho</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="alimentos" className="mr-2" />
                      <label htmlFor="alimentos" className="text-sm">Alimentos</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
