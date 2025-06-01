import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  titulo: string;
  descricao: string;
  imagens: File[];
  data_inicio: string;
  data_fim: string;
  horarios_inicio?: string;
  horarios_fim?: string;
  location?: string; 
  [key: string]: any;
}

export default function CadastroCampanha() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [bairrosPorData, setBairrosPorData] = useState<{ [key: string]: string }>({});
  const [previews, setPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, location: e.target.value });
  };

  const handleBairroChange = (date: string, value: string) => {
    setBairrosPorData({ ...bairrosPorData, [date]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const totalImagens = formData.imagens.length + files.length;
    let novasImagens = files;

    if (totalImagens > 5) {
      toast({
        title: "Aviso",
        description: "É permitido adicionar no máximo 5 imagens",
        variant: "default",
      });
      novasImagens = files.slice(0, 5 - formData.imagens.length);
    }

    setFormData({
      ...formData, 
      imagens: [...formData.imagens, ...novasImagens]
    });

    const newPreviews = novasImagens.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImagens = [...formData.imagens];
    const updatedPreviews = [...previews];

    updatedImagens.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFormData({
      ...formData,
      imagens: updatedImagens
    });
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.titulo || !formData.descricao || !formData.data_fim || !formData.location) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      let imageUrls: string[] = [];
      if (formData.imagens.length > 0) {
        const formDataObj = new FormData();
        formData.imagens.forEach(file => {
          formDataObj.append('images', file);
        });

        const uploadRes = await fetch(`/api/uploads/campaign-images`, {
          method: 'POST',
          body: formDataObj,
          credentials: 'include'
        });

        if (!uploadRes.ok) {
          throw new Error("Erro no upload das imagens");
        }

        const uploadData = await uploadRes.json();
        imageUrls = uploadData.imageUrls || [];
      }

      const { user } = useAuth();
      
      const payload = {
        title: formData.titulo,
        description: formData.descricao,
        imageUrl: imageUrls[0] || "",
        startDate: formData.data_inicio,
        endDate: formData.data_fim,
        location: formData.location,
        status: "active",
        createdBy: user?.id,
        horarios: {
          inicio: formData.horarios_inicio,
          fim: formData.horarios_fim
        },
        bairros: Object.entries(bairrosPorData).map(([data, bairro]) => ({
          data,
          bairro
        }))
      };

      const res = await fetch('/api/campanhas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao cadastrar campanha");
      }

      const campaign = await res.json();
      toast({
        title: "Sucesso",
        description: "Campanha cadastrada com sucesso!",
        variant: "default",
      });

      navigate("/minhas-campanhas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar a campanha: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
      console.error("Erro ao cadastrar campanha:", error);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Cadastrar Nova Campanha</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título da Campanha</Label>
          <Input
            id="titulo"
            name="titulo"
            placeholder="Ex: Campanha do Agasalho 2025"
            value={formData.titulo}
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
            value={formData.descricao}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Imagens da Campanha</Label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
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

            {formData.imagens.length < 5 && (
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
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Você pode adicionar até 5 imagens. Formatos aceitos: JPG, PNG, JPEG.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data_inicio">Data de Início</Label>
            <Input
              id="data_inicio"
              name="data_inicio"
              type="date"
              value={formData.data_inicio}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_fim">Data de Término</Label>
            <Input
              id="data_fim"
              name="data_fim"
              type="date"
              value={formData.data_fim}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Horários Disponíveis para Coleta</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horarios_inicio" className="text-sm">Horário de Início</Label>
              <Input
                id="horarios_inicio"
                name="horarios_inicio"
                type="time"
                value={formData.horarios_inicio}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="horarios_fim" className="text-sm">Horário de Término</Label>
              <Input
                id="horarios_fim"
                name="horarios_fim"
                type="time"
                value={formData.horarios_fim}
                onChange={handleChange}
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

        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="Local da Campanha"
            value={formData.location}
            onChange={handleLocationChange}
          />
        </div>


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
            Cadastrar Campanha
          </Button>
        </div>
      </form>
    </div>
  );
}