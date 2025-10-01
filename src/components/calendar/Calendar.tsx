"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
}

interface CalendarProps {
  onDateClick?: (date: Date) => void;
  events?: CalendarEvent[];
}

export default function Calendar({ onDateClick, events = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Primer día del mes y último día
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Generar array de días del mes
  const days = [];
  
  // Días del mes anterior (para completar la primera semana)
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
    });
  }
  
  // Días del mes actual
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = new Date(year, month, day);
    days.push({
      date: day,
      isCurrentMonth: true,
      isToday: today.toDateString() === fullDate.toDateString(),
      fullDate
    });
  }
  
  // Días del siguiente mes (para completar la última semana)
  const remainingDays = 42 - days.length; // 6 semanas * 7 días
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: day,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month + 1, day)
    });
  }
  
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };
  
  const handleDateClick = (day) => {
    if (onDateClick && day.isCurrentMonth) {
      onDateClick(day.fullDate);
    }
  };
  
  const getEventsForDay = (day) => {
    if (!day.isCurrentMonth) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === day.fullDate.toDateString();
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {MONTHS[month]} {year}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Headers de días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Grilla de días */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-1 border border-border rounded-md cursor-pointer
                  transition-colors hover:bg-accent/50
                  ${!day.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
                  ${day.isToday ? 'bg-primary/10 border-primary' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${day.isToday ? 'text-primary font-bold' : ''}
                  ${!day.isCurrentMonth ? 'text-muted-foreground' : ''}
                `}>
                  {day.date}
                </div>
                
                {/* Eventos del día */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <Badge
                      key={eventIndex}
                      variant="secondary"
                      className="text-xs w-full justify-start truncate"
                    >
                      {event.title}
                    </Badge>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
