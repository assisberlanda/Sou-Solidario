import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const DonationProcess = () => {
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Redirecionar para a primeira etapa do processo de doação
    navigate("/doar/campanha");
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-4">
              Processo de Doação
            </h2>
            <p className="text-gray-600 mb-6">
              Você será redirecionado para iniciar o processo de doação.
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
  );
};

export default DonationProcess;
