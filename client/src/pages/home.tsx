import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatBot from "@/components/ChatBot";
import { Campaign } from "@shared/schema";
import { ArrowRight, Droplet, Home, Heart, Clock, MapPin, Search, QrCode } from "lucide-react";

const HomePage = () => {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="relative rounded-xl mb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/background.jpeg" 
            alt="Ajuda humanitária" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-[#1eaa70]/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ajude quem mais precisa em momentos de crise
          </h1>
          <p className="text-lg mb-8 text-white/90">
            A plataforma Sou Solidário conecta pessoas que desejam ajudar com vítimas de desastres naturais e situações de emergência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doar/campanha">
              <Button className="btn-compassion font-semibold px-6 py-3 h-auto text-base">
                Quero Doar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/campanhas">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/40 text-white px-6 py-3 h-auto text-base">
                Ver Campanhas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Tabs defaultValue="fazer-doacao" className="mb-12">
        <TabsList className="mb-6 border-b border-gray-200 w-full justify-start">
          <TabsTrigger value="fazer-doacao" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Fazer Doação
          </TabsTrigger>
          <TabsTrigger value="campanhas-ativas" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
            Campanhas Ativas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fazer-doacao">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-4">Processo de Doação</h2>

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

              <h3 className="text-xl font-heading font-semibold mb-4">Selecione uma campanha para doar</h3>

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
                ) : campaigns && campaigns.length > 0 ? (
                  campaigns.slice(0, 2).map((campaign) => (
                    <Link key={campaign.id} href={`/campanha/${campaign.id}`}>
                      <a className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer p-4">
                        <div className="flex items-start">
                          <div className={`bg-${campaign.urgent ? 'red' : 'amber'}-100 text-${campaign.urgent ? 'red' : 'amber'}-600 p-3 rounded-lg mr-4`}>
                            {campaign.title.includes("Enchentes") ? (
                              <Droplet className="h-6 w-6" />
                            ) : campaign.title.includes("Reconstrução") ? (
                              <Home className="h-6 w-6" />
                            ) : (
                              <Heart className="h-6 w-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-heading font-bold text-lg">{campaign.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{campaign.description.substring(0, 60)}...</p>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{campaign.location}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-primary flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Até {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-sm font-medium text-secondary hover:text-secondary-dark">
                                Ver detalhes
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-gray-500">
                    Nenhuma campanha encontrada. Tente novamente mais tarde.
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Você também pode acessar uma campanha diretamente pelo QR Code:
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Link href="/qrcode">
                  <Button className="flex items-center bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition">
                    <QrCode className="mr-2 h-4 w-4" />
                    Escanear QR Code
                  </Button>
                </Link>
                <span className="text-gray-500">ou</span>
                <form 
                  className="relative flex-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector('input');
                    const code = input?.value.trim();
                    if (code && code.length > 0) {
                      window.location.href = `/doar/codigo/${code}`;
                    }
                  }}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Digite o código da campanha (ex: A12345)"
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button 
                    type="submit"
                    className="absolute inset-y-0 right-0 px-3 text-primary hover:text-primary-dark"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="mt-8 flex justify-end">
                <Link href="/doar/campanha">
                  <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-lg transition">
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Chat Bot */}
          <ChatBot />
        </TabsContent>

        <TabsContent value="campanhas-ativas">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-neutral-dark">Campanhas Ativas</h2>
              <Link href="/campanhas">
                <Button variant="outline" className="text-primary hover:text-primary-dark">
                  Ver todas
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {isLoading ? (
                // Skeleton loading
                [...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <Link key={campaign.id} href={`/campanha/${campaign.id}`}>
                    <Card className="overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                      <div className="h-40 bg-gray-200 relative">
                        {campaign.imageUrl && (
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {campaign.urgent && (
                          <div className="absolute top-0 left-0 m-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            URGENTE
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-heading font-bold text-lg">{campaign.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {campaign.description}
                        </p>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{campaign.location}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Até {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>

                        <div className="w-full flex">
                          <Button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition">
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="col-span-3 text-center text-gray-500">
                  Nenhuma campanha encontrada. Tente novamente mais tarde.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* How it Works Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-hope-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-hope" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">1. Escolha uma Campanha</h3>
              <p className="text-gray-600 text-sm">
                Navegue pelas campanhas ativas ou escaneie um QR Code para encontrar uma causa para apoiar.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-compassion-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-compassion" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">2. Selecione Itens para Doar</h3>
              <p className="text-gray-600 text-sm">
                Escolha entre os itens necessários e informe a quantidade que você pode doar.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-peace-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-peace" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">3. Agende a Coleta</h3>
              <p className="text-gray-600 text-sm">
                Informe seus dados e agende uma data para que a doação seja coletada em seu endereço.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#64b5f6] rounded-xl p-8 text-white text-center overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#64b5f6] to-[#4a98db] opacity-80"></div>
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="/assets/background.jpeg"
            alt="Ajuda humanitária"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-heading font-bold mb-4 text-white drop-shadow-md">
            Faça a diferença hoje mesmo!
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-white drop-shadow-md">
            Sua doação pode transformar a vida de pessoas afetadas por desastres naturais e emergências.
            Não importa o tamanho da sua contribuição, cada item doado tem um impacto significativo.
          </p>
          <Link href="/campanhas">
            <Button className="btn-compassion px-6 py-3 h-auto text-base font-semibold">
              Quero Doar Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
