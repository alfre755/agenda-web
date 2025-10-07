import { z } from "zod";

// Schema de validación para crear/actualizar appointments
export const CreateAppointmentSchema = z.object({
  clientRut: z.string().min(1, "RUT del cliente es requerido"),
  startHour: z.string().datetime("Fecha de inicio inválida"),
  endHour: z.string().datetime("Fecha de fin inválida"),
  status: z.enum(["in-progress", "completed", "cancelled"]).default("in-progress"),
  observation: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID es requerido"),
  createdById: z.string().optional(),
});

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial().extend({
  id: z.string().min(1, "Appointment ID es requerido"),
});

// Tipos TypeScript generados
export type CreateAppointmentData = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentData = z.infer<typeof UpdateAppointmentSchema>;

// Tipo para appointments con datos relacionados
export interface AppointmentWithRelations {
  id: string;
  clientId: string;
  startHour: Date;
  endHour: Date;
  status: "in-progress" | "completed" | "cancelled";
  observation?: string;
  organizationId: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Datos relacionados (opcionales)
  client?: {
    id: string;
    rut: string;
    name: string;
    email: string;
    phone?: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

// Tipo para filtros de búsqueda
export interface AppointmentFilters {
  organizationId?: string;
  clientId?: string;
  status?: "in-progress" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
  createdById?: string;
}

// Tipo para respuesta de la API
export interface AppointmentResponse {
  success: boolean;
  data?: AppointmentWithRelations | AppointmentWithRelations[];
  error?: string;
  message?: string;
}
