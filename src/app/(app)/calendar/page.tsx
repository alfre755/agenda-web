"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import CalendarView from "@/components/calendar/CalendarView";
import { useAuth } from "@/hooks/use-auth";
import { useBackend } from "@/hooks/use-backend-context";
import type { AppointmentWithRelations } from "@/types/appointments";

export default function CalendarPage() {
  const backendHandler = useBackend();
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>(
    []
  );
  console.log(session);
  const [calendarConfig, setCalendarConfig] = useState<any | null>(
    null
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
  }, [backendHandler.appointments.listar]);

  
  const fetchCalendarConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backendHandler.calendarConfig.listar();
      if (response.success && response.data) {
        setCalendarConfig(response.data as any);
      }
    } catch (error) {
      console.error("❌ Error fetching calendarConfig:", error);
    } finally {
      setLoading(false);
    }
  }, [backendHandler.calendarConfig.listar]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchCalendarConfig();
  }, [fetchCalendarConfig]);

  const handleAppointmentCreated = useCallback(() => {
    // Refrescar la lista de appointments cuando se crea uno nuevo
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: AppointmentWithRelations["status"]) => {
    try {
      const response = await backendHandler.appointments.modificar({ id: appointmentId, status: newStatus });
      if (response.success) {
        toast.success("Estado actualizado correctamente");
        await fetchAppointments(); // Refrescar la lista después del cambio
      } else {
        toast.error("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error al actualizar el estado");
    }
  }, [backendHandler.appointments.modificar, fetchAppointments]);

  // Convertir appointments de Date a string para los componentes
  const transformedAppointments = appointments.map((appointment) => ({
    ...appointment,
    startHour: appointment.startHour instanceof Date 
      ? appointment.startHour.toISOString() 
      : typeof appointment.startHour === "string" 
        ? appointment.startHour 
        : new Date(appointment.startHour).toISOString(),
    endHour: appointment.endHour instanceof Date 
      ? appointment.endHour.toISOString() 
      : typeof appointment.endHour === "string" 
        ? appointment.endHour 
        : new Date(appointment.endHour).toISOString(),
  }));

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Cargando eventos...</div>
        </div>
      ) : (
        <div>
          <CalendarView 
            appointments={transformedAppointments} 
            calendarConfig={calendarConfig}
            organizationId={(session as any)?.activeOrganizationId || "7eeGNeUgtTOFoaZFOpqadmipluFzPdG5"}
            onAppointmentCreated={handleAppointmentCreated}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
}
