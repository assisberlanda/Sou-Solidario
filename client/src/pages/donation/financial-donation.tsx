import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { financialDonationProcessSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2, Wallet, CreditCard, Landmark, QrCode } from "lucide-react";

type FinancialDonationForm = z.infer<typeof financialDonationProcessSchema>;

export default function FinancialDonationPage() {
  const { id } = useParams();
  console.log("ID da campanha (financeira):", id);
  const campaignId = id ? parseInt(id) : 0;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [donation, setDonation] = useState<any>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<FinancialDonationForm>({
    resolver: zodResolver(financialDonationProcessSchema),
    defaultValues: {
      campaignId,
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      amount: 100,
      paymentMethod: "pix",
      message: ""
    }
  });

  const onSubmit = async (data: FinancialDonationForm) => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/financial-donations", data);
      const donationData = await response.json();

      setDonation(donationData);
      setStep(2);
      toast({
        title: "Doação registrada com sucesso!",
        description: "Obrigado pela sua contribuição.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao processar doação",
        description: "Ocorreu um problema ao processar sua doação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'pix':
        return <QrCode className="h-6 w-6" />;
      case 'cartao':
        return <CreditCard className="h-6 w-6" />;
      case 'deposito':
        return <Landmark className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'cartao':
        return 'Cartão de Crédito';
      case 'deposito':
        return 'Depósito Bancário';
      default:
        return method;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-heading font-bold mb-6">Faça uma Doação Financeira</h1>

      {step === 1 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Informações da Doação</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para realizar sua doação financeira.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="donorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome completo" className="bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="donorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu.email@exemplo.com" className="bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="donorPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" className="bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Doação (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          step={1}
                          className="bg-white"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Método de Pagamento</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div>
                            <div className="flex items-center space-x-2 rounded-md border border-gray-300 p-3 hover:bg-gray-50 bg-white">
                              <RadioGroupItem value="pix" id="pix" />
                              <Label htmlFor="pix" className="flex items-center font-medium text-gray-800">
                                <QrCode className="mr-2 h-5 w-5 text-primary" />
                                PIX
                              </Label>
                            </div>
                            {form.watch("paymentMethod") === "pix" && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex flex-col items-center space-y-4">
                                  <img src="/src/assets/images/qr-code-pix.png" alt="QR Code PIX" className="w-48 h-48" />
                                  <div className="text-sm space-y-2 text-center">
                                    <p><span className="font-semibold">Chave PIX:</span> b063400a-533d-4e5f-a845-d8165eb59c1c</p>
                                    <p><span className="font-semibold">Nome:</span> Assis Berlanda de Medeiros</p>
                                    <p><span className="font-semibold">Instituição:</span> Mercado Pago</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 rounded-md border border-gray-300 p-3 hover:bg-gray-50 bg-white">
                            <RadioGroupItem value="cartao" id="cartao" />
                            <Label htmlFor="cartao" className="flex items-center font-medium text-gray-800">
                              <CreditCard className="mr-2 h-5 w-5 text-primary" />
                              Cartão de Crédito
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-md border border-gray-300 p-3 hover:bg-gray-50 bg-white">
                            <RadioGroupItem value="deposito" id="deposito" />
                            <Label htmlFor="deposito" className="flex items-center font-medium text-gray-800">
                              <Landmark className="mr-2 h-5 w-5 text-primary" />
                              Depósito Bancário
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("paymentMethod") === "cartao" && (
                  <div className="space-y-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium">Dados do Cartão</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Número do Cartão</FormLabel>
                        <FormControl>
                          <Input placeholder="0000 0000 0000 0000" className="bg-white" />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>Nome no Cartão</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome como está no cartão" className="bg-white" />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>Data de Validade</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/AA" className="bg-white" />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input type="password" maxLength={4} placeholder="123" className="bg-white" />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deixe uma mensagem para os organizadores da campanha..." 
                          className="bg-white resize-none min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/doar/${campaignId}`)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Processando..." : "Continuar"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 2 && donation && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Doação Registrada!</CardTitle>
            <CardDescription className="text-lg">
              Obrigado por sua contribuição de {formatCurrency(donation.amount)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-gray-100 border border-gray-300 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 flex items-center text-gray-900">
                {getPaymentMethodIcon(donation.paymentMethod)}
                <span className="ml-2">
                  {getPaymentMethodName(donation.paymentMethod)}
                </span>
              </h3>

              {donation.accountInfo && (
                <div className="space-y-4 text-sm">
                  {donation.paymentMethod === 'pix' && (
                    <>
                      <div className="flex flex-col items-center space-y-3">
                        <img src="/src/assets/images/qr-code-pix.png" alt="QR Code PIX" className="w-48 h-48" />
                        <p><span className="font-semibold text-gray-900">Chave PIX:</span> <span className="text-gray-800">82005400149</span></p>
                        <p><span className="font-semibold text-gray-900">Beneficiário:</span> <span className="text-gray-800">Assis Berlanda de Medeiros</span></p>
                        <p className="text-gray-700 mt-1">Faça o pagamento usando o QR Code ou a chave PIX acima. O pagamento é processado instantaneamente.</p>
                      </div>
                    </>
                  )}

                  {donation.paymentMethod === 'deposito' && (
                    <div className="space-y-2">
                      <p><span className="font-semibold text-gray-900">CPF:</span> <span className="text-gray-800">82005400149</span></p>
                      <p><span className="font-semibold text-gray-900">Nome:</span> <span className="text-gray-800">Assis Berlanda de Medeiros</span></p>
                      <p><span className="font-semibold text-gray-900">Banco:</span> <span className="text-gray-800">323 Mercado Pago</span></p>
                      <p><span className="font-semibold text-gray-900">Agência:</span> <span className="text-gray-800">0001</span></p>
                      <p><span className="font-semibold text-gray-900">Conta:</span> <span className="text-gray-800">53750308800</span></p>
                      <p className="text-gray-700 mt-2">
                        Realize o depósito na conta acima. Após o depósito, envie o comprovante para o email contato@sousolidario.org.br
                      </p>
                    </div>
                  )}

                  {donation.paymentMethod === 'cartao' && (
                    <p className="text-gray-700">Pagamento processado via cartão de crédito.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Informações da Doação</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Código da Doação:</span> #{donation.id}</p>
                <p><span className="font-medium">Data:</span> {new Date(donation.createdAt).toLocaleDateString('pt-BR')}</p>
                <p><span className="font-medium">Valor:</span> {formatCurrency(donation.amount)}</p>
                <p><span className="font-medium">Status:</span> <span className="text-amber-600 font-medium">Aguardando pagamento</span></p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(`/doar/${campaignId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a campanha
            </Button>
            <Button onClick={() => navigate("/")}>
              Concluir
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}