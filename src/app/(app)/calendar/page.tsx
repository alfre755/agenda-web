"use client";
import { useState } from "react";
import { PlusIcon, Calendar as CalendarIcon, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventModal } from "@/components/calendar/EventModal";
import Calendar from "@/components/calendar/Calendar";
import WeeklyCalendar from "@/components/calendar/WeeklyCalendar";

interface EventData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events] = useState([
    // Ejemplo de eventos para mostrar
    {
      id: "1",
      title: "Reunión de equipo",
      start: new Date(2024, 11, 15, 10, 0), // 15 de diciembre, 10:00
    },
    {
      id: "2", 
      title: "Presentación proyecto",
      start: new Date(2024, 11, 20, 14, 30), // 20 de diciembre, 14:30
    }
  ]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (_eventData: EventData) => {
    // TODO: Implementar guardado en base de datos
    // console.warn("Evento creado:", _eventData);
    // Aquí puedes agregar la lógica para guardar el evento
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona tus eventos y citas
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <WeeklyCalendar 
        onDateClick={handleDateClick}
        events={events}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate.toISOString().split('T')[0]}
        onSave={handleSaveEvent}
      />
    </div>
  );
}