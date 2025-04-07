import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageLayout from "@/components/PageLayout";

// Páginas
import Home from "@/pages/home";
import CampaignsPage from "@/pages/campaigns";
import CampaignDetails from "@/pages/campaign-details";
import DonationProcess from "@/pages/donation";
import CampaignSelection from "@/pages/donation/campaign-selection";
import CampaignItems from "@/pages/donation/campaign-items";
import ItemSelection from "@/pages/donation/item-selection";
import DonorInfo from "@/pages/donation/donor-info";
import Schedule from "@/pages/donation/schedule";
import Confirmation from "@/pages/donation/confirmation";
import QrScannerPage from "@/pages/donation/qr-scanner";
import FinancialDonationPage from "@/pages/donation/financial-donation";
import CampaignByCode from "@/pages/donation/campaign-by-code";
import Login from "@/pages/login/Login";
import CadastroEmpresa from "@/pages/CadastroEmpresa";
import CadastroCampanha from "@/pages/CadastroCampanha";
import MinhasCampanhas from "@/pages/MinhasCampanhas";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import AboutPage from "@/pages/about";

function App() {
  const [location, navigate] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [donationState, setDonationState] = useState<{
    campaignId?: number;
    items?: { neededItemId: number; quantity: number }[];
    donorInfo?: any;
    schedule?: { date: string; time: string };
    donationId?: number;
  }>({});

  useEffect(() => {
    if (location === "/") {
      setDonationState({});
    }
  }, [location]);

  useEffect(() => {
    document.title = "Sou Solidário - Plataforma de Doações";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {!isAdminRoute && <Navbar user={user} />}

      <main className="flex-grow mt-16">
        <Switch>
          {/* Página Inicial */}
          <Route path="/">
            <PageLayout showBackButton={false}>
              <Home />
            </PageLayout>
          </Route>

          {/* Sobre */}
          <Route path="/sobre">
            <PageLayout>
              <AboutPage />
            </PageLayout>
          </Route>

          {/* Cadastro Empresa */}
          <Route path="/cadastro-empresa">
            <PageLayout>
              <CadastroEmpresa />
            </PageLayout>
          </Route>

          {/* Cadastro Campanha */}
          <Route path="/cadastro-campanha">
            <PageLayout>
              <CadastroCampanha />
            </PageLayout>
          </Route>

          {/* Minhas Campanhas */}
          <Route path="/minhas-campanhas">
            <PageLayout showBackButton>
              <MinhasCampanhas />
            </PageLayout>
          </Route>

          {/* Área Administrativa */}
          <Route path="/admin">
            {!user ? (
              <Login />
            ) : (
              <PageLayout>
                <Dashboard />
              </PageLayout>
            )}
          </Route>

          {/* Listagem de Campanhas Públicas */}
          <Route path="/campanhas">
            <PageLayout showBackButton={false}>
              <CampaignsPage />
            </PageLayout>
          </Route>

          {/* Detalhes da Campanha */}
          <Route path="/campanha/:id">
            {(params) => {
              const id = parseInt(params.id);
              if (isNaN(id)) return <NotFound />;
              return (
                <PageLayout showBackButton>
                  <CampaignDetails campaignId={id} />
                </PageLayout>
              );
            }}
          </Route>

          {/* Fluxo de Doação */}
          <Route path="/doar">
            <PageLayout>
              <DonationProcess />
            </PageLayout>
          </Route>

          <Route path="/doar/selecionar-campanha">
            <PageLayout>
              <CampaignSelection
                onCampaignSelect={(campaignId) =>
                  setDonationState({ ...donationState, campaignId })
                }
              />
            </PageLayout>
          </Route>

          <Route path="/doar/itens">
            <PageLayout>
              {donationState.campaignId ? (
                <ItemSelection
                  campaignId={donationState.campaignId}
                  onItemsSelect={(items) =>
                    setDonationState({ ...donationState, items })
                  }
                />
              ) : (
                <CampaignSelection
                  onCampaignSelect={(campaignId) =>
                    setDonationState({ ...donationState, campaignId })
                  }
                />
              )}
            </PageLayout>
          </Route>

          <Route path="/doar/dados">
            <PageLayout>
              {donationState.campaignId && donationState.items ? (
                <DonorInfo
                  onDonorInfoSubmit={(donorInfo) =>
                    setDonationState({ ...donationState, donorInfo })
                  }
                />
              ) : (
                <CampaignSelection
                  onCampaignSelect={(campaignId) =>
                    setDonationState({ ...donationState, campaignId })
                  }
                />
              )}
            </PageLayout>
          </Route>

          <Route path="/doar/agendar">
            <PageLayout>
              {donationState.campaignId &&
              donationState.items &&
              donationState.donorInfo ? (
                <Schedule
                  onScheduleSubmit={(schedule) =>
                    setDonationState({ ...donationState, schedule })
                  }
                />
              ) : (
                <CampaignSelection
                  onCampaignSelect={(campaignId) =>
                    setDonationState({ ...donationState, campaignId })
                  }
                />
              )}
            </PageLayout>
          </Route>

          <Route path="/doar/confirmacao">
            <PageLayout>
              {donationState.campaignId &&
              donationState.items &&
              donationState.donorInfo &&
              donationState.schedule ? (
                <Confirmation
                  donationData={donationState}
                  onDonationComplete={(donationId) =>
                    setDonationState({ ...donationState, donationId })
                  }
                />
              ) : (
                <CampaignSelection
                  onCampaignSelect={(campaignId) =>
                    setDonationState({ ...donationState, campaignId })
                  }
                />
              )}
            </PageLayout>
          </Route>

          {/* Doação financeira */}
          <Route path="/doacao-financeira/:id">
            {(params) => (
              <PageLayout>
                <FinancialDonationPage />
              </PageLayout>
            )}
          </Route>

          <Route path="/doar/codigo/:code">
            {(params) => (
              <PageLayout>
                <CampaignByCode
                  code={params.code}
                  onCampaignSelect={(campaignId) => {
                    setDonationState({ ...donationState, campaignId });
                    navigate(`/doar/items/${campaignId}`);
                  }}
                />
              </PageLayout>
            )}
          </Route>

          <Route path="/doar/:id">
            {(params) => {
              const id = parseInt(params.id);
              if (isNaN(id)) return <NotFound />;
              return (
                <PageLayout>
                  <CampaignItems
                    campaignId={id}
                    onItemsSelect={(selectedItemIds) =>
                      navigate(`/doar/items/${id}`)
                    }
                  />
                </PageLayout>
              );
            }}
          </Route>

          <Route path="/doar/items/:id">
            {(params) => {
              const id = parseInt(params.id);
              if (isNaN(id)) return <NotFound />;
              return (
                <PageLayout>
                  <ItemSelection
                    campaignId={id}
                    onItemsSelect={(items) =>
                      setDonationState({
                        ...donationState,
                        campaignId: id,
                        items,
                      })
                    }
                  />
                </PageLayout>
              );
            }}
          </Route>

          <Route path="/qrcode">
            <PageLayout>
              <QrScannerPage
                onCampaignSelect={(campaignId) =>
                  setDonationState({ ...donationState, campaignId })
                }
              />
            </PageLayout>
          </Route>

          {/* Página 404 */}
          <Route>
            <PageLayout>
              <NotFound />
            </PageLayout>
          </Route>
        </Switch>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
