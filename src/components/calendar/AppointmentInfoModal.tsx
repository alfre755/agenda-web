"use client";

import { Calendar, Clock, FileText,Mail, Phone, User } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Appointment {
  id: string;
  startHour: string;
  endHour: string;
  status: "in-progress" | "completed" | "cancelled";
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

interface AppointmentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
}

export function AppointmentInfoModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
}: AppointmentInfoModalProps) {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in-progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await onDelete(appointment.id);
        toast.success("Cita eliminada exitosamente");
        onClose();
      } catch (error) {
        toast.error("Error al eliminar la cita");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información de la Cita
          </DialogTitle>
          <DialogDescription>
            Detalles de la cita programada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fecha:</span>
              <span className="text-sm">{formatDate(appointment.startHour)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Horario:</span>
              <span className="text-sm">
                {formatTime(appointment.startHour)} - {formatTime(appointment.endHour)}
              </span>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Cliente
            </h4>
            <div className="pl-6 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Nombre:</span>
                <span className="text-sm">{appointment.client?.name || appointment.clientName || 'No especificado'}</span>
              </div>
              
              {appointment.client?.rut || appointment.clientRut ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">RUT:</span>
                  <span className="text-sm">{appointment.client?.rut || appointment.clientRut}</span>
                </div>
              ) : null}

              {appointment.client?.email || appointment.clientEmail ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{appointment.client?.email || appointment.clientEmail}</span>
                </div>
              ) : null}

              {appointment.client?.phone || appointment.clientPhone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Teléfono:</span>
                  <span className="text-sm">{appointment.client?.phone || appointment.clientPhone}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Observaciones */}
          {appointment.observation && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </h4>
              <div className="pl-6">
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {appointment.observation}
                </p>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {onEdit && (
              <Button variant="outline" onClick={handleEdit}>
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
