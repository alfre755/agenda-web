"use client";
import { ClockIcon, SaveIcon } from "lucide-react";
import { useEffect,useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useScheduling } from "@/hooks/use-scheduling";

interface ScheduleConfigProps {
  organizationId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export function ScheduleConfig({ organizationId }: ScheduleConfigProps) {
  const { schedules, loadSchedules, saveSchedule, setupDefaultSchedule, loading } = useScheduling();
  const [localSchedules, setLocalSchedules] = useState<Record<number, any>>({});

  useEffect(() => {
    if (organizationId) {
      loadSchedules(organizationId);
    }
  }, [organizationId, loadSchedules]);

  useEffect(() => {
    // Inicializar horarios locales
    const initialSchedules: Record<number, any> = {};
    DAYS_OF_WEEK.forEach(day => {
      const existingSchedule = schedules.find(s => s.dayOfWeek === day.value);
      initialSchedules[day.value] = {
        startTime: existingSchedule?.startTime || "08:00",
        endTime: existingSchedule?.endTime || "18:00",
        isActive: existingSchedule?.isActive ?? (day.value >= 1 && day.value <= 5), // L-V activos por defecto
      };
    });
    setLocalSchedules(initialSchedules);
  }, [schedules]);

  const handleTimeChange = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setLocalSchedules(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  const handleActiveChange = (dayOfWeek: number, isActive: boolean) => {
    setLocalSchedules(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        isActive,
      },
    }));
  };

  const handleSave = async () => {
    try {
      for (const [dayOfWeek, schedule] of Object.entries(localSchedules)) {
        await saveSchedule(organizationId, {
          dayOfWeek: parseInt(dayOfWeek),
          ...schedule,
        });
      }
      toast.success("Horarios guardados correctamente");
    } catch (error) {
      toast.error("Error al guardar los horarios");
    }
  };

  const handleSetupDefault = async () => {
    try {
      await setupDefaultSchedule(organizationId);
      toast.success("Horarios por defecto configurados");
    } catch (error) {
      toast.error("Error al configurar horarios por defecto");
    }
  };

  if (loading) {
    return <div className="p-4">Cargando horarios...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Configuración de Horarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Configura los horarios de atención para cada día de la semana
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSetupDefault}
            disabled={loading}
          >
            Configurar por defecto
          </Button>
        </div>

        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-20">
                <Label className="font-medium">{day.label}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={localSchedules[day.value]?.isActive || false}
                  onCheckedChange={(checked) => handleActiveChange(day.value, checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {localSchedules[day.value]?.isActive ? "Abierto" : "Cerrado"}
                </span>
              </div>

              {localSchedules[day.value]?.isActive && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`start-${day.value}`} className="text-sm">
                      Desde:
                    </Label>
                    <Input
                      id={`start-${day.value}`}
                      type="time"
                      value={localSchedules[day.value]?.startTime || "08:00"}
                      onChange={(e) => handleTimeChange(day.value, "startTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`end-${day.value}`} className="text-sm">
                      Hasta:
                    </Label>
                    <Input
                      id={`end-${day.value}`}
                      type="time"
                      value={localSchedules[day.value]?.endTime || "18:00"}
                      onChange={(e) => handleTimeChange(day.value, "endTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Guardar Horarios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
