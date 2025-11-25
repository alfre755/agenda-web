import { and, desc,eq, gte, lte } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointment, client, organization, user } from "@/lib/db/schema";
import { CreateAppointmentSchema } from "@/types/appointments";

// GET /api/appointments - Listar appointments
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
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Construir filtros
    const filters = [];
    
    if (organizationId) {
      filters.push(eq(appointment.organizationId, organizationId));
    }
    
    if (clientId) {
      filters.push(eq(appointment.clientId, parseInt(clientId)));
    }
    
    if (status) {
      filters.push(eq(appointment.status, status as "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled"));
    }
    
    // Filtrar appointments que se solapen con el rango de fechas
    // Un appointment se solapa si: empieza antes del final del rango Y termina después del inicio del rango
    if (startDate && endDate) {
      // Appointment que se solapa: startHour <= endDate AND endHour >= startDate
      filters.push(lte(appointment.startHour, new Date(endDate)));
      filters.push(gte(appointment.endHour, new Date(startDate)));
    } else if (startDate) {
      // Si solo hay startDate, mostrar appointments que terminen después de esa fecha
      filters.push(gte(appointment.endHour, new Date(startDate)));
    } else if (endDate) {
      // Si solo hay endDate, mostrar appointments que empiecen antes de esa fecha
      filters.push(lte(appointment.startHour, new Date(endDate)));
    }

    // Consulta con JOINs para obtener datos relacionados
    const appointments = await db
      .select({
        // Datos del appointment
        id: appointment.id,
        clientId: appointment.clientId,
        startHour: appointment.startHour,
        endHour: appointment.endHour,
        status: appointment.status,
        observation: appointment.observation,
        organizationId: appointment.organizationId,
        createdById: appointment.createdById,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        
        // Datos del cliente
        clientRut: client.rut,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        
        // Datos de la organización
        organizationName: organization.name,
        
        // Datos del creador
        createdByName: user.name,
        createdByEmail: user.email,
      })
      .from(appointment)
      .leftJoin(client, eq(appointment.clientId, client.id))
      .leftJoin(organization, eq(appointment.organizationId, organization.id))
      .leftJoin(user, eq(appointment.createdById, user.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(appointment.startHour))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: appointments,
    });

  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Crear appointment
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validar datos
    const validatedData = CreateAppointmentSchema.parse(body);

    // Buscar cliente por RUT (debe existir previamente)
    const existingClient = await db
      .select()
      .from(client)
      .where(eq(client.rut, validatedData.clientRut))
      .limit(1);

    if (existingClient.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado. Debe crear el cliente primero." },
        { status: 404 }
      );
    }

    const clientRecord = existingClient[0];

    // Crear appointment (el ID se genera automáticamente)
    const [newAppointment] = await db
      .insert(appointment)
      .values({
        clientId: clientRecord.id,
        startHour: new Date(validatedData.startHour),
        endHour: new Date(validatedData.endHour),
        status: validatedData.status,
        observation: validatedData.observation,
        organizationId: validatedData.organizationId,
        createdById: validatedData.createdById || session.user.id,
      })
      .returning();

    // Obtener el appointment con datos relacionados
    const [appointmentWithRelations] = await db
      .select({
        id: appointment.id,
        clientId: appointment.clientId,
        startHour: appointment.startHour,
        endHour: appointment.endHour,
        status: appointment.status,
        observation: appointment.observation,
        organizationId: appointment.organizationId,
        createdById: appointment.createdById,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        
        // Datos del cliente
        clientRut: client.rut,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        
        // Datos de la organización
        organizationName: organization.name,
        
        // Datos del creador
        createdByName: user.name,
        createdByEmail: user.email,
      })
      .from(appointment)
      .leftJoin(client, eq(appointment.clientId, client.id))
      .leftJoin(organization, eq(appointment.organizationId, organization.id))
      .leftJoin(user, eq(appointment.createdById, user.id))
      .where(eq(appointment.id, newAppointment.id));

    return NextResponse.json({
      success: true,
      data: appointmentWithRelations,
      message: "Appointment creado exitosamente",
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating appointment:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
