"use client";

import React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { useAppointments } from "@/hooks/use-appointments";
import { useBackend } from "@/hooks/use-backend-context";
import type { CreateAppointmentData } from "@/types/appointments";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  startHour: string;
  endHour: string;
  dayDate: Date;
  organizationId: string;
  onAppointmentCreated?: () => void;
}

export function AppointmentModal({
  isOpen,
  onClose,
  startHour,
  endHour,
  dayDate,
  organizationId,
  onAppointmentCreated,
}: AppointmentModalProps) {
  const { createAppointment, loading } = useAppointments();
  const backend = useBackend();

  const handleSubmit = async (data: {
    clientRut: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    observation?: string;
    status: "in-progress" | "completed" | "cancelled";
  }) => {
    try {
      // Crear las fechas de inicio y fin del appointment
      const [startH, startM] = startHour.split(':').map(Number);
      const [endH, endM] = endHour.split(':').map(Number);
      
      const appointmentStart = new Date(dayDate);
      appointmentStart.setHours(startH, startM, 0, 0);
      
      const appointmentEnd = new Date(dayDate);
      appointmentEnd.setHours(endH, endM, 0, 0);

      // Primero, verificar si el cliente existe, si no, crearlo
      let clientExists = false;
      try {
        // Intentar obtener el cliente por RUT
        const existingClient = await backend.clients.obtener(data.clientRut);
        if (existingClient) {
          clientExists = true;
        }
      } catch {
        // El cliente no existe, lo crearemos
        console.warn("Cliente no encontrado, se creará uno nuevo");
      }

      // Si el cliente no existe, crearlo
      if (!clientExists) {
        await backend.clients.crear({
          rut: data.clientRut,
          name: data.clientName,
          email: data.clientEmail || "",
          phone: data.clientPhone || "",
          organizationId: organizationId || "default-org-id",
        });
      }

      // Preparar los datos del appointment
      const appointmentData: CreateAppointmentData = {
        clientRut: data.clientRut,
        startHour: appointmentStart.toISOString(),
        endHour: appointmentEnd.toISOString(),
        status: data.status,
        observation: data.observation,
        organizationId,
      };

      await createAppointment(appointmentData);
      
      toast.success("Appointment creado exitosamente");
      onClose();
      onAppointmentCreated?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error al crear el appointment");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Appointment</DialogTitle>
          <DialogDescription>
            Crear un appointment para el {dayDate.toLocaleDateString("es-ES")} de {startHour} a {endHour}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          onSubmit={handleSubmit}
          disabled={loading}
          submitText={loading ? "Creando..." : "Crear Appointment"}
        />
      </DialogContent>
    </Dialog>
  );
}
