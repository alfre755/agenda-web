"use client";

import React, { useState } from "react";
import { AppointmentModal } from "./AppointmentModal";
import { AppointmentInfoModal } from "./AppointmentInfoModal";

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

interface TimeSlotProps {
  appointments?: Appointment[];
  startHour: string;
  endHour: string;
  dayDate: Date;
  organizationId?: string;
  onAppointmentCreated?: () => void;
}

function TimeSlot({ 
  appointments, 
  startHour, 
  endHour, 
  dayDate, 
  organizationId,
  onAppointmentCreated 
}: TimeSlotProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleOnClick = () => {
    const filteredAppointments = getFilteredAppointments();
    
    if (filteredAppointments.length > 0) {
      // Si hay appointments, mostrar el modal de información
      setSelectedAppointment(filteredAppointments[0]); // Tomar el primer appointment
      setIsInfoModalOpen(true);
    } else {
      // Si no hay appointments, mostrar el modal de creación
      setIsModalOpen(true);
    }
  };

  // Filtrar appointments que coincidan con este slot de tiempo
  const getFilteredAppointments = () => {
    if (!appointments || appointments.length === 0) return [];

    return appointments.filter((appointment) => {
      // Convertir las fechas del appointment a objetos Date si vienen como string
      const appointmentStart = new Date(appointment.startHour);
      const appointmentEnd = new Date(appointment.endHour);
      
      // Crear las fechas de inicio y fin del slot
      const [startH, startM] = startHour.split(':').map(Number);
      const [endH, endM] = endHour.split(':').map(Number);
      
      const slotStart = new Date(dayDate);
      slotStart.setHours(startH, startM, 0, 0);
      
      const slotEnd = new Date(dayDate);
      slotEnd.setHours(endH, endM, 0, 0);
      
      // Verificar si el appointment se superpone con este slot
      // Un appointment se superpone si:
      // - Su inicio está dentro del slot, O
      // - Su fin está dentro del slot, O  
      // - El slot está completamente dentro del appointment
      return (
        (appointmentStart >= slotStart && appointmentStart < slotEnd) ||
        (appointmentEnd > slotStart && appointmentEnd <= slotEnd) ||
        (appointmentStart <= slotStart && appointmentEnd >= slotEnd)
      );
    });
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <>
      <div
        onClick={handleOnClick}
        className="w-full h-10 rounded-md bg-background border border-border hover:bg-gray-50 cursor-pointer overflow-hidden"
      >
        {filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="p-1">
            {filteredAppointments.map((appointment, index) => {
              // Determinar el color según el estado
              const getStatusColor = (status: string) => {
                switch (status) {
                  case "in-progress":
                    return "bg-blue-100 text-blue-800";
                  case "completed":
                    return "bg-green-100 text-green-800";
                  case "cancelled":
                    return "bg-red-100 text-red-800";
                  default:
                    return "bg-gray-100 text-gray-800";
                }
              };

              return (
                <div
                  key={index}
                  className={`text-xs ${getStatusColor(
                    appointment.status
                  )} rounded px-1`}
                >
                  <div className="font-medium">{appointment.client?.name || appointment.clientName || 'Sin nombre'}</div>
                  <div className="text-xs opacity-75">{appointment.status}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Disponible
          </div>
        )}
      </div>
      
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startHour={startHour}
        endHour={endHour}
        dayDate={dayDate}
        organizationId={organizationId || ""}
        onAppointmentCreated={onAppointmentCreated}
      />

      <AppointmentInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        appointment={selectedAppointment}
        onEdit={(appointment) => {
          // TODO: Implementar edición
          // Por ahora solo cerramos el modal
          setIsInfoModalOpen(false);
        }}
        onDelete={(appointmentId) => {
          // TODO: Implementar eliminación
          // Por ahora solo cerramos el modal
          setIsInfoModalOpen(false);
        }}
      />
    </>
  );
}

export default TimeSlot;
