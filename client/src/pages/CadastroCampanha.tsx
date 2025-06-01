// client/src/pages/CadastroCampanha.tsx

import { useState, useRef } from "react";
import { useLocation } from "wouter";
// Importe o hook de autenticação correto (assumindo use-auth.tsx como na correção anterior)
import { useAuth } from "@/hooks/use-auth"; // <-- Importação corrigida
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// Removido: import { apiRequest } from "@/lib/queryClient"; // Não usado nesta função
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Definindo o tipo para os dados do formulário
interface FormData {
  titulo: string;
  descricao: string;
  imagens: File[]; // Array de arquivos para upload
  data_inicio: string; // String do input type="date"
  data_fim: string;   // String do input type="date"
  horarios_inicio: string; // String do input type="time"
  horarios_fim: string;   // String do input type="time"
  location: string;
}

export default function CadastroCampanha() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth(); // <-- Obtém o usuário autenticado

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    imagens: [],
    data_inicio: "",
    data_fim: "",
    horarios_inicio: "",
    horarios_fim: "",
    location: ""
  });

  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [bairrosPorData, setBairrosPorData] = useState<{ [key: string]: string }>({}); // Map string Data (YYYY-MM-DD) -> string Bairro
  const [previews, setPreviews] = useState<string[]>([]); // URLs de preview (Blob URLs ou URLs de upload)
  const [isSaving, setIsSaving] = useState(false); // Estado para desabilitar botão e mostrar loading

  // Atualiza o formData com valores de inputs de texto/textarea
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Atualiza o formData.location separadamente se preferir, ou pode ser incluído no handleChange geral
  // const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData({ ...formData, location: e.target.value });
  // };

  // Atualiza o bairro associado a uma data selecionada
  const handleBairroChange = (dateString: string, value: string) => {
    setBairrosPorData({ ...bairrosPorData, [dateString]: value });
  };

  // Lida com a seleção de arquivos de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const totalImagens = formData.imagens.length + files.length;
    let novasImagens = files;

    // Limita o número total de imagens (existentes + novas) a 5
    if (totalImagens > 5) {
      toast({
        title: "Aviso",
        description: `É permitido adicionar no máximo 5 imagens (Você já tem ${formData.imagens.length}).`,
        variant: "default",
      });
      novasImagens = files.slice(0, 5 - formData.imagens.length); // Pega apenas as que cabem
    }

    // Adiciona os novos arquivos ao estado `formData.imagens`
    setFormData({
      ...formData,
      imagens: [...formData.imagens, ...novasImagens]
    });

    // Cria URLs temporárias para preview das novas imagens
    const newPreviews = novasImagens.map(file => URL.createObjectURL(file));
    // Adiciona os novos previews ao estado `previews`
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  // Lida com a remoção de uma imagem (pelo índice no array de previews)
  const handleRemoveImage = (indexToRemove: number) => {
    // Precisamos saber se estamos removendo um arquivo (em formData.imagens)
    // ou apenas um preview (e a imagem já está talvez salva ou é uma URL inicial)

    // Para um novo cadastro, `formData.imagens` e `previews` devem ter o mesmo tamanho e corresponder 1:1
    // em um editar, `previews` teria URLs antigas + Blob URLs novas, e `formData.imagens` apenas Blob URLs novas.
    // Simplificando para NOVO CADASTRO: previews[i] corresponde a formData.imagens[i]

    const updatedImagens = [...formData.imagens];
    const updatedPreviews = [...previews];

    // Revoga o Blob URL para liberar memória
    URL.revokeObjectURL(updatedPreviews[indexToRemove]);

    // Remove o item dos arrays
    updatedImagens.splice(indexToRemove, 1);
    updatedPreviews.splice(indexToRemove, 1);


    setFormData({
      ...formData,
      imagens: updatedImagens
    });
    setPreviews(updatedPreviews);
  };


  // Lida com o envio completo do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); // Inicia estado de salvamento

    // Validação básica no frontend antes de enviar
    if (!formData.titulo || !formData.descricao || !formData.data_fim || !formData.location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Título, Descrição, Data de Término e Localização.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!user) {
       toast({
         title: "Erro de Autenticação",
         description: "Usuário não carregado. Por favor, tente recarregar a página ou fazer login novamente.",
         variant: "destructive",
       });
       setIsSaving(false);
       return;
    }

    try {
      let imageUrls: string[] = [];
      // Se houver imagens selecionadas para upload
      if (formData.imagens.length > 0) {
        const formDataObj = new FormData();
        formData.imagens.forEach(file => {
          formDataObj.append('images', file); // 'images' é o nome do campo esperado pelo multer no backend
        });

        // Envia as imagens para o endpoint de upload local temporário
        const uploadRes = await fetch(`/api/uploads/campaign-images`, {
          method: 'POST',
          body: formDataObj,
          // credentials: 'include', // Pode ser necessário se o endpoint de upload for protegido
        });

        if (!uploadRes.ok) {
          // Tenta ler o corpo da resposta para obter uma mensagem de erro mais detalhada
          const errorBody = await uploadRes.text(); // ou .json() dependendo da resposta do backend
          console.error("Erro no upload das imagens. Resposta do servidor:", uploadRes.status, errorBody);
          throw new Error(`Erro no upload das imagens: ${uploadRes.statusText} - ${errorBody.substring(0, 100)}...`); // Lança um erro mais descritivo
        }

        const uploadData = await uploadRes.json();
        // Espera que o backend retorne um objeto com a propriedade 'imageUrls'
        imageUrls = uploadData.imageUrls || [];
        console.log("Upload bem-sucedido. URLs recebidas:", imageUrls);
      }

      // Constrói o payload para enviar para o backend para criar a campanha
      // Mapeando os dados do formulário para o schema esperado pelo backend (Drizzle/Zod)
      const payload = {
        title: formData.titulo,
        description: formData.descricao,
        // Usar a primeira URL da imagem (ou null se nenhuma imagem foi uploaded/selecionada)
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null, // Campo TEXT no DB, null é válido

        // Converter strings de data para objetos Date, conforme o schema Drizzle timestamp({ mode: 'date' }) espera Zod z.date()
        // O backend (server/storage.ts) deve lidar com a conversão de Date para o tipo timestamp do DB
        startDate: formData.data_inicio ? new Date(formData.data_inicio) : null, // Converter string para Date ou null
        endDate: new Date(formData.data_fim), // Converter string para Date (assumindo que é obrigatório)

        location: formData.location,
        active: true, // Assumindo que novas campanhas são ativas por padrão
        urgent: false, // Assumindo que não é urgente por padrão, adicione um campo se necessário
        createdBy: user.id, // Usa o ID do usuário autenticado

        // Mapear datas/bairros e horários para os campos JSON
        // O storage mock (e idealmente a implementação do DB) deve serializar para JSON string
        // Estamos enviando os objetos/arrays diretamente aqui, esperando que o backend lide com a serialização
        pickupSchedule: (formData.horarios_inicio && formData.horarios_fim) ? { inicio: formData.horarios_inicio, fim: formData.horarios_fim } : null,
        districts: selectedDays.length > 0 ? // Só inclui o campo se houver datas selecionadas
                   selectedDays
                     .map(day => {
                       const dateString = day.toISOString().split("T")[0]; // YYYY-MM-DD string
                       const bairro = bairrosPorData[dateString] || '';
                       return bairro.trim() !== '' ? { date: dateString, district: bairro.trim() } : null; // Objeto {date, district}
                     })
                     .filter(item => item !== null) // Remove entradas de datas sem bairro
                   : [], // Envia array vazio se nenhuma data selecionada ou nenhum bairro preenchido
      };

      console.log("Enviando payload para criar campanha:", payload);

      // Envia os dados da campanha para o backend
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          // Certifique-se de que o header é 'application/json' para enviar o payload JSON
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Inclui cookies de sessão
        body: JSON.stringify(payload) // Converte o payload para JSON string
      });

      if (!res.ok) {
        // Tenta ler a resposta para obter erros mais detalhados do backend
        const error = await res.json(); // Assume que backend retorna JSON em caso de erro
        console.error("Erro na resposta da API de criação de campanha:", error);
        // Se o backend retornar erros de validação Zod, mostra-os
        if (error.errors && Array.isArray(error.errors)) {
            const validationErrorMessages = error.errors.map((err: any) => {
                // Tenta formatar o erro se for um erro de validação Zod
                 const path = err.path && err.path.length > 0 ? err.path.join('.') : 'campo';
                 return `${path}: ${err.message}`;
            }).join('; ');
            throw new Error(`Erro de validação: ${validationErrorMessages}`);
        }
        // Se não forem erros Zod, lança o erro geral retornado pelo backend
        throw new Error(error.message || `Erro HTTP: ${res.status}`);
      }

      const campaign = await res.json(); // Se a resposta for OK, assume que retorna o objeto da campanha criada
      console.log("Campanha criada com sucesso:", campaign);

      toast({
        title: "Sucesso",
        description: "Campanha cadastrada com sucesso!",
        variant: "default",
      });

      // Revoga os Blob URLs criados para preview para liberar memória
      previews.forEach(url => {
          if (url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
          }
      });


      navigate("/minhas-campanhas"); // Redireciona em caso de sucesso

    } catch (error) {
      // Lida com erros durante o processo (upload, validação, API)
      console.error("Erro ao cadastrar campanha:", error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar a campanha: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
        duration: 8000, // Aumenta a duração para erros
      });
    } finally {
      setIsSaving(false); // Finaliza estado de salvamento
    }
  };


  // Verifica a identação do else na linha 174 (no snippet original)
  // No código que te dei na correção anterior, a lógica de servir estáticos
  // e o fallback HTML estão em server/index.ts e server/vite.ts,
  // e o else correspondente (linha 174 no meu exemplo anterior de index.ts)
  // parece estar corretamente indentado para o bloco `if (process.env.NODE_ENV !== 'production')`.
  // A indentação pode variar ligeiramente dependendo do seu editor e configurações,
  // mas a estrutura lógica `if (...) { ... } else { ... }` é o importante.
  // Acredito que a indentação já esteja correta no código completo fornecido na correção anterior.

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Cadastrar Nova Campanha</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título da Campanha</Label>
          <Input
            id="titulo"
            name="titulo" // <-- name deve corresponder à chave no state
            placeholder="Ex: Campanha do Agasalho 2025"
            value={formData.titulo}
            onChange={handleChange} // <-- Usa handleChange geral
            required
          />
           {/* TODO: Adicionar validação e mensagens de erro com react-hook-form e zod */}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição da Campanha</Label>
          <Textarea
            id="descricao"
            name="descricao" // <-- name deve corresponder à chave no state
            placeholder="Descreva os objetivos e necessidades da sua campanha..."
            value={formData.descricao}
            onChange={handleChange} // <-- Usa handleChange geral
            rows={4}
            required
          />
           {/* TODO: Adicionar validação e mensagens de erro com react-hook-form e zod */}
        </div>

        <div className="space-y-2">
          <Label>Imagens da Campanha</Label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
             {/* Mostra previews das imagens selecionadas */}
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview} // URL temporária (Blob URL) ou URL de upload
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                  aria-label={`Remover imagem ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Botão para adicionar mais imagens (aparece se houver menos de 5) */}
            {formData.imagens.length + (previews.length - formData.imagens.length) < 5 && ( // Verifica total de imagens
              <div
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
                role="button" // Semântica para div clicável
                aria-label="Adicionar imagem"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500 mt-1">Adicionar</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden" // Input real escondido
                  accept="image/png, image/jpeg, image/jpg" // Tipos de arquivo aceitos
                  multiple // Permite selecionar múltiplos arquivos
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Você pode adicionar até 5 imagens. Formatos aceitos: JPG, PNG, JPEG.</p>
           {/* TODO: Adicionar validação e mensagens de erro para imagens se necessário */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data_inicio">Data de Início</Label>
            <Input
              id="data_inicio"
              name="data_inicio" // <-- name deve corresponder à chave no state
              type="date"
              value={formData.data_inicio}
              onChange={handleChange} // <-- Usa handleChange geral
               // Campo opcional, não required aqui
            />
             {/* TODO: Adicionar validação e mensagens de erro com react-hook-form e zod */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_fim">Data de Término</Label>
            <Input
              id="data_fim"
              name="data_fim" // <-- name deve corresponder à chave no state
              type="date"
              value={formData.data_fim}
              onChange={handleChange} // <-- Usa handleChange geral
              required // Campo obrigatório
            />
             {/* TODO: Adicionar validação e mensagens de erro com react-hook-form e zod */}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Horários Disponíveis para Coleta</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horarios_inicio" className="text-sm">Horário de Início</Label>
              <Input
                id="horarios_inicio"
                name="horarios_inicio" // <-- name deve corresponder à chave no state
                type="time"
                value={formData.horarios_inicio}
                onChange={handleChange} // <-- Usa handleChange geral
              />
               {/* TODO: Adicionar validação e mensagens de erro */}
            </div>

            <div>
              <Label htmlFor="horarios_fim" className="text-sm">Horário de Término</Label>
              <Input
                id="horarios_fim"
                name="horarios_fim" // <-- name deve corresponder à chave no state
                type="time"
                value={formData.horarios_fim}
                onChange={handleChange} // <-- Usa handleChange geral
              />
               {/* TODO: Adicionar validação e mensagens de erro */}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Datas Disponíveis para Doação e Bairros</Label>
           {/* TODO: Adicionar validação e mensagens de erro */}
          <Card>
            <CardContent className="p-4">
              <DayPicker
                mode="multiple" // Permite selecionar múltiplas datas
                selected={selectedDays} // Datas selecionadas no estado
                onSelect={(days) => setSelectedDays(days || [])} // Atualiza o estado de datas selecionadas
                className="mx-auto"
                // TODO: Adicionar disabled para datas passadas se necessário
              />
            </CardContent>
          </Card>
        </div>

        {/* Campos de Bairro para cada data selecionada */}
        {selectedDays.length > 0 && (
          <div className="space-y-4">
            <Label>Bairros atendidos em cada data selecionada:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mapeia sobre as datas selecionadas */}
              {selectedDays.map((day) => {
                 // Formata a data como string 'YYYY-MM-DD' para usar como chave no bairrosPorData
                 const dateString = day.toISOString().split("T")[0];
                 return (
                   <div key={dateString} className="space-y-1">
                     <Label className="text-sm">
                       {day.toLocaleDateString('pt-BR')} {/* Exibe a data formatada para o usuário */}
                     </Label>
                     <Input
                       type="text"
                       placeholder={`Bairro para ${day.toLocaleDateString('pt-BR')}`}
                       value={bairrosPorData[dateString] || ""} // Valor do input do estado
                       onChange={(e) => handleBairroChange(dateString, e.target.value)} // Atualiza o estado
                     />
                      {/* TODO: Adicionar validação para campo de bairro se necessário */}
                   </div>
                 );
              })}
            </div>
             <p className="text-xs text-gray-500">Informe os bairros para os quais a coleta está disponível em cada data. Deixe em branco se a data for para outro fim (ex: ponto fixo).</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="location">Localização Principal da Campanha</Label>
          <Input
            id="location"
            name="location" // <-- name deve corresponder à chave no state
            type="text"
            placeholder="Cidade ou região principal da campanha"
            value={formData.location}
            onChange={handleChange} // <-- Usa handleChange geral
            required
          />
           {/* TODO: Adicionar validação e mensagens de erro com react-hook-form e zod */}
        </div>


        <div className="flex gap-4 pt-4">
          <Button
            type="button" // <-- Importante: tipo button para não submeter o form
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/minhas-campanhas")} // Redireciona ao cancelar
             disabled={isSaving} // Desabilita enquanto salva
          >
            Cancelar
          </Button>
          <Button
            type="submit" // <-- Tipo submit para enviar o formulário
            className="flex-1 bg-primary hover:bg-primary-dark"
            disabled={isSaving} // Desabilita enquanto salva
          >
             {isSaving ? (
                <span className="flex items-center">
                   <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
                   Salvando...
                </span>
             ) : (
               "Cadastrar Campanha"
             )}
          </Button>
        </div>
      </form>
    </div>
  );
}