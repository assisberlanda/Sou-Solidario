import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
  imagens?: string[];
  data_inicio?: string;
  data_fim?: string;
  horarios_disponiveis?: {
    inicio: string;
    fim: string;
  };
  dias_disponiveis?: Array<{
    data: string;
    bairro: string;
  }>;
}

export default function EditarCampanha() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState<Omit<Campanha, "id">>({
    titulo: "",
    descricao: "",
    imagens: [],
    data_inicio: "",
    data_fim: "",
    horarios_disponiveis: {
      inicio: "",
      fim: ""
    }
  });
  
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [bairrosPorData, setBairrosPorData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  
  // Estado para as novas imagens sendo carregadas
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchCampanha = async () => {
      try {
        const res = await fetch(`/api/campaigns/${params.id}`);
        
        if (!res.ok) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da campanha",
            variant: "destructive",
          });
          navigate("/minhas-campanhas");
          return;
        }
        
        const data: Campanha = await res.json();
        
        setForm({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          imagens: data.imagens || [],
          data_inicio: data.data_inicio || "",
          data_fim: data.data_fim || "",
          horarios_disponiveis: {
            inicio: data.horarios_disponiveis?.inicio || "",
            fim: data.horarios_disponiveis?.fim || "",
          }
        });
        
        // Configurar previews das imagens existentes
        if (data.imagens && data.imagens.length > 0) {
          setPreviews([...data.imagens]);
        }
        
        if (data.dias_disponiveis && data.dias_disponiveis.length > 0) {
          const days = data.dias_disponiveis.map(d => new Date(d.data));
          setSelectedDays(days);
          
          const bairrosMap: { [key: string]: string } = {};
          data.dias_disponiveis.forEach(d => {
            bairrosMap[d.data] = d.bairro;
          });
          setBairrosPorData(bairrosMap);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da campanha",
          variant: "destructive",
        });
        navigate("/minhas-campanhas");
      } finally {
        setLoading(false);
      }
    };

    fetchCampanha();
  }, [params.id, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBairroChange = (date: string, value: string) => {
    setBairrosPorData({ ...bairrosPorData, [date]: value });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setNovasImagens(prev => [...prev, ...files]);
    
    // Criar URLs para as novas imagens para preview
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };
  
  const handleRemoveImage = (index: number) => {
    // Se for uma imagem nova
    if (index >= (form.imagens?.length || 0)) {
      const novasImagensIndex = index - (form.imagens?.length || 0);
      
      // Remover a imagem do array de novas imagens
      const updatedNovasImagens = [...novasImagens];
      updatedNovasImagens.splice(novasImagensIndex, 1);
      setNovasImagens(updatedNovasImagens);
      
      // Remover também do preview
      const updatedPreviews = [...previews];
      updatedPreviews.splice(index, 1);
      setPreviews(updatedPreviews);
      return;
    }
    
    // Se for uma imagem existente
    const updatedImagens = [...(form.imagens || [])];
    updatedImagens.splice(index, 1);
    setForm({ ...form, imagens: updatedImagens });
    
    // Remover do preview também
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Primeiro fazemos o upload das novas imagens, se houver
      let todasImagens = [...(form.imagens || [])];
      
      if (novasImagens.length > 0) {
        const formData = new FormData();
        novasImagens.forEach(file => {
          formData.append('images', file);
        });
        
        const uploadRes = await fetch(`/api/uploads/campaign-images`, {
          method: 'POST',
          body: formData
        });
        
        if (!uploadRes.ok) {
          toast({
            title: "Erro",
            description: "Não foi possível fazer upload das imagens",
            variant: "destructive",
          });
          return;
        }
        
        const { imageUrls } = await uploadRes.json();
        todasImagens = [...todasImagens, ...imageUrls];
      }
      
      // Agora atualizamos a campanha com todos os dados
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        imagens: todasImagens,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        dias_disponiveis: selectedDays.map((date) => ({
          data: date.toISOString().split("T")[0],
          bairro: bairrosPorData[date.toISOString().split("T")[0]] || "",
        })),
        horarios_disponiveis: {
          inicio: form.horarios_disponiveis?.inicio || "",
          fim: form.horarios_disponiveis?.fim || "",
        },
      };
      
      const res = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a campanha",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "Campanha atualizada com sucesso!",
        variant: "default",
      });
      navigate("/minhas-campanhas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a campanha",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Editar Campanha</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título da Campanha</Label>
          <Input
            id="titulo"
            name="titulo"
            placeholder="Ex: Campanha do Agasalho 2025"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição da Campanha</Label>
          <Textarea
            id="descricao"
            name="descricao"
            placeholder="Descreva os objetivos e necessidades da sua campanha..."
            value={form.descricao}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Imagens da Campanha</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {/* Previews de imagens */}
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {/* Botão para adicionar mais imagens */}
            <div 
              className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500 mt-1">Adicionar</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
                multiple
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data_inicio">Data de Início</Label>
            <Input
              id="data_inicio"
              name="data_inicio"
              type="date"
              value={form.data_inicio}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="data_fim">Data de Término</Label>
            <Input
              id="data_fim"
              name="data_fim"
              type="date"
              value={form.data_fim}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Horários Disponíveis</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario_inicio" className="text-sm">Horário de Início</Label>
              <Input
                id="horario_inicio"
                name="horarios_disponiveis.inicio"
                type="time"
                value={form.horarios_disponiveis?.inicio || ""}
                onChange={(e) => setForm({
                  ...form,
                  horarios_disponiveis: {
                    ...form.horarios_disponiveis!,
                    inicio: e.target.value
                  }
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="horario_fim" className="text-sm">Horário de Término</Label>
              <Input
                id="horario_fim"
                name="horarios_disponiveis.fim"
                type="time"
                value={form.horarios_disponiveis?.fim || ""}
                onChange={(e) => setForm({
                  ...form,
                  horarios_disponiveis: {
                    ...form.horarios_disponiveis!,
                    fim: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Datas Disponíveis para Doação</Label>
          <Card>
            <CardContent className="p-4">
              <DayPicker
                mode="multiple"
                selected={selectedDays}
                onSelect={(days) => setSelectedDays(days || [])}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        {selectedDays.length > 0 && (
          <div className="space-y-4">
            <Label>Bairros para cada data selecionada</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDays.map((day) => (
                <div key={day.toISOString()} className="space-y-1">
                  <Label className="text-sm">
                    {day.toLocaleDateString('pt-BR')}
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nome do bairro"
                    value={bairrosPorData[day.toISOString().split("T")[0]] || ""}
                    onChange={(e) => handleBairroChange(day.toISOString().split("T")[0], e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/minhas-campanhas")}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-primary hover:bg-primary-dark"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
