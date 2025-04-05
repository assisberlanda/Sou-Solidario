import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCodeScanner from "@/components/ui/qr-scanner";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ArrowLeft, Scan } from "lucide-react";

interface QrScannerPageProps {
  onCampaignSelect: (campaignId: number) => void;
}

const QrScannerPage = ({ onCampaignSelect }: QrScannerPageProps) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [openScanner, setOpenScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Função para lidar com o scanner de QR Code
  const handleQrCodeScan = (data: string) => {
    setScannedCode(data);
    setIsProcessing(true);

    try {
      // Verificar se o QR code contém uma URL válida
      const url = new URL(data);
      
      // Extrair o ID da campanha da URL
      // Assumindo que o formato é algo como /doar/123
      const pathParts = url.pathname.split("/");
      const campaignId = parseInt(pathParts[pathParts.length - 1]);
      
      if (!isNaN(campaignId)) {
        setTimeout(() => {
          onCampaignSelect(campaignId);
          navigate(`/doar/${campaignId}`);
        }, 1500);
      } else {
        throw new Error("QR Code inválido");
      }
    } catch (error) {
      console.error("QR Code inválido:", error);
      toast({
        title: "QR Code inválido",
        description: "O QR code escaneado não contém um link válido para uma campanha.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/doar/campanha">
          <Button variant="outline" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-heading font-bold">Scanner de QR Code</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Escanear QR Code</CardTitle>
            <CardDescription>
              Aponte a câmera para o QR code de uma campanha de doação.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {scannedCode && isProcessing ? (
              <div className="rounded-lg bg-gray-100 p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <QrCode className="h-16 w-16 text-[#26c485] mb-4" />
                  <p className="text-lg font-medium text-gray-800">Processando QR Code...</p>
                  <p className="text-sm text-gray-600 mt-2">Redirecionando para a campanha</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <QrCode className="h-16 w-16 text-[#26c485] mb-4" />
                <p className="text-center text-gray-600 mb-4">
                  Clique no botão abaixo para abrir a câmera e escanear um QR code de campanha.
                </p>
                <Button
                  onClick={() => setOpenScanner(true)}
                  className="btn-hope flex items-center"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Abrir Scanner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>
              Instruções para escanear QR codes de campanhas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-[#26c485] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Localize um QR Code</h4>
                  <p className="text-sm text-gray-600">
                    Encontre QR codes em cartazes, folhetos, redes sociais ou sites de campanhas de doação.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#26c485] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Clique em "Abrir Scanner"</h4>
                  <p className="text-sm text-gray-600">
                    Permita o acesso à câmera quando solicitado pelo navegador.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#26c485] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Aponte para o QR Code</h4>
                  <p className="text-sm text-gray-600">
                    Posicione o QR code dentro do quadro da câmera e aguarde o reconhecimento automático.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#26c485] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Selecione os itens para doação</h4>
                  <p className="text-sm text-gray-600">
                    Após o reconhecimento, você será redirecionado para a página da campanha.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-[#26c485]/30 text-[#1b8d5e] text-sm">
              <p className="font-medium mb-1">Dica:</p>
              <p>
                Certifique-se de que a câmera está focada e que há iluminação suficiente para
                garantir uma leitura adequada do QR code.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Scanner */}
      <QRCodeScanner
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        onScan={handleQrCodeScan}
      />
    </div>
  );
};

export default QrScannerPage;
