"use client";
import { useCallback,useState } from "react";

import type { AppointmentFilters, CreateAppointmentData, UpdateAppointmentData } from "@/types/appointments";

import { useBackend } from "./use-backend-context";

export function useAppointments() {
  const backend = useBackend();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listAppointments = useCallback(async (filters?: AppointmentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await backend.appointments.listar(filters);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backend]);

  const getAppointment = useCallback(async (appointmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await backend.appointments.obtener(appointmentId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backend]);

  const createAppointment = useCallback(async (appointmentData: CreateAppointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await backend.appointments.crear(appointmentData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backend]);

  const updateAppointment = useCallback(async (appointmentData: UpdateAppointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await backend.appointments.modificar(appointmentData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backend]);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await backend.appointments.eliminar(appointmentId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backend]);

  // Métodos específicos para el calendario
  const getAppointmentsByDateRange = useCallback(async (
    organizationId: string,
    startDate: string,
    endDate: string
  ) => {
    return listAppointments({
      organizationId,
      startDate,
      endDate,
    });
  }, [listAppointments]);

  const getAppointmentsByClient = useCallback(async (clientId: string) => {
    return listAppointments({
      clientId,
    });
  }, [listAppointments]);

  const updateAppointmentStatus = useCallback(async (
    appointmentId: string,
    status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled"
  ) => {
    return updateAppointment({
      id: appointmentId,
      status,
    });
  }, [updateAppointment]);

  return {
    // Estados
    loading,
    error,
    
    // Métodos CRUD
    listAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    
    // Métodos específicos
    getAppointmentsByDateRange,
    getAppointmentsByClient,
    updateAppointmentStatus,
  };
}
