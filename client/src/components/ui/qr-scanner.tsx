import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRCodeScanner = ({ open, onClose, onScan }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há uma câmera disponível
    if (open) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          // Liberar a câmera imediatamente
          stream.getTracks().forEach((track) => track.stop());
          setHasCamera(true);
          setError(null);
        })
        .catch((err) => {
          console.error("Erro ao acessar a câmera:", err);
          setHasCamera(false);
          setError("Não foi possível acessar a câmera do dispositivo.");
        });
    }
  }, [open]);

  const handleScan = (data: string) => {
    if (data) {
      onScan(data);
      toast({
        title: "QR Code escaneado com sucesso!",
        description: "Redirecionando para a campanha...",
        duration: 3000,
      });
      onClose();
    }
  };

  const handleError = (err: Error) => {
    console.error("Erro ao escanear QR code:", err);
    setError("Erro ao escanear QR code. Por favor, tente novamente.");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear QR Code</DialogTitle>
          <DialogDescription>
            Posicione o QR code da campanha na frente da câmera para iniciar a doação.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Card className="p-4 bg-red-50 border-red-200 text-red-600 text-sm">
            {error}
          </Card>
        ) : hasCamera ? (
          <div className="relative overflow-hidden rounded-lg">
            <Scanner
              onScan={(data) => data[0] && handleScan(data[0].rawValue)}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
            />
          </div>
        ) : (
          <Card className="p-4 bg-amber-50 border-amber-200 text-amber-600 text-sm">
            Não foi possível acessar a câmera. Verifique as permissões do navegador ou tente em outro dispositivo.
          </Card>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
