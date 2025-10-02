"use client";
import React from "react";

interface CalendarViewProps {
  appointments: unknown[];
  calendarConfig: unknown[];
}

export default function CalendarView({ appointments }: CalendarViewProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendario</h1>
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-muted-foreground">
          CalendarView component - {appointments.length} appointments loaded
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Este componente se conectará con la API de appointments
        </p>
      </div>
    </div>
  );
}
