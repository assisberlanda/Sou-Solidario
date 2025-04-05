import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CampaignByCodeProps {
  code: string;
  onCampaignSelect: (campaignId: number) => void;
}

const CampaignByCode = ({ code, onCampaignSelect }: CampaignByCodeProps) => {
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Buscar campanha por código
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["/api/campaigns/code", code],
    retry: false,
    enabled: !!code && code.length > 0,
  });

  useEffect(() => {
    if (campaign && !isRedirecting) {
      setIsRedirecting(true);
      
      toast({
        title: "Campanha localizada!",
        description: `Redirecionando para ${campaign.title}...`,
        duration: 3000,
      });
      
      // Pequeno atraso para mostrar a mensagem de sucesso
      setTimeout(() => {
        onCampaignSelect(campaign.id);
      }, 1000);
    }
  }, [campaign, onCampaignSelect, toast, isRedirecting]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="mb-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Buscando campanha...</h2>
          <p className="text-muted-foreground">
            Estamos procurando a campanha com o código {code}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-destructive">Código não encontrado</h2>
          <p className="text-muted-foreground">
            Não encontramos nenhuma campanha com o código {code}. Verifique se o código foi digitado corretamente e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="mb-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Redirecionando...</h2>
        <p className="text-muted-foreground">
          Preparando a página da campanha para você.
        </p>
      </div>
    </div>
  );
};

export default CampaignByCode;