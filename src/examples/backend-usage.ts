/**
 * Ejemplos de uso de la nueva API Backend limpia
 * 
 * Esta API sigue el patrón profesional con métodos estructurados:
 * - backend.entity.accion()
 * - Respuestas consistentes con BackendResponse
 * - Manejo centralizado de errores
 * - Tipos TypeScript seguros
 */

import { useBackend } from "@/hooks/use-backend-context";
import type { AppointmentWithRelations } from "@/types/appointments";

// Ejemplo de uso en un componente React
export function ExampleUsage() {
  const backend = useBackend();

  // ✅ NUEVA FORMA - API estructurada
  const handleCreateAppointment = async () => {
    const response = await backend.appointments.crear({
      clientId: "client_123",
      startHour: new Date(),
      endHour: new Date(Date.now() + 3600000),
      status: "in-progress",
      organizationId: "org_456"
    });

    if (response.success) {
      console.log("✅ Appointment created:", response.data);
    } else {
      console.error("❌ Error:", response.message);
    }
  };

  const handleListAppointments = async () => {
    const response = await backend.appointments.listar();
    
    if (response.success && response.data) {
      const appointments = response.data as AppointmentWithRelations[];
      console.log("📅 Appointments:", appointments);
    }
  };

  const handleUpdateAppointment = async (id: string) => {
    const response = await backend.appointments.modificar({
      id,
      status: "completed"
    });

    if (response.success) {
      console.log("✅ Appointment updated");
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const response = await backend.appointments.eliminar({ id });
    
    if (response.success) {
      console.log("✅ Appointment deleted");
    }
  };

  // Otros ejemplos de entidades
  const handleClientOperations = async () => {
    // Crear cliente
    const createResponse = await backend.clients.crear({
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+1234567890"
    });

    // Listar clientes
    const listResponse = await backend.clients.listar();
    
    // Obtener cliente específico
    const getResponse = await backend.clients.obtener({ id: "client_123" });
    
    // Modificar cliente
    const updateResponse = await backend.clients.modificar({
      id: "client_123",
      name: "Juan Carlos Pérez"
    });
    
    // Eliminar cliente
    const deleteResponse = await backend.clients.eliminar({ id: "client_123" });
  };

  const handleCalendarOperations = async () => {
    // Operaciones con calendarios
    const response = await backend.calendars.listar();
    
    if (response.success) {
      console.log("📅 Calendars:", response.data);
    }
  };

  const handleOrganizationOperations = async () => {
    // Operaciones con organizaciones
    const response = await backend.organizations.listar();
    
    if (response.success) {
      console.log("🏢 Organizations:", response.data);
    }
  };

  return {
    handleCreateAppointment,
    handleListAppointments,
    handleUpdateAppointment,
    handleDeleteAppointment,
    handleClientOperations,
    handleCalendarOperations,
    handleOrganizationOperations
  };
}

/**
 * Ventajas de la nueva API:
 * 
 * 1. 🏗️ Arquitectura Consistente
 *    - Todos los endpoints siguen el mismo patrón
 *    - Fácil de recordar y usar
 * 
 * 2. 📚 Organización Clara
 *    - Entidades agrupadas lógicamente
 *    - Acciones claras (listar, crear, modificar, etc.)
 * 
 * 3. 🎯 Tipos Seguros
 *    - TypeScript completo
 *    - Sin tipos 'any' peligrosos
 * 
 * 4. 🔄 Respuestas Consistentes
 *    - Siempre recibe BackendResponse
 *    - Manejo uniforme de errores
 * 
 * 5. ⚡ Performance
 *    - useMemo y useCallback optimizados
 *    - Sin recreaciones innecesarias
 * 
 * 6. 🛡️ Manejo de Errores
 *    - Errores centralizados
 *    - Notificaciones automáticas
 * 
 * 7. 📖 Mantenible
 *    - Código limpio y documentado
 *    - Fácil agregar nuevos endpoints
 */
