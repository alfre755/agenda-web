import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { CreateAppointmentSchema } from "@/types/appointments";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointment, client, organization, user } from "@/lib/db/schema";

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
      filters.push(eq(appointment.status, status as "in-progress" | "completed" | "cancelled"));
    }
    
    if (startDate) {
      filters.push(gte(appointment.startHour, new Date(startDate)));
    }
    
    if (endDate) {
      filters.push(lte(appointment.endHour, new Date(endDate)));
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
        clientId: client.id,
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

    // Crear appointment (el ID se genera automáticamente)
    const [newAppointment] = await db
      .insert(appointment)
      .values({
        clientId: validatedData.clientId,
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
        
        clientId: client.id,
        clientRut: client.rut,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        organizationName: organization.name,
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
