"use client";
import { CalendarIcon, ClockIcon,SettingsIcon } from "lucide-react";
import {useState } from "react";

import { ScheduleConfig } from "@/components/scheduling/ScheduleConfig";
import { ServicesManager } from "@/components/scheduling/ServicesManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export default function SchedulingPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("schedule");

  // Obtener la organización activa del usuario
  const organizationId = session?.user?.activeOrganizationId;

  if (!organizationId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Configuración de Agendamiento</h2>
              <p className="text-muted-foreground">
                Necesitas estar asociado a una organización para configurar el agendamiento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Agendamiento</h1>
        <p className="text-muted-foreground">
          Configura los horarios de atención y servicios para tu organización
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Servicios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <ScheduleConfig organizationId={organizationId} />
          
          <Card>
            <CardHeader>
              <CardTitle>Información sobre Horarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Los horarios definen cuándo tu organización está disponible para recibir citas</p>
              <p>• Puedes configurar diferentes horarios para cada día de la semana</p>
              <p>• Los clientes solo podrán agendar citas durante los horarios configurados</p>
              <p>• Usa "Configurar por defecto" para establecer horarios de oficina estándar (L-V 8:00-18:00)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServicesManager organizationId={organizationId} />
          
          <Card>
            <CardHeader>
              <CardTitle>Información sobre Servicios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Los servicios definen qué puede agendar un cliente</p>
              <p>• Cada servicio tiene una duración específica que se usará para calcular horarios disponibles</p>
              <p>• El precio es opcional y se puede configurar en pesos chilenos</p>
              <p>• Los colores ayudan a identificar visualmente cada servicio en el calendario</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
