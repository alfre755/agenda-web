"use client";

import React from "react";

import WeeklyView from "./WeeklyView";

interface Appointment {
  id: string;
  startHour: string;
  endHour: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
  observation?: string;
  client?: {
    name: string;
    rut: string;
    email?: string;
    phone?: string;
  };
  clientName?: string;
  clientRut?: string;
  clientEmail?: string;
  clientPhone?: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  calendarConfig: {
    startDay: string;
    endDay: string;
    startHourCalendar: string;
    endHourCalendar: string;
    slotDurationCalendar: string;
  } | null;
  organizationId?: string;
  onAppointmentCreated?: () => void;
  onStatusChange?: (appointmentId: string, newStatus: Appointment["status"]) => void | Promise<void>;
}

export default function CalendarView({
  appointments,
  calendarConfig,
  organizationId,
  onAppointmentCreated,
  onStatusChange,
}: CalendarViewProps) {
 
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Calendario</h1>
      <div className="calendar">
        <WeeklyView
          appointments={appointments}
          calendarConfig={calendarConfig}
          organizationId={organizationId}
          onAppointmentCreated={onAppointmentCreated}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
