"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventModal } from "@/components/calendar/EventModal";
import "@/styles/calendar.css";
import esLocale from '@fullcalendar/core/locales/es';

interface EventData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: EventData) => {
    console.log("Evento creado:", eventData);
    // Aquí puedes agregar la lógica para guardar el evento
  };

  return (
    <>
      <FullCalendar
        plugins={[
          resourceTimelinePlugin,
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
        ]}
        locale={esLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,dayGridDay",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          list: "Lista"
        }}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        dateClick={handleDateClick}
        initialEvents={[
          { title: "Evento de ejemplo", start: new Date() },
        ]}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
      />
    </>
  );
}
