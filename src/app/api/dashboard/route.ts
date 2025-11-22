import { and, count, eq, gte, inArray, lte, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { endOfDay, startOfDay, startOfWeek, endOfWeek } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  appointment,
  client,
  member,
  organization,
} from "@/lib/db/schema";

// GET /api/dashboard - Obtener métricas del dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Obtener organizaciones del usuario una sola vez (y sus IDs)
    const userOrgsQuery = db
      .select({
        organizationId: member.organizationId,
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, session.user.id));

    const userOrganizations = await userOrgsQuery;

    if (userOrganizations.length === 0) {
      // Si el usuario no tiene organizaciones, retornar ceros
      return NextResponse.json({
        success: true,
        data: {
          organizations: [],
            totalAppointments: 0,
            appointmentsToday: 0,
            pendingAppointments: 0,
            totalClients: 0,
            completedAppointments: 0,
            confirmedAppointmentsThisWeek: 0,
        },
      });
    }

    const orgIds = userOrganizations.map((m) => m.organizationId);

    // Construir filtros base para appointments
    const appointmentFilters = [];

    // Filtro por organización
    if (organizationId) {
      appointmentFilters.push(eq(appointment.organizationId, organizationId));
    } else {
      appointmentFilters.push(inArray(appointment.organizationId, orgIds));
    }

    // Filtro por rango de fechas (appointments que se solapan con el rango)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Appointment que se solapa: startHour <= endDate AND endHour >= startDate
      appointmentFilters.push(lte(appointment.startHour, end));
      appointmentFilters.push(gte(appointment.endHour, start));
    }

    // Calcular fechas una sola vez
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Domingo

    const baseFilters = appointmentFilters.length > 0 ? and(...appointmentFilters) : undefined;

    // Ejecutar todas las queries en paralelo para mejorar rendimiento
    const [
      totalAppointmentsResult,
      appointmentsTodayResult,
      pendingAppointmentsResult,
      confirmedAppointmentsThisWeekResult,
      completedAppointmentsResult,
      totalClientsResult,
    ] = await Promise.all([
      // 1. Total de Citas (en el rango de fechas)
      db
        .select({ count: count() })
        .from(appointment)
        .where(baseFilters),

      // 2. Citas Hoy
      db
        .select({ count: count() })
        .from(appointment)
        .where(
          and(
            ...appointmentFilters,
            gte(appointment.startHour, todayStart),
            lte(appointment.startHour, todayEnd)
          )
        ),

      // 3. Citas Pendientes (status = "scheduled")
      db
        .select({ count: count() })
        .from(appointment)
        .where(
          and(...appointmentFilters, eq(appointment.status, "scheduled"))
        ),

      // 6. Citas Confirmadas esta semana
      db
        .select({ count: count() })
        .from(appointment)
        .where(
          and(
            ...appointmentFilters,
            eq(appointment.status, "confirmed"),
            gte(appointment.startHour, weekStart),
            lte(appointment.startHour, weekEnd)
          )
        ),

      // 5. Citas Finalizadas (status = "completed")
      db
        .select({ count: count() })
        .from(appointment)
        .where(
          and(...appointmentFilters, eq(appointment.status, "completed"))
        ),

      // 4. Clientes Totales
      organizationId
        ? db
            .select({
              count: sql<number>`COUNT(DISTINCT ${appointment.clientId})`,
            })
            .from(appointment)
            .where(
              and(
                eq(appointment.organizationId, organizationId),
                startDate && endDate
                  ? and(
                      lte(appointment.startHour, new Date(endDate)),
                      gte(appointment.endHour, new Date(startDate))
                    )
                  : undefined
              )
            )
        : db.select({ count: count() }).from(client),
    ]);

    const totalAppointments = totalAppointmentsResult[0]?.count || 0;
    const appointmentsToday = appointmentsTodayResult[0]?.count || 0;
    const pendingAppointments = pendingAppointmentsResult[0]?.count || 0;
    const confirmedAppointmentsThisWeek =
      confirmedAppointmentsThisWeekResult[0]?.count || 0;
    const completedAppointments = completedAppointmentsResult[0]?.count || 0;
    const totalClients = organizationId
      ? Number(totalClientsResult[0]?.count || 0)
      : totalClientsResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
          organizations: userOrganizations.map((org) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
          })),
          totalAppointments,
          appointmentsToday,
          pendingAppointments,
          totalClients,
          completedAppointments,
          confirmedAppointmentsThisWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
