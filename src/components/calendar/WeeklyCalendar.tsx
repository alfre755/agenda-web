"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Horarios de 8:00 AM a 8:00 PM
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, '0')}:00`;
});

interface WeeklyEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  color?: string;
}

interface WeeklyCalendarProps {
  onTimeSlotClick?: (date: Date, time: string) => void;
  onEventClick?: (event: WeeklyEvent) => void;
  events?: WeeklyEvent[];
}

export default function WeeklyCalendar({ 
  onTimeSlotClick, 
  onEventClick, 
  events = [] 
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Calcular el inicio de la semana (domingo)
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  
  // Generar los 7 días de la semana
  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });
  
  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };
  
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };
  
  const handleTimeSlotClick = (date: Date, time: string) => {
    if (onTimeSlotClick) {
      const [hours] = time.split(':').map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, 0, 0, 0);
      onTimeSlotClick(slotDate, time);
    }
  };
  
  const getEventsForDayAndTime = (date: Date, time: string) => {
    const [hours] = time.split(':').map(Number);
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventDate = eventStart.toDateString();
      const eventHour = eventStart.getHours();
      
      return eventDate === date.toDateString() && eventHour === hours;
    });
  };
  
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Vista Semanal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
            >
              Hoy
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formatWeekRange()}</p>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Header con días de la semana */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 text-sm font-medium text-muted-foreground border-r">
            Hora
          </div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`
                p-3 text-center border-r last:border-r-0
                ${isToday(day) ? 'bg-primary/10 border-primary/20' : ''}
              `}
            >
              <div className={`
                text-sm font-medium
                ${isToday(day) ? 'text-primary' : ''}
              `}>
                {DAYS_OF_WEEK[index]}
              </div>
              <div className={`
                text-lg font-bold
                ${isToday(day) ? 'text-primary' : ''}
              `}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Grid de horarios */}
        <div className="max-h-[600px] overflow-y-auto">
          {TIME_SLOTS.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
              {/* Columna de horario */}
              <div className="p-3 text-sm text-muted-foreground border-r flex items-center">
                {time}
              </div>
              
              {/* Columnas de días */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDayAndTime(day, time);
                
                return (
                  <div
                    key={dayIndex}
                    className={`
                      border-r last:border-r-0 p-1 cursor-pointer
                      hover:bg-accent/50 transition-colors
                      ${isToday(day) ? 'bg-primary/5' : ''}
                    `}
                    onClick={() => handleTimeSlotClick(day, time)}
                  >
                    {dayEvents.length > 0 ? (
                      <div className="space-y-1">
                        {dayEvents.map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className={`
                              p-1 rounded text-xs truncate cursor-pointer
                              ${event.color || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
                            `}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEventClick) {
                                onEventClick(event);
                              }
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-8 w-full" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Resumen de eventos del día */}
        <div className="p-4 border-t bg-muted/30">
          <h4 className="text-sm font-medium mb-2">Eventos de la semana</h4>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              
              return (
                <div key={index} className="space-y-2">
                  <div className={`
                    text-sm font-medium
                    ${isToday(day) ? 'text-primary' : ''}
                  `}>
                    {DAYS_OF_WEEK[index]} {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Sin eventos</div>
                    ) : (
                      dayEvents.map((event, eventIndex) => (
                        <Badge
                          key={eventIndex}
                          variant="secondary"
                          className="text-xs w-full justify-start truncate cursor-pointer"
                          onClick={() => onEventClick?.(event)}
                        >
                          {new Date(event.start).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {event.title}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
