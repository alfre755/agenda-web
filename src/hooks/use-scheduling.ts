"use client";

import { useCallback,useState } from "react";

interface Schedule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  organizationId: string;
}

interface Service {
  id?: string;
  name: string;
  description?: string;
  duration: number; // en minutos
  price: number; // en centavos
  color: string;
  organizationId: string;
}

export function useScheduling() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSchedules = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar-config?organizationId=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSchedule = useCallback(async (organizationId: string, schedule: Omit<Schedule, "organizationId">) => {
    setLoading(true);
    try {
      const response = await fetch("/api/calendar-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          ...schedule,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(prev => {
          const existing = prev.find(s => s.dayOfWeek === schedule.dayOfWeek);
          if (existing) {
            return prev.map(s => s.dayOfWeek === schedule.dayOfWeek ? data.schedule : s);
          } else {
            return [...prev, data.schedule];
          }
        });
        return data.schedule;
      } else {
        throw new Error("Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const setupDefaultSchedule = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      const defaultSchedules = [
        { dayOfWeek: 1, startTime: "08:00", endTime: "18:00", isActive: true }, // Lunes
        { dayOfWeek: 2, startTime: "08:00", endTime: "18:00", isActive: true }, // Martes
        { dayOfWeek: 3, startTime: "08:00", endTime: "18:00", isActive: true }, // Miércoles
        { dayOfWeek: 4, startTime: "08:00", endTime: "18:00", isActive: true }, // Jueves
        { dayOfWeek: 5, startTime: "08:00", endTime: "18:00", isActive: true }, // Viernes
        { dayOfWeek: 6, startTime: "08:00", endTime: "17:00", isActive: true }, // Sábado
        { dayOfWeek: 0, startTime: "09:00", endTime: "13:00", isActive: false }, // Domingo
      ];

      for (const schedule of defaultSchedules) {
        await saveSchedule(organizationId, schedule);
      }
    } catch (error) {
      console.error("Error setting up default schedule:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveSchedule]);

  const loadServices = useCallback(async (organizationId: string) => {
    setLoading(true);
    try {
      // Por ahora, retornamos servicios de ejemplo
      // TODO: Implementar endpoint real para servicios
      const mockServices: Service[] = [
        {
          id: "1",
          name: "Consulta General",
          description: "Consulta médica general",
          duration: 30,
          price: 5000, // $50.00
          color: "#3b82f6",
          organizationId,
        },
        {
          id: "2",
          name: "Consulta Especializada",
          description: "Consulta con especialista",
          duration: 60,
          price: 10000, // $100.00
          color: "#10b981",
          organizationId,
        },
      ];
      setServices(mockServices);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveService = useCallback(async (organizationId: string, service: Omit<Service, "organizationId">) => {
    setLoading(true);
    try {
      // Por ahora, simulamos el guardado
      // TODO: Implementar endpoint real para servicios
      const newService: Service = {
        ...service,
        id: service.id || Date.now().toString(),
        organizationId,
      };

      setServices(prev => {
        if (service.id) {
          return prev.map(s => s.id === service.id ? newService : s);
        } else {
          return [...prev, newService];
        }
      });

      return newService;
    } catch (error) {
      console.error("Error saving service:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schedules,
    services,
    loading,
    loadSchedules,
    saveSchedule,
    setupDefaultSchedule,
    loadServices,
    saveService,
  };
}
