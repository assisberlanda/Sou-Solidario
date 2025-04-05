import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className = "" }: BackButtonProps) => {
  const [_, navigate] = useLocation();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleGoBack}
      className={`flex items-center gap-1 text-primary hover:text-primary-dark hover:bg-gray-100 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Voltar</span>
    </Button>
  );
};

export default BackButton;