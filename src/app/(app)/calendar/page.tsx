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
  const [configLoading, setConfigLoading] = useState(true);

  // Calcular las fechas de inicio y fin de la semana actual
  const getWeekRange = useCallback(() => {
    if (!calendarConfig) return { startDate: null, endDate: null };

    const today = new Date();
    const startDay = parseInt(calendarConfig.startDay);

    // Obtener el lunes de la semana actual
    const monday = new Date(today);
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convertir domingo de 0 a 7
    const daysToMonday = dayOfWeek - 1;
    monday.setDate(today.getDate() - daysToMonday);

    // Ajustar al día de inicio configurado
    const daysToStart = startDay - 1;
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + daysToStart);
    weekStart.setHours(0, 0, 0, 0); // Inicio del día

    // Calcular el final de la semana
    const weekEnd = new Date(weekStart);
    const daysDiff = parseInt(calendarConfig.endDay) - parseInt(calendarConfig.startDay);
    weekEnd.setDate(weekStart.getDate() + daysDiff);
    weekEnd.setHours(23, 59, 59, 999); // Final del día

    return {
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
    };
  }, [calendarConfig]);

  const fetchAppointments = useCallback(async (showLoading = true) => {
    if (!calendarConfig) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      const { startDate, endDate } = getWeekRange();
      
      // Construir URL con query params
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const organizationId = (session as any)?.activeOrganizationId || "7eeGNeUgtTOFoaZFOpqadmipluFzPdG5";
      if (organizationId) params.append("organizationId", organizationId);

      const url = `/api/appointments?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setAppointments(result.data as AppointmentWithRelations[]);
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [calendarConfig, getWeekRange, session]);

  
  const fetchCalendarConfig = useCallback(async () => {
    try {
      setConfigLoading(true);
      const response = await backendHandler.calendarConfig.listar();
      if (response.success && response.data) {
        setCalendarConfig(response.data as any);
      }
    } catch (error) {
      console.error("❌ Error fetching calendarConfig:", error);
    } finally {
      setConfigLoading(false);
    }
  }, [backendHandler.calendarConfig.listar]);

  useEffect(() => {
    if (calendarConfig) {
      fetchAppointments();
    }
  }, [fetchAppointments, calendarConfig]);

  useEffect(() => {
    fetchCalendarConfig();
  }, [fetchCalendarConfig]);

  const handleAppointmentCreated = useCallback(() => {
    // Refrescar la lista de appointments cuando se crea uno nuevo (sin mostrar loading)
    fetchAppointments(false);
  }, [fetchAppointments]);

  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: AppointmentWithRelations["status"]) => {
    try {
      const response = await backendHandler.appointments.modificar({ id: appointmentId, status: newStatus });
      if (response.success) {
        toast.success("Estado actualizado correctamente");
        // Refrescar la lista después del cambio (sin mostrar loading para evitar parpadeo)
        await fetchAppointments(false);
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
      {configLoading || (loading && !calendarConfig) ? (
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
