import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import ChatBot from "@/components/ChatBot";
import { ArrowRight, ArrowLeft, CalendarRange, Clock } from "lucide-react";

interface SchedulePickupProps {
  campaignId: number;
  donationItems: { neededItemId: number; quantity: number }[];
  donorData: any;
  onSubmit: (pickupData: any) => void;
}

const scheduleFormSchema = z.object({
  pickupDate: z.date({
    required_error: "Por favor, selecione uma data para coleta",
  }),
  pickupTime: z.string().min(1, { message: "Por favor, selecione um horário" }),
  instructions: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const SchedulePickup = ({ campaignId, donationItems, donorData, onSubmit }: SchedulePickupProps) => {
  const [_, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");

  // Configurar formulário com validação
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      pickupDate: undefined,
      pickupTime: "",
      instructions: "",
    },
  });

  // Atualizar valores do form quando datas forem alteradas
  const updateDateTimeFields = () => {
    form.setValue("pickupDate", date as Date);
    form.setValue("pickupTime", time);
  };

  // Função para enviar dados
  const handleSubmit = (data: ScheduleFormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit(data);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-4">
            Processo de Doação
          </h2>

          {/* Step Indicator */}
          <div className="flex justify-between mb-8 relative">
            <div className="w-full absolute top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

            {["Selecionar Campanha", "Escolher Itens", "Informar Dados", "Agendar Coleta", "Confirmação"].map(
              (step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index < 4
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center">{step}</span>
                </div>
              )
            )}
          </div>

          <h3 className="text-xl font-heading font-semibold mb-6">
            Agende a coleta da sua doação
          </h3>

          <div className="px-4 py-3 mb-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold mb-2">Dados do Doador:</h4>
            <p><strong>Nome:</strong> {donorData.donorName}</p>
            <p><strong>Endereço:</strong> {donorData.address}, {donorData.city} - {donorData.state}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Data e Hora para Coleta
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormLabel>Data</FormLabel>
                    <DateTimePicker 
                      date={date} 
                      setDate={setDate}
                      time={time}
                      setTime={setTime}
                      disabled={isSubmitting}
                    />
                    <FormDescription>
                      Selecione uma data para coleta dos itens
                    </FormDescription>
                    {form.formState.errors.pickupDate && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {form.formState.errors.pickupDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruções Adicionais (opcional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Informe detalhes importantes para a coleta, como instruções para encontrar o endereço, preferências de horário, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 mt-6 border-t">
                <h4 className="font-medium mb-2">Importante:</h4>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>A coleta será feita por voluntários da campanha</li>
                  <li>Tenha os itens embalados e prontos para a coleta</li>
                  <li>Você receberá uma confirmação por e-mail ou SMS</li>
                  <li>Em caso de imprevistos, entre em contato pelo chat ou telefone</li>
                </ul>
              </div>

              <div className="mt-8 flex justify-between">
                <Link href="/doar/dados">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </Link>
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary-dark text-white font-medium"
                  disabled={isSubmitting || !date || !time}
                  onClick={() => {
                    updateDateTimeFields();
                    form.handleSubmit(handleSubmit)();
                  }}
                >
                  {isSubmitting ? "Enviando..." : "Finalizar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot campaignId={campaignId} />
    </div>
  );
};

export default SchedulePickup;