import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatBot from "@/components/ChatBot";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Clipboard, Home } from "lucide-react";

interface ConfirmationProps {
  donationData: {
    campaignId?: number;
    items?: { neededItemId: number; quantity: number }[];
    donorInfo?: any;
    schedule?: { date: string; time: string };
  };
  onDonationComplete: (donationId: number) => void;
}

const Confirmation = ({ donationData, onDonationComplete }: ConfirmationProps) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);
  const [protocolNumber, setProtocolNumber] = useState<string | null>(null);

  // Função para gerar um número de protocolo
  const generateProtocolNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `SOL-${timestamp}-${random}`;
  };

  // Verificar se todos os dados necessários estão presentes
  useEffect(() => {
    if (
      !donationData.campaignId ||
      !donationData.items ||
      !donationData.items.length ||
      !donationData.donorInfo ||
      !donationData.schedule
    ) {
      navigate("/doar/campanha");
    }
  }, [donationData, navigate]);

  // Função para enviar a doação para o servidor
  const submitDonation = async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      // Preparar dados para o envio
      const donationPayload = {
        campaignId: donationData.campaignId,
        donorName: donationData.donorInfo.donorName,
        donorPhone: donationData.donorInfo.donorPhone,
        donorEmail: donationData.donorInfo.donorEmail || "",
        address: donationData.donorInfo.address,
        city: donationData.donorInfo.city,
        state: donationData.donorInfo.state,
        zipCode: donationData.donorInfo.zipCode,
        pickupDate: donationData.schedule.date,
        pickupTime: donationData.schedule.time,
        status: "pending",
        items: donationData.items,
      };

      // Enviar para a API
      const response = await apiRequest("POST", "/api/donations", donationPayload);
      const data = await response.json();

      // Gerar protocolo
      const protocol = generateProtocolNumber();
      
      // Atualizar estados
      setDonationId(data.id);
      setProtocolNumber(protocol);
      setIsSubmitted(true);
      onDonationComplete(data.id);

      toast({
        title: "Doação registrada com sucesso!",
        description: `Seu protocolo é ${protocol}`,
      });
    } catch (error) {
      console.error("Erro ao registrar doação:", error);
      toast({
        title: "Erro ao registrar doação",
        description: "Não foi possível completar seu registro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se já tiver um ID de doação, não reenviar
  useEffect(() => {
    if (!isSubmitted && !isSubmitting && !donationId) {
      submitDonation();
    }
  }, [isSubmitted, isSubmitting, donationId]);

  // Função para copiar protocolo para a área de transferência
  const copyProtocolToClipboard = () => {
    if (protocolNumber) {
      navigator.clipboard.writeText(protocolNumber);
      toast({
        title: "Protocolo copiado!",
        description: "O número do protocolo foi copiado para a área de transferência.",
      });
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold bg-primary text-white`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center">{step}</span>
                </div>
              )
            )}
          </div>

          {isSubmitting ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">
                Processando sua doação...
              </h3>
              <p className="text-gray-600">
                Aguarde enquanto registramos sua doação. Não feche esta página.
              </p>
            </div>
          ) : isSubmitted ? (
            <div className="text-center py-4">
              <div className="bg-green-100 text-green-800 p-4 rounded-full inline-flex justify-center mb-4">
                <CheckCircle className="h-16 w-16" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">
                Doação Confirmada!
              </h3>
              <p className="text-gray-600 mb-6">
                Obrigado por sua generosidade! Sua doação fará a diferença na vida de muitas pessoas.
              </p>

              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Protocolo:</h4>
                  <button
                    onClick={copyProtocolToClipboard}
                    className="text-secondary flex items-center text-sm"
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copiar
                  </button>
                </div>
                <p className="font-mono text-lg font-bold">{protocolNumber}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Guarde este protocolo para acompanhar sua doação
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 text-left">
                <h4 className="font-medium mb-3">Resumo da doação:</h4>
                <p className="text-sm mb-1">
                  <strong>Data da coleta:</strong>{" "}
                  {donationData.schedule && formatDate(donationData.schedule.date)}, às{" "}
                  {donationData.schedule?.time}
                </p>
                <p className="text-sm mb-1">
                  <strong>Local:</strong>{" "}
                  {donationData.donorInfo?.address}, {donationData.donorInfo?.city}/
                  {donationData.donorInfo?.state}
                </p>
                {donationData.items && donationData.items.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Itens doados:</p>
                    <ul className="text-sm mt-1 pl-4 list-disc">
                      {donationData.items.map((item, index) => (
                        <li key={index}>
                          Item #{item.neededItemId}: {item.quantity} unidades
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Enviaremos um e-mail com os detalhes e entraremos em contato pelo telefone informado 
                para confirmar a coleta.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary-dark w-full sm:w-auto">
                    <Home className="mr-2 h-4 w-4" />
                    Voltar para o início
                  </Button>
                </Link>
                <Link href="/campanhas">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Ver outras campanhas
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-heading font-semibold mb-2">
                Finalizando sua doação...
              </h3>
              <p className="text-gray-600">
                Aguarde enquanto processamos suas informações.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot campaignId={donationData.campaignId} />
    </div>
  );
};

export default Confirmation;
