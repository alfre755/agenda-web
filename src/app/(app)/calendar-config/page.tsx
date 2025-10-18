"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppButton } from "@/components/AppButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useBackend } from "@/hooks/use-backend-context";

interface CalendarConfig {
  id?: number;
  startDay: string;
  endDay: string;
  startHourCalendar: string;
  endHourCalendar: string;
  slotDurationCalendar: string;
}

export default function CalendarConfigPage() {
  const backendHandler = useBackend();
  const { session } = useAuth();
  const [config, setConfig] = useState<CalendarConfig>({
    startDay: "1",
    endDay: "6",
    startHourCalendar: "08:00",
    endHourCalendar: "18:00",
    slotDurationCalendar: "30",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backendHandler.calendarConfig.listar();
      if (response.success && response.data) {
        setConfig(response.data as CalendarConfig);
      }
    } catch (error) {
      console.error("❌ Error fetching calendar config:", error);
    } finally {
      setLoading(false);
    }
  }, [backendHandler.calendarConfig]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const configData = {
        ...config,
        organizationId: (session as { activeOrganizationId?: string })?.activeOrganizationId || "7eeGNeUgtTOFoaZFOpqadmipluFzPdG5",
      };

      // If we have an existing config, update it; otherwise create a new one
      const response = config.id 
        ? await backendHandler.calendarConfig.modificar({ ...configData, id: config.id })
        : await backendHandler.calendarConfig.crear(configData);
      
      if (response.success) {
        toast.success("Configuración del calendario guardada exitosamente");
        fetchConfig(); // Refresh the data
      } else {
        toast.error("Error al guardar la configuración");
      }
    } catch (error) {
      console.error("❌ Error saving calendar config:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const dayOptions = [
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" },
    { value: "7", label: "Domingo" },
  ];

  const slotDurationOptions = [
    { value: "5", label: "5 minutos" },
    { value: "10", label: "10 minutos" },
    { value: "15", label: "15 minutos" },
    { value: "30", label: "30 minutos" },
    { value: "60", label: "1 hora" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configuración del Calendario</h1>
          <p className="text-muted-foreground">
            Configure los horarios y días de trabajo para su calendario
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Días de Trabajo</CardTitle>
            <CardDescription>
              Seleccione los días de la semana en los que estará disponible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDay">Día de inicio</Label>
                <Select
                  value={config.startDay}
                  onValueChange={(value) => setConfig({ ...config, startDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDay">Día de fin</Label>
                <Select
                  value={config.endDay}
                  onValueChange={(value) => setConfig({ ...config, endDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios de Trabajo</CardTitle>
            <CardDescription>
              Configure las horas de inicio y fin de su jornada laboral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startHour">Hora de inicio</Label>
                <Input
                  id="startHour"
                  type="time"
                  value={config.startHourCalendar}
                  onChange={(e) => setConfig({ ...config, startHourCalendar: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endHour">Hora de fin</Label>
                <Input
                  id="endHour"
                  type="time"
                  value={config.endHourCalendar}
                  onChange={(e) => setConfig({ ...config, endHourCalendar: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Duración de Slots</CardTitle>
            <CardDescription>
              Configure la duración de cada bloque de tiempo en el calendario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slotDuration">Duración de cada slot</Label>
                <Select
                  value={config.slotDurationCalendar}
                  onValueChange={(value) => setConfig({ ...config, slotDurationCalendar: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {slotDurationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <AppButton
          btnType="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar Configuración"}
        </AppButton>
      </div>
    </div>
  );
}
