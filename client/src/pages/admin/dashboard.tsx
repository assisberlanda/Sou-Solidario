import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { donationStatusMap, formatDate } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  QrCode,
  DownloadCloud,
  BarChart3,
  Package,
  Users,
  Calendar,
  Layers,
  Map,
} from "lucide-react";

const AdminDashboard = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [openQrCode, setOpenQrCode] = useState<number | null>(null);

  // Buscar usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Buscar campanhas
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Buscar doações
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ["/api/donations"],
  });

  // Função para gerar QR Code
  const generateQrCode = async (campaignId: number) => {
    try {
      const response = await apiRequest("GET", `/api/campaigns/${campaignId}/qrcode`, undefined);
      const data = await response.json();
      return data.qrCodeDataUrl;
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      return null;
    }
  };

  // Filtragem de campanhas
  const filteredCampaigns = campaigns
    ? campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Dados para o gráfico
  const chartData = campaigns
    ? campaigns.map((campaign) => ({
        name: campaign.title.length > 15 ? campaign.title.substring(0, 15) + "..." : campaign.title,
        doações: donations ? donations.filter((d) => d.campaignId === campaign.id).length : 0,
      }))
    : [];

  // Função para excluir campanha
  const handleDeleteCampaign = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta campanha?")) {
      try {
        await apiRequest("DELETE", `/api/campaigns/${id}`, undefined);
        queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
        toast({
          title: "Campanha excluída",
          description: "A campanha foi excluída com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir a campanha",
          variant: "destructive",
        });
      }
    }
  };

  // Função para mostrar QR Code
  const handleShowQrCode = async (campaignId: number) => {
    const qrCodeData = await generateQrCode(campaignId);
    if (qrCodeData) {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>QR Code - Campanha</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                img { max-width: 300px; }
                .container { max-width: 500px; margin: 0 auto; }
                .instructions { margin-top: 20px; text-align: left; }
                .instructions h3 { color: #2E7D32; }
                .btn { 
                  background-color: #2E7D32; 
                  color: white; 
                  border: none; 
                  padding: 10px 15px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>QR Code para Doação</h2>
                <p>Escaneie o código abaixo para acessar a página de doação</p>
                <img src="${qrCodeData}" alt="QR Code" />
                <div class="instructions">
                  <h3>Instruções:</h3>
                  <ol>
                    <li>Imprima este QR Code e coloque em locais visíveis</li>
                    <li>Compartilhe nas redes sociais para maior alcance</li>
                    <li>Os doadores podem escanear com a câmera do celular</li>
                    <li>Eles serão direcionados diretamente para a página de doação</li>
                  </ol>
                </div>
                <button class="btn" onclick="window.print()">Imprimir QR Code</button>
              </div>
            </body>
          </html>
        `);
      }
    } else {
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o QR Code para esta campanha",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">
            Bem-vindo, {currentUser?.name || "Administrador"}. Gerencie campanhas e doações.
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Link href="/admin/campanha/nova">
            <Button className="flex items-center bg-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Campanhas</p>
                <h3 className="text-2xl font-bold">{campaigns?.length || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Doações</p>
                <h3 className="text-2xl font-bold">{donations?.length || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Doações Pendentes</p>
                <h3 className="text-2xl font-bold">
                  {donations?.filter((d) => d.status === "pending").length || 0}
                </h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Doadores</p>
                <h3 className="text-2xl font-bold">
                  {new Set(donations?.map((d) => d.donorName)).size || 0}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campanhas">
        <TabsList className="border-b border-gray-200 w-full justify-start mb-6">
          <TabsTrigger value="campanhas" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="doacoes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Doações
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Campanhas</CardTitle>
              <CardDescription>
                Visualize, edite ou crie novas campanhas de doação
              </CardDescription>
              <div className="relative w-full max-w-sm mt-4">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Buscar campanhas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="text-center py-4">Carregando campanhas...</div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma campanha encontrada
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Data Término</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{campaign.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {campaign.description.substring(0, 60)}...
                            </div>
                          </TableCell>
                          <TableCell>{campaign.location}</TableCell>
                          <TableCell>{formatDate(campaign.endDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={campaign.active ? "default" : "secondary"}
                              className={
                                campaign.active
                                  ? campaign.urgent
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                  : "bg-gray-500"
                              }
                            >
                              {campaign.active
                                ? campaign.urgent
                                  ? "Urgente"
                                  : "Ativa"
                                : "Inativa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => navigate(`/doar/${campaign.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Visualizar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/admin/campanha/${campaign.id}`)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleShowQrCode(campaign.id)}
                                >
                                  <QrCode className="mr-2 h-4 w-4" />
                                  <span>QR Code</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doacoes">
          <Card>
            <CardHeader>
              <CardTitle>Doações Recebidas</CardTitle>
              <CardDescription>
                Acompanhe as doações e gerencie a logística de coleta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <div className="text-center py-4">Carregando doações...</div>
              ) : !donations || donations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma doação registrada
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Doador</TableHead>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Data de Coleta</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => {
                        const campaign = campaigns?.find(
                          (c) => c.id === donation.campaignId
                        );
                        return (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium">{donation.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{donation.donorName}</div>
                              <div className="text-sm text-gray-500">
                                {donation.donorPhone}
                              </div>
                            </TableCell>
                            <TableCell>
                              {campaign ? campaign.title : `Campanha ${donation.campaignId}`}
                            </TableCell>
                            <TableCell>
                              {formatDate(donation.pickupDate)}, {donation.pickupTime}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={donationStatusMap[donation.status]?.color || "bg-gray-100 text-gray-800"}
                              >
                                {donationStatusMap[donation.status]?.label || donation.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Detalhes</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        await apiRequest("PUT", `/api/donations/${donation.id}/status`, {
                                          status: "confirmed",
                                        });
                                        queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
                                        toast({
                                          title: "Status atualizado",
                                          description: "Doação marcada como confirmada",
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Erro",
                                          description: "Não foi possível atualizar o status",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Confirmar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        await apiRequest("PUT", `/api/donations/${donation.id}/status`, {
                                          status: "collected",
                                        });
                                        queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
                                        toast({
                                          title: "Status atualizado",
                                          description: "Doação marcada como coletada",
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Erro",
                                          description: "Não foi possível atualizar o status",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>Marcar como Coletada</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Doações por Campanha</CardTitle>
                <CardDescription>
                  Visualize o número de doações por campanha
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="doações" fill="#2E7D32" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mapa de Doações</CardTitle>
                <CardDescription>
                  Distribuição geográfica das doações
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col items-center justify-center">
                <Map className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-center text-gray-500">
                  Mapa interativo com a localização das doações
                </p>
                <Button className="mt-4" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Relatório Detalhado
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Exportar Relatórios</CardTitle>
              <CardDescription>
                Baixe relatórios em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                        <DownloadCloud className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium">Campanhas Ativas</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Lista de todas as campanhas em andamento
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Exportar CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                        <DownloadCloud className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium">Doações Recebidas</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Relatório de todas as doações realizadas
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Exportar CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
                        <DownloadCloud className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-medium">Coletas Pendentes</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Lista de coletas agendadas para hoje
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Exportar CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
