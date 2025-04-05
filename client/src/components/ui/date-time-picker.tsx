import * as React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  time: string;
  disabled?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  time,
  setTime,
  disabled,
}: DateTimePickerProps) {
  // Gerar horários disponíveis (a cada 30 minutos, das 8h às 18h)
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            disabled={(date) => {
              // Desabilitar datas no passado e finais de semana
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const day = date.getDay();
              return date < today || day === 0 || day === 6;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="flex w-full sm:w-[150px]">
        <Select
          value={time}
          onValueChange={setTime}
          disabled={!date || disabled}
        >
          <SelectTrigger className={cn(
            "w-full",
            !time && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}>
            <Clock className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Horário" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
