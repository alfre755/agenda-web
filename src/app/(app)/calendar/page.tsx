"use client";
import { useCallback, useEffect, useState } from "react";

import CalendarView from "@/components/calendar/CalendarView";
import { useBackend } from "@/hooks/use-backend-context";
import type { AppointmentWithRelations } from "@/types/appointments";

export default function CalendarPage() {
  const backendHandler = useBackend();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backendHandler.appointments.listar();
      if (response.success && response.data) {
        setAppointments(response.data as AppointmentWithRelations[]);
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [backendHandler]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Cargando eventos...</div>
        </div>
      ) : (
        <div>
          <CalendarView appointments={appointments} calendarConfig={[]} />
        </div>
      )}
    </div>
  );
}
