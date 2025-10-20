"use client";

import React from "react";

import TimeSlot from "./TimeSlot";

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

interface WeeklyViewProps {
  appointments: Appointment[];
  calendarConfig: {
    startDay: string;
    endDay: string;
    startHourCalendar: string;
    endHourCalendar: string;
    slotDurationCalendar: string;
  } | null;
  organizationId?: string;
  onAppointmentCreated?: () => void;
}

function WeeklyView({ appointments, calendarConfig, organizationId, onAppointmentCreated }: WeeklyViewProps) {
  // Generar días de la semana basados en la configuración
  const generateDays = React.useCallback(() => {
    if (!calendarConfig) return [];
    
    // Mapeo de días de la semana
    const dayNames = {
      "1": "Lunes",
      "2": "Martes",
      "3": "Miércoles",
      "4": "Jueves",
      "5": "Viernes",
      "6": "Sábado",
      "7": "Domingo",
    };
    
    const startDay = parseInt(calendarConfig.startDay);
    const endDay = parseInt(calendarConfig.endDay);
    const days = [];

    for (let day = startDay; day <= endDay; day++) {
      days.push({
        number: day,
        name: dayNames[day.toString() as keyof typeof dayNames],
      });
    }

    return days;
  }, [calendarConfig]);

  // Helpers
  const parseSlotDuration = (val: string | number) => {
    if (typeof val === "number") return val;
    if (!val || typeof val !== "string") return NaN;

    // Si viene como "HH:MM"
    if (val.includes(":")) {
      const [h, m] = val.split(":").map((s) => parseInt(s, 10) || 0);
      return h * 60 + m;
    }

    // Si viene como "30", "30m", "30 min", etc.
    const m = val.match(/(\d+(\.\d+)?)/);
    return m ? Number(m[0]) : NaN;
  };

  const generateTimeSlots = React.useCallback(() => {
    if (!calendarConfig) return [];
    const { startHourCalendar, endHourCalendar, slotDurationCalendar } =
      calendarConfig;

    const slotDuration = parseSlotDuration(slotDurationCalendar);
    const [startH, startM] = (startHourCalendar || "00:00")
      .split(":")
      .map((s) => parseInt(s, 10) || 0);
    const [endH, endM] = (endHourCalendar || "00:00")
      .split(":")
      .map((s) => parseInt(s, 10) || 0);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Validaciones rápidas
    if (!Number.isFinite(slotDuration) || slotDuration <= 0) {
      console.error(
        "❌ slotDuration inválido:",
        slotDurationCalendar,
        "->",
        slotDuration
      );
      return [];
    }
    if (endMinutes <= startMinutes) {
      console.error(
        "❌ rango horario inválido: end <= start",
        startHourCalendar,
        endHourCalendar
      );
      return [];
    }

    const expectedApprox = Math.ceil(
      (endMinutes - startMinutes) / slotDuration
    );

    // Generar slots con tope de seguridad para evitar bucles infinitos
    const slots: { startHour: string; endHour: string }[] = [];
    let current = startMinutes;
    let iterations = 0;
    const maxIterations = expectedApprox + 1000; // margen amplio por seguridad

    while (current < endMinutes && iterations++ < maxIterations) {
      const hh = Math.floor(current / 60);
      const mm = current % 60;
      const startTimeString = `${hh.toString().padStart(2, "0")}:${mm
        .toString()
        .padStart(2, "0")}`;
      
      // Calcular el endHour
      const endMinutesForSlot = current + slotDuration;
      const endHh = Math.floor(endMinutesForSlot / 60);
      const endMm = endMinutesForSlot % 60;
      const endTimeString = `${endHh.toString().padStart(2, "0")}:${endMm
        .toString()
        .padStart(2, "0")}`;

      slots.push({
        startHour: startTimeString,
        endHour: endTimeString
      });

      current += slotDuration;

      // Evitar errores por decimales: redondear a entero de minutos
      current = Math.round(current);
    }

    if (iterations >= maxIterations) {
      console.error(
        "⚠️ alcanzado maxIterations:",
        iterations,
        "— posible bucle infinito o slotDuration demasiado pequeño"
      );
    }

    // Detectar duplicados (si los hay)
    const unique = slots.filter((slot, index, arr) => 
      arr.findIndex(s => s.startHour === slot.startHour) === index
    );
    if (unique.length !== slots.length) {
      const duplicates = slots.filter((slot, i) => 
        slots.findIndex(s => s.startHour === slot.startHour) !== i
      );
      console.warn("⚠️ Se detectaron slots duplicados:", duplicates);
    }

    return unique;
  }, [calendarConfig]);

  // Hooks
  const days = React.useMemo(() => generateDays(), [generateDays]);
  const timeSlots = React.useMemo(() => generateTimeSlots(), [generateTimeSlots]);

  if (!calendarConfig) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          No hay configuración de calendario disponible
        </p>
      </div>
    );
  }

  // Obtener la semana actual
  const getCurrentWeek = () => {
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

    return weekStart;
  };

  const currentWeekStart = getCurrentWeek();

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calcular el final de la semana
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(
    currentWeekStart.getDate() +
      (parseInt(calendarConfig.endDay) - parseInt(calendarConfig.startDay))
  );

  return (
    <div className="p-2 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold">Vista Semanal</h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          {formatDate(currentWeekStart)} - {formatDate(weekEnd)}
        </p>
      </div>

      {/* Mobile: Stack layout */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {days.map((day) => {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(currentWeekStart.getDate() + (day.number - parseInt(calendarConfig.startDay)));
            
            return (
              <div key={day.number} className="border rounded-lg p-3 bg-card">
                <div className="font-medium text-sm mb-3 text-center text-foreground">
                  {day.name} - {dayDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </div>
                <div className="space-y-1">
                  {timeSlots.map((slot) => (
                    <div key={`${day.number}-${slot.startHour}`} className="flex items-center gap-3">
                      <div className="w-14 text-xs text-muted-foreground font-medium flex-shrink-0 text-center">
                        {slot.startHour}
                      </div>
                      <div className="flex-1">
                        <TimeSlot
                          startHour={slot.startHour}
                          endHour={slot.endHour}
                          dayDate={dayDate}
                          appointments={appointments}
                          organizationId={organizationId}
                          onAppointmentCreated={onAppointmentCreated}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablet: Compact horizontal layout */}
      <div className="hidden md:block lg:hidden">
        <div className="overflow-x-auto">
          <div className="flex min-w-max">
            {/* Columna de horas */}
            <div className="w-14 flex-shrink-0">
              <div className="text-xs font-medium text-muted-foreground p-1 h-8 border-b">
                Hora
              </div>
              {timeSlots.map((slot) => (
                <div
                  key={slot.startHour}
                  className="text-xs text-muted-foreground p-1 h-8 border-b flex items-center"
                >
                  {slot.startHour}
                </div>
              ))}
            </div>

            {/* Días */}
            {days.map((day) => {
              const dayDate = new Date(currentWeekStart);
              dayDate.setDate(currentWeekStart.getDate() + (day.number - parseInt(calendarConfig.startDay)));
              
              return (
                <div key={day.number} className="w-20 flex-shrink-0">
                  <div className="text-xs font-medium text-center p-1 h-8 border-b border-l">
                    {day.name}
                  </div>
                  {timeSlots.map((slot) => (
                    <TimeSlot
                      key={`${day.number}-${slot.startHour}`}
                      startHour={slot.startHour}
                      endHour={slot.endHour}
                      dayDate={dayDate}
                      appointments={appointments}
                      organizationId={organizationId}
                      onAppointmentCreated={onAppointmentCreated}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Full grid layout */}
      <div className="hidden lg:flex">
        {/* Columna de horas a la izquierda */}
        <div className="w-16 flex-shrink-0">
          <div className="text-sm font-medium text-muted-foreground p-2 h-12 border-b">
            Hora
          </div>
          {timeSlots.map((slot) => (
            <div
              key={slot.startHour}
              className="text-xs text-muted-foreground p-1 h-10 border-b flex items-center"
            >
              {slot.startHour} - {slot.endHour}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          {/* Headers de días */}
          <div className="flex min-w-max">
            {days.map((day) => (
              <div
                key={day.number}
                className="flex-1 min-w-[120px] text-sm font-medium text-center p-2 border-b border-l"
              >
                {day.name}
              </div>
            ))}
          </div>

          {/* Slots de tiempo para cada día */}
          <div className="space-y-0">
            {timeSlots.map((slot) => (
              <div key={slot.startHour} className="flex min-w-max">
                {days.map((day) => {
                  // Calcular la fecha del día correspondiente
                  const dayDate = new Date(currentWeekStart);
                  dayDate.setDate(currentWeekStart.getDate() + (day.number - parseInt(calendarConfig.startDay)));
                  
                  return (
                    <TimeSlot
                      key={`${day.number}-${slot.startHour}`}
                      startHour={slot.startHour}
                      endHour={slot.endHour}
                      dayDate={dayDate}
                      appointments={appointments}
                      organizationId={organizationId}
                      onAppointmentCreated={onAppointmentCreated}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyView;
