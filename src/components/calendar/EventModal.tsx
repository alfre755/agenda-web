"use client";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSave: (eventData: EventData) => void;
}

interface EventData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
}

export function EventModal({ isOpen, onClose, selectedDate, onSave }: EventModalProps) {
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    date: selectedDate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventData.title.trim()) {
      onSave(eventData);
      setEventData({
        title: "",
        description: "",
        startTime: "09:00",
        endTime: "10:00",
        date: selectedDate,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Nuevo Evento
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              value={selectedDate}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título del evento *</Label>
            <Input
              id="title"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="Ingresa el título del evento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Descripción del evento (opcional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Hora inicio
              </Label>
              <Input
                id="startTime"
                type="time"
                value={eventData.startTime}
                onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Hora fin
              </Label>
              <Input
                id="endTime"
                type="time"
                value={eventData.endTime}
                onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
