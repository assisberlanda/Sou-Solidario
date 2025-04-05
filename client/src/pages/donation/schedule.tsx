import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import ChatBot from "@/components/ChatBot";
import { format, addDays, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, ArrowLeft, CalendarDays, Info } from "lucide-react";

interface ScheduleProps {
  onScheduleSubmit: (schedule: { date: string; time: string }) => void;
}

const scheduleFormSchema = z.object({
  date: z.date({
    required_error: "Selecione uma data para coleta",
  }),
  time: z.string({
    required_error: "Selecione um horário para coleta",
  }),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const Schedule = ({ onScheduleSubmit }: ScheduleProps) => {
  const [_, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definir datas permitidas (próximos 14 dias úteis)
  const today = new Date();
  const maxDate = addDays(today, 30);

  // Configurar formulário com validação
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      date: undefined,
      time: "",
    },
  });

  // Função para enviar dados
  const onSubmit = (data: ScheduleFormValues) => {
    setIsSubmitting(true);
    
    const formattedDate = format(data.date, "yyyy-MM-dd");
    onScheduleSubmit({
      date: formattedDate,
      time: data.time,
    });
    
    navigate("/doar/confirmacao");
    setIsSubmitting(false);
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

          <h3 className="text-xl font-heading font-semibold mb-4">
            Agende a coleta da sua doação
          </h3>
          <p className="text-gray-600 mb-6">
            Selecione a data e horário mais convenientes para que possamos coletar sua doação
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <CalendarDays className="h-6 w-6 text-primary mr-2" />
                    <h4 className="font-medium text-lg">Data e Horário</h4>
                  </div>

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mb-4">
                        <FormLabel>Data para Coleta</FormLabel>
                        <FormControl>
                          <div className="pt-2">
                            <DateTimePicker
                              date={field.value}
                              setDate={field.onChange}
                              time={form.watch("time")}
                              setTime={(time) => form.setValue("time", time)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 flex space-x-3 text-amber-800 text-sm">
                    <Info className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <p>
                      As coletas são realizadas de segunda a sexta, das 8h às 18h. 
                      Selecione um horário em que você ou alguém estará disponível 
                      no endereço informado para entregar a doação.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t p-4">
                  <div className="w-full">
                    {form.watch("date") && form.watch("time") && (
                      <p className="text-center text-primary font-medium">
                        Agendamento para {format(form.watch("date"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {form.watch("time")}
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <CardDescription className="text-sm">
                    <strong>Lembre-se:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>É importante que alguém esteja presente no local durante o horário agendado</li>
                      <li>Caso precise reagendar, entre em contato conosco com antecedência</li>
                      <li>Preparamos os itens para facilitar a coleta</li>
                      <li>Nossos coletores estarão devidamente identificados</li>
                    </ul>
                  </CardDescription>
                </CardContent>
              </Card>

              <div className="mt-8 flex justify-between">
                <Link href="/doar/dados">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-medium"
                  disabled={isSubmitting || !form.watch("date") || !form.watch("time")}
                >
                  {isSubmitting ? "Enviando..." : "Continuar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Schedule;
