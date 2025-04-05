import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { NeededItem, Campaign } from "@shared/schema";
import ChatBot from "@/components/ChatBot";
import { CheckCircle2, Download, Calendar, MapPin, Phone, Mail, Truck, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ConfirmationProps {
  campaignId: number;
  donationItems: { neededItemId: number; quantity: number }[];
  donorData: any;
  pickupData: any;
}

const Confirmation = ({ campaignId, donationItems, donorData, pickupData }: ConfirmationProps) => {
  const [donationId, setDonationId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar detalhes da campanha
  const { data: campaign } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  // Buscar itens necessários
  const { data: neededItems } = useQuery<NeededItem[]>({
    queryKey: [`/api/campaigns/${campaignId}/items`],
  });

  // Criar doação
  useEffect(() => {
    const createDonation = async () => {
      try {
        setIsSubmitting(true);
        
        // Se já temos um ID de doação, não precisamos criar novamente
        if (donationId) return;
        
        // Simular a criação de uma doação (em um app real, isso seria feito através da API)
        // Simular atraso de processamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados para a criação da doação
        const donationData = {
          campaignId,
          donorName: donorData.donorName,
          donorPhone: donorData.donorPhone,
          donorEmail: donorData.donorEmail || null,
          status: "pending",
          address: donorData.address,
          city: donorData.city,
          state: donorData.state,
          zipCode: donorData.zipCode,
          pickupDate: pickupData.pickupDate,
          pickupInstructions: pickupData.instructions || null,
          items: donationItems
        };
        
        // Em um app real, faríamos uma chamada para a API
        // const response = await apiRequest("/api/donations", {
        //   method: "POST",
        //   body: JSON.stringify(donationData)
        // });
        // setDonationId(response.id);
        
        // Para este exemplo, vamos apenas simular uma resposta
        setDonationId(Math.floor(Math.random() * 10000) + 1);
        setIsSubmitting(false);
      } catch (err) {
        console.error("Erro ao criar doação:", err);
        setError("Ocorreu um erro ao registrar sua doação. Por favor, tente novamente.");
        setIsSubmitting(false);
      }
    };

    createDonation();
  }, [campaignId, donorData, pickupData, donationItems, donationId]);

  // Encontrar detalhes de itens
  const getItemDetails = (neededItemId: number) => {
    return neededItems?.find(item => item.id === neededItemId);
  };

  // Formatar data de coleta
  const formattedPickupDate = pickupData.pickupDate 
    ? new Date(pickupData.pickupDate).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    : '';
  
  const formattedPickupTime = pickupData.pickupTime || '';

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
                      "bg-primary text-white"
                    }`}
                  >
                    {index < 4 ? index + 1 : <CheckCircle2 className="h-5 w-5" />}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center">{step}</span>
                </div>
              )
            )}
          </div>

          {isSubmitting ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Processando sua doação...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-red-600 mb-2">Erro no Processamento</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/doar/agendamento">
                <Button>Tentar Novamente</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-500 mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">
                  Doação Confirmada!
                </h3>
                <p className="text-gray-600">
                  Seu código de doação é: <span className="font-semibold">#{donationId}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3 pb-2 border-b">Detalhes da Campanha</h4>
                  {campaign && (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{campaign.title}</p>
                      <p className="text-gray-600">{campaign.description}</p>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3 pb-2 border-b">Detalhes da Coleta</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <span><strong>Data e Hora:</strong> {formattedPickupDate} às {formattedPickupTime}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <strong>Endereço:</strong> {donorData.address}, {donorData.city} - {donorData.state}, CEP: {donorData.zipCode}
                      </div>
                    </div>
                    {pickupData.instructions && (
                      <div className="flex items-start">
                        <Truck className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <strong>Instruções:</strong> {pickupData.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3 pb-2 border-b">Itens Doados</h4>
                <div className="space-y-2">
                  {donationItems.map((item) => {
                    const itemDetails = getItemDetails(item.neededItemId);
                    return (
                      <div key={item.neededItemId} className="flex justify-between items-center py-1">
                        <span>{itemDetails?.name}</span>
                        <span className="font-medium">
                          {item.quantity} {itemDetails?.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3 pb-2 border-b">Seus Dados</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium w-32">Nome:</span>
                    <span>{donorData.donorName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{donorData.donorPhone}</span>
                  </div>
                  {donorData.donorEmail && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{donorData.donorEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="text-sm text-gray-600 space-y-4">
                  <p>
                    <strong>Próximos passos:</strong> Um voluntário entrará em contato para confirmar a coleta. Você também receberá um e-mail com os detalhes da sua doação.
                  </p>
                  <p>
                    <strong>Importante:</strong> Mantenha os itens embalados e prontos para a coleta na data e horário agendados.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Comprovante
                </Button>
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary-dark text-white font-medium">
                    Concluir
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot campaignId={campaignId} />
    </div>
  );
};

export default Confirmation;