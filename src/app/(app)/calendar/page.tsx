"use client";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { EventModal } from "@/components/calendar/EventModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDateClick = () => {
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
        <Button onClick={handleDateClick} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Vista del Calendario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendario en desarrollo</h3>
              <p className="text-muted-foreground mb-4">
                Estamos creando un nuevo componente de calendario con las funcionalidades que necesitas.
              </p>
              <Button onClick={handleDateClick} variant="outline">
                Crear Primer Evento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
