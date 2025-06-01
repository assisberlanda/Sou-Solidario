// client/src/pages/campanhas.tsx

// Importe o componente de listagem completo
import ListarCampanhas from "@/components/ListarCampanhas";
// Importe o PageLayout se estiver usando para envolver o conteúdo da página
import PageLayout from "@/components/PageLayout";


export default function CampanhasPage() {
  return (
    // Usar PageLayout para envolver o conteúdo da página Campanhas
    <PageLayout showBackButton={false}> {/* Esta página não tem botão voltar específico do layout */}
       <ListarCampanhas /> {/* Renderiza o componente que lista e busca as campanhas */}
    </PageLayout>
  );
}