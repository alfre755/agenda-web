"use client";

import React from "react";
import { toast } from "sonner";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { ClientModal } from "@/components/modals/ClientModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [showClientModal, setShowClientModal] = React.useState(false);
  const [pendingRut, setPendingRut] = React.useState("");

  const handleSubmit = async (data: {
    clientRut: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    observation?: string;
    status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
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
        toast.info("Cliente no encontrado, se creará uno nuevo");
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
        toast.success("Cliente creado exitosamente");
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
      
      toast.success("Cita creada exitosamente");
      onClose();
      onAppointmentCreated?.();
    } catch (error) {
      toast.error("Error al crear la cita");
    }
  };

  const handleClose = () => {
    setShowClientModal(false);
    setPendingRut("");
    onClose();
  };

  const handleClientNotFound = (rut: string) => {
    setPendingRut(rut);
    setShowClientModal(true);
  };

  const handleClientCreated = (client: any) => {
    setShowClientModal(false);
    setPendingRut("");
    // Actualizar el formulario con los datos del cliente recién creado
    if ((window as any).updateFormWithClientData) {
      (window as any).updateFormWithClientData(client);
    }
    toast.success("Cliente creado exitosamente. Formulario actualizado.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>
            Crear una cita para el {dayDate.toLocaleDateString("es-ES")} de {startHour} a {endHour}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          onSubmit={handleSubmit}
          onClientNotFound={handleClientNotFound}
          onClientCreated={handleClientCreated}
          disabled={loading}
          submitText={loading ? "Creando..." : "Crear Cita"}
        />
      </DialogContent>

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientCreated={handleClientCreated}
        initialRut={pendingRut}
      />
    </Dialog>
  );
}
