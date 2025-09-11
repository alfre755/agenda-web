"use client";
import { useState, useEffect } from "react";
import { useBackend } from "./use-backend";

interface OrganizationSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // en minutos
  price?: number; // en centavos
  color: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  start: string;
  end: string;
  status: "confirmed" | "cancelled" | "completed";
  notes?: string;
  service?: Service;
}

interface Availability {
  id: string;
  type: "blocked" | "special_hours" | "break";
  title: string;
  start: string;
  end: string;
  isRecurring: boolean;
  recurringPattern?: any;
}

export function useScheduling() {
  const { get, post } = useBackend();
  const [schedules, setSchedules] = useState<OrganizationSchedule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar horarios de la organización
  const loadSchedules = async (organizationId: string) => {
    try {
      setLoading(true);
      const data = await get(`/api/organizations/${organizationId}/schedules`);
      setSchedules(data);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar servicios de la organización
  const loadServices = async (organizationId: string) => {
    try {
      setLoading(true);
      const data = await get(`/api/organizations/${organizationId}/services`);
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas de la organización
  const loadAppointments = async (organizationId: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);
      
      const data = await get(`/api/organizations/${organizationId}/appointments?${params}`);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Crear/actualizar horario
  const saveSchedule = async (organizationId: string, schedule: Partial<OrganizationSchedule>) => {
    try {
      const data = await post(`/api/organizations/${organizationId}/schedules`, schedule);
      await loadSchedules(organizationId);
      return data;
    } catch (error) {
      console.error("Error saving schedule:", error);
      throw error;
    }
  };

  // Crear/actualizar servicio
  const saveService = async (organizationId: string, service: Partial<Service>) => {
    try {
      const data = await post(`/api/organizations/${organizationId}/services`, service);
      await loadServices(organizationId);
      return data;
    } catch (error) {
      console.error("Error saving service:", error);
      throw error;
    }
  };

  // Crear cita
  const createAppointment = async (organizationId: string, appointment: Partial<Appointment>) => {
    try {
      const data = await post(`/api/organizations/${organizationId}/appointments`, appointment);
      await loadAppointments(organizationId);
      return data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  };

  // Obtener horarios disponibles para un servicio en una fecha específica
  const getAvailableSlots = async (
    organizationId: string, 
    serviceId: string, 
    date: string
  ) => {
    try {
      const data = await get(
        `/api/organizations/${organizationId}/available-slots?serviceId=${serviceId}&date=${date}`
      );
      return data;
    } catch (error) {
      console.error("Error getting available slots:", error);
      throw error;
    }
  };

  // Configurar horarios por defecto (Lunes a Viernes 8:00-18:00)
  const setupDefaultSchedule = async (organizationId: string) => {
    const defaultSchedules = [
      { dayOfWeek: 1, startTime: "08:00", endTime: "18:00" }, // Lunes
      { dayOfWeek: 2, startTime: "08:00", endTime: "18:00" }, // Martes
      { dayOfWeek: 3, startTime: "08:00", endTime: "18:00" }, // Miércoles
      { dayOfWeek: 4, startTime: "08:00", endTime: "18:00" }, // Jueves
      { dayOfWeek: 5, startTime: "08:00", endTime: "18:00" }, // Viernes
    ];

    try {
      for (const schedule of defaultSchedules) {
        await saveSchedule(organizationId, schedule);
      }
    } catch (error) {
      console.error("Error setting up default schedule:", error);
      throw error;
    }
  };

  return {
    // Estado
    schedules,
    services,
    appointments,
    availability,
    loading,

    // Acciones
    loadSchedules,
    loadServices,
    loadAppointments,
    saveSchedule,
    saveService,
    createAppointment,
    getAvailableSlots,
    setupDefaultSchedule,
  };
}
