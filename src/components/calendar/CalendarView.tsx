"use client";
import React from "react";
import WeeklyView from "./WeeklyView";

interface CalendarViewProps {
  appointments: unknown[];
  calendarConfig: {
    startDay: string;
    endDay: string;
    startHourCalendar: string;
    endHourCalendar: string;
    slotDurationCalendar: string;
  } | null;
  organizationId?: string;
  onAppointmentCreated?: () => void;
}

export default function CalendarView({
  appointments,
  calendarConfig,
  organizationId,
  onAppointmentCreated,
}: CalendarViewProps) {
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendario</h1>
      <div className="calendar">
        <WeeklyView
          appointments={appointments}
          calendarConfig={calendarConfig}
          organizationId={organizationId}
          onAppointmentCreated={onAppointmentCreated}
        />
      </div>
    </div>
  );
}
