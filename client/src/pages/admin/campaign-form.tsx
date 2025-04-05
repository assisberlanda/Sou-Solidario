import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampaignSchema, insertNeededItemSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Trash2,
  Info,
  AlertTriangle,
} from "lucide-react";

interface CampaignFormProps {
  campaignId?: number;
}

const CampaignForm = ({ campaignId }: CampaignFormProps) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [neededItems, setNeededItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(!!campaignId);

  // Buscar usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Buscar detalhes da campanha se estiver editando
  const { data: campaignData, isLoading: isLoadingCampaign } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !!campaignId,
  });

  // Buscar itens necessários se estiver editando
  const { data: campaignItems, isLoading: isLoadingItems } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}/items`],
    enabled: !!campaignId,
  });

  // Formulário para campanha
  const campaignForm = useForm({
    resolver: zodResolver(
      insertCampaignSchema.extend({
        endDate: z.string().min(1, "Data de término é obrigatória"),
      })
    ),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      endDate: "",
      createdBy: currentUser?.id || 1,
      urgent: false,
      imageUrl: "",
      active: true,
    },
  });

  // Formulário para item necessário
  const itemForm = useForm({
    resolver: zodResolver(insertNeededItemSchema),
    defaultValues: {
      campaignId: campaignId || 0,
      name: "",
      categoryId: 1,
      quantity: 1,
      unit: "unidades",
      priority: 1,
    },
  });

  // Atualizar valores do formulário quando os dados da campanha forem carregados
  useEffect(() => {
    if (campaignData) {
      campaignForm.reset({
        title: campaignData.title,
        description: campaignData.description,
        location: campaignData.location,
        endDate: campaignData.endDate,
        createdBy: campaignData.createdBy,
        urgent: campaignData.urgent,
        imageUrl: campaignData.imageUrl || "",
        active: campaignData.active,
      });
    }
  }, [campaignData, campaignForm]);

  // Atualizar itens necessários quando forem carregados
  useEffect(() => {
    if (campaignItems) {
      setNeededItems(campaignItems);
    }
  }, [campaignItems]);

  // Salvar campanha
  const onSubmitCampaign = async (data: any) => {
    setSaving(true);
    try {
      if (isEditing) {
        // Atualizar campanha existente
        await apiRequest("PUT", `/api/campaigns/${campaignId}`, data);
        toast({
          title: "Campanha atualizada",
          description: "A campanha foi atualizada com sucesso",
        });
      } else {
        // Criar nova campanha
        const response = await apiRequest("POST", "/api/campaigns", data);
        const newCampaign = await response.json();

        // Adicionar itens necessários à nova campanha
        for (const item of neededItems) {
          await apiRequest("POST", "/api/needed-items", {
            ...item,
            campaignId: newCampaign.id,
          });
        }

        toast({
          title: "Campanha criada",
          description: "A campanha foi criada com sucesso",
        });
      }

      // Invalidar consultas para atualizar dados
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/items`] });
      }

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a campanha",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Adicionar item necessário
  const onSubmitItem = async (data: any) => {
    try {
      if (isEditing) {
        // Adicionar item à campanha existente
        await apiRequest("POST", "/api/needed-items", {
          ...data,
          campaignId,
        });

        // Atualizar lista de itens
        queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/items`] });

        toast({
          title: "Item adicionado",
          description: "O item foi adicionado à campanha",
        });
      } else {
        // Adicionar item temporariamente
        setNeededItems([...neededItems, data]);
      }

      // Resetar formulário
      itemForm.reset({
        campaignId: campaignId || 0,
        name: "",
        categoryId: 1,
        quantity: 1,
        unit: "unidades",
        priority: 1,
      });
      setOpenItemDialog(false);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item",
        variant: "destructive",
      });
    }
  };

  // Remover item
  const removeItem = async (index: number, itemId?: number) => {
    if (isEditing && itemId) {
      try {
        await apiRequest("DELETE", `/api/needed-items/${itemId}`, undefined);
        queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/items`] });
        toast({
          title: "Item removido",
          description: "O item foi removido da campanha",
        });
      } catch (error) {
        toast({
          title: "Erro ao remover item",
          description: "Ocorreu um erro ao remover o item",
          variant: "destructive",
        });
      }
    } else {
      const updatedItems = [...neededItems];
      updatedItems.splice(index, 1);
      setNeededItems(updatedItems);
    }
  };

  if (isLoadingCampaign && campaignId) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-4xl">
          <CardContent className="py-10">
            <div className="text-center">Carregando dados da campanha...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          className="mr-4"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-heading font-bold">
          {isEditing ? "Editar Campanha" : "Nova Campanha"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Campanha</CardTitle>
              <CardDescription>
                Preencha os dados necessários para criar uma nova campanha de doação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...campaignForm}>
                <form onSubmit={campaignForm.handleSubmit(onSubmitCampaign)} className="space-y-6">
                  <FormField
                    control={campaignForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Campanha</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Ajuda às Vítimas das Enchentes em Porto Alegre"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Um título claro e objetivo para sua campanha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={campaignForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva detalhes sobre a campanha, quem será beneficiado e como as doações ajudarão..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Forneça informações detalhadas sobre a situação e as necessidades
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={campaignForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Porto Alegre, RS" {...field} />
                          </FormControl>
                          <FormDescription>
                            Cidade ou região afetada
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={campaignForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Até quando a campanha receberá doações
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={campaignForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/imagem.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link para uma imagem que represente a campanha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div>
                        <h4 className="font-medium">Campanha Urgente?</h4>
                        <p className="text-sm text-gray-500">
                          Marque se a situação necessita de resposta imediata
                        </p>
                      </div>
                    </div>
                    <FormField
                      control={campaignForm.control}
                      name="urgent"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Campanha Ativa?</h4>
                          <p className="text-sm text-gray-500">
                            Desative para encerrar a campanha
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={campaignForm.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <CardFooter className="px-0 pb-0">
                    <Button type="submit" className="ml-auto" disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Salvando..." : "Salvar Campanha"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Itens Necessários</CardTitle>
              <CardDescription>
                Adicione os itens que precisam ser doados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingItems && campaignId ? (
                <div className="text-center py-4">Carregando itens...</div>
              ) : neededItems.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Nenhum item adicionado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Clique no botão abaixo para adicionar itens necessários
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {neededItems.map((item, index) => {
                    const category = categories?.find((c) => c.id === item.categoryId);
                    return (
                      <li
                        key={item.id || index}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-600">
                              {item.quantity} {item.unit}
                            </span>
                            {category && (
                              <Badge
                                className="ml-2"
                                style={{
                                  backgroundColor: category.color,
                                  color: "#fff",
                                }}
                              >
                                {category.name}
                              </Badge>
                            )}
                            {item.priority === 1 && (
                              <Badge className="ml-2 bg-red-500">Prioritário</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      if (campaignId) {
                        itemForm.setValue("campaignId", campaignId);
                      }
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Item Necessário</DialogTitle>
                    <DialogDescription>
                      Informe os detalhes do item que precisa ser doado
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...itemForm}>
                    <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
                      <FormField
                        control={itemForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Item</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Água mineral"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={itemForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: unidades, kg, litros"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={itemForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              >
                                {categories?.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value === 1}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? 1 : 2);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Item prioritário</FormLabel>
                              <FormDescription>
                                Marque se este item é urgente ou de alta prioridade
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit">Adicionar Item</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    1
                  </span>
                  <span>
                    Preencha todos os campos obrigatórios da campanha
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    2
                  </span>
                  <span>
                    Adicione pelo menos um item necessário para doação
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    3
                  </span>
                  <span>
                    Marque como urgente se a situação exigir resposta imediata
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    4
                  </span>
                  <span>
                    Após salvar, você poderá gerar QR codes para divulgação
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm;
