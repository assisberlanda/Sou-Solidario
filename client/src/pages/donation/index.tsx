import { useState, useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Componentes de etapas
import CampaignSelection from "./campaign-selection";
import CampaignItems from "./campaign-items";
import ItemSelection from "./item-selection";

const DonationProcess = () => {
  const [_, navigate] = useLocation();
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [donationItems, setDonationItems] = useState<{ neededItemId: number; quantity: number }[]>([]);

  // Manipuladores de etapas
  const handleCampaignSelect = (id: number) => {
    setCampaignId(id);
    navigate("/doar/selecionar-itens");
  };

  const handleItemsSelect = (itemIds: number[]) => {
    setSelectedItemIds(itemIds);
    navigate("/doar/itens");
  };

  const handleDonationItemsSelect = (items: { neededItemId: number; quantity: number }[]) => {
    setDonationItems(items);
    navigate("/doar/dados");
  };

  useEffect(() => {
    // Se acessar diretamente a rota principal, redirecionar para a primeira etapa
    if (window.location.pathname === "/doar") {
      navigate("/doar/campanha");
    }
  }, [navigate]);

  return (
    <Switch>
      <Route path="/doar/campanha">
        <CampaignSelection onCampaignSelect={handleCampaignSelect} />
      </Route>
      
      <Route path="/doar/selecionar-itens">
        {campaignId ? (
          <CampaignItems 
            campaignId={campaignId} 
            onItemsSelect={handleItemsSelect} 
          />
        ) : (
          <Redirect to="/doar/campanha" />
        )}
      </Route>
      
      <Route path="/doar/itens">
        {campaignId && selectedItemIds.length > 0 ? (
          <ItemSelection 
            campaignId={campaignId} 
            selectedItemIds={selectedItemIds}
            onItemsSelect={handleDonationItemsSelect} 
          />
        ) : (
          <Redirect to="/doar/campanha" />
        )}
      </Route>
      
      <Route path="/doar/dados">
        {campaignId && donationItems.length > 0 ? (
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6">
              <CardContent className="pt-6 text-center py-8">
                <h3 className="text-lg font-medium text-primary">
                  Etapa seguinte em desenvolvimento
                </h3>
                <p className="text-gray-600 mt-2 mb-4">
                  As etapas de informação do doador, agendamento de coleta e confirmação serão implementadas em breve.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/doar/itens">
                    <Button variant="outline">Voltar para os itens</Button>
                  </Link>
                  <Link href="/">
                    <Button>Voltar para Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Redirect to="/doar/campanha" />
        )}
      </Route>
      
      <Route path="/doar">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-4">
                  Processo de Doação
                </h2>
                <p className="text-gray-600 mb-6">
                  Clique no botão abaixo para iniciar o processo de doação.
                </p>
                <Link href="/doar/campanha">
                  <Button className="bg-primary hover:bg-primary-dark">
                    Iniciar Doação
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Route>
    </Switch>
  );
};

// Componente auxiliar para redirecionamento
const Redirect = ({ to }: { to: string }) => {
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  
  return null;
};

export default DonationProcess;
