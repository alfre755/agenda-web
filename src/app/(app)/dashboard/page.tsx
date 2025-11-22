"use client";

import * as React from "react";

import { endOfMonth, startOfMonth } from "date-fns";
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Users,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardMetrics {
  totalAppointments: number;
  appointmentsToday: number;
  pendingAppointments: number;
  totalClients: number;
  completedAppointments: number;
  confirmedAppointmentsThisWeek: number;
}

interface Organization {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
}

export default function DashboardPage() {
  // Calcular el rango por defecto: desde el día 1 del mes actual hasta el último día
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  };

  const [organizationId, setOrganizationId] = React.useState<string>("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    getDefaultDateRange()
  );
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    totalAppointments: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    totalClients: 0,
    completedAppointments: 0,
    confirmedAppointmentsThisWeek: 0,
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true);

  // Cargar métricas y organizaciones cuando cambien los filtros
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingMetrics(true);
        const params = new URLSearchParams();

        if (organizationId) {
          params.append("organizationId", organizationId);
        }

        if (dateRange?.from) {
          params.append("startDate", dateRange.from.toISOString());
        }

        if (dateRange?.to) {
          params.append("endDate", dateRange.to.toISOString());
        }

        const response = await fetch(`/api/dashboard?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error al cargar datos del dashboard");
        }

        const result = await response.json();

        if (result.success) {
          // El endpoint ahora devuelve tanto métricas como organizaciones
          if (result.data.organizations) {
            setOrganizations(result.data.organizations);
          }
          setMetrics({
            totalAppointments: result.data.totalAppointments || 0,
            appointmentsToday: result.data.appointmentsToday || 0,
            pendingAppointments: result.data.pendingAppointments || 0,
            totalClients: result.data.totalClients || 0,
            completedAppointments: result.data.completedAppointments || 0,
            confirmedAppointmentsThisWeek:
              result.data.confirmedAppointmentsThisWeek || 0,
          });
        } else {
          throw new Error(result.error || "Error desconocido");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al cargar los datos del dashboard"
        );
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchDashboardData();
  }, [organizationId, dateRange]);

  return (
    <div className="space-y-4">
      {/* Header con título y filtros */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        {/* Filtros minimalistas */}
        <DashboardFilters
          organizationId={organizationId}
          dateRange={dateRange}
          onOrganizationChange={setOrganizationId}
          onDateRangeChange={setDateRange}
          organizations={organizations}
          className="ml-auto"
        />
      </div>

      {/* Tabs para cambiar entre métricas e informes */}
      <Tabs defaultValue="informes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informes" className="gap-2">
            <FileText className="h-4 w-4" />
            Informes
          </TabsTrigger>
          <TabsTrigger value="graficas" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficas
          </TabsTrigger>
        </TabsList>

        {/* Tab de Informes - Métricas */}
        <TabsContent value="informes" className="space-y-4">
          {isLoadingMetrics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-xl border p-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total de Citas"
                value={metrics.totalAppointments}
                description="Total de citas registradas"
                icon={Calendar}
                iconColor="hsl(var(--chart-1))"
              />

              <MetricCard
                title="Citas Hoy"
                value={metrics.appointmentsToday}
                description="Citas programadas para hoy"
                icon={CalendarCheck}
                iconColor="hsl(var(--chart-2))"
              />

              <MetricCard
                title="Citas Pendientes"
                value={metrics.pendingAppointments}
                description="Citas pendientes de confirmación"
                icon={Clock}
                iconColor="hsl(var(--chart-3))"
              />

              <MetricCard
                title="Clientes Totales"
                value={metrics.totalClients}
                description="Total de clientes registrados"
                icon={Users}
                iconColor="hsl(var(--chart-4))"
              />

              <MetricCard
                title="Citas Finalizadas"
                value={metrics.completedAppointments}
                description="Citas completadas en el rango de fechas"
                icon={CheckCircle2}
                iconColor="hsl(var(--chart-5))"
              />

              <MetricCard
                title="Citas Confirmadas"
                value={metrics.confirmedAppointmentsThisWeek}
                description="Citas confirmadas esta semana"
                icon={UserCheck}
                iconColor="hsl(var(--primary))"
              />
            </div>
          )}
        </TabsContent>

        {/* Tab de Gráficas - Power BI */}
        <TabsContent value="graficas" className="space-y-4">
          <div className="w-full">
            <iframe
              title="Lista P y Backorder"
              src="https://app.powerbi.com/view?r=eyJrIjoiYjY1YjRhMmQtYzJhMC00NDc4LTlhMDgtYzE3MmFhMDVkNWUyIiwidCI6IjY5OWEwNzlmLTk3ODItNDMzNy1hMTUxLTg3MDhiMDBkOTA2ZSJ9"
              allowFullScreen
              className="w-full h-[600px] rounded border"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
