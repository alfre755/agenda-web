import { eq } from "drizzle-orm";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointment, client, organization, user } from "@/lib/db/schema";
import { UpdateAppointmentSchema } from "@/types/appointments";

// GET /api/appointments/[id] - Obtener appointment específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: appointmentId } = await params;

    // Obtener appointment con datos relacionados
    const [appointmentData] = await db
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
      .where(eq(appointment.id, appointmentId));

    if (!appointmentData) {
      return NextResponse.json(
        { success: false, error: "Appointment no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointmentData,
    });

  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Actualizar appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: appointmentId } = await params;
    const body = await request.json();
    
    // Validar datos (incluyendo el ID)
    const validatedData = UpdateAppointmentSchema.parse({
      ...body,
      id: appointmentId,
    });

    // Verificar que el appointment existe
    const [existingAppointment] = await db
      .select()
      .from(appointment)
      .where(eq(appointment.id, appointmentId));

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: "Appointment no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos para actualización (solo campos que se enviaron)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.clientId !== undefined) {
      updateData.clientId = validatedData.clientId;
    }
    if (validatedData.startHour !== undefined) {
      updateData.startHour = new Date(validatedData.startHour);
    }
    if (validatedData.endHour !== undefined) {
      updateData.endHour = new Date(validatedData.endHour);
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }
    if (validatedData.observation !== undefined) {
      updateData.observation = validatedData.observation;
    }
    if (validatedData.organizationId !== undefined) {
      updateData.organizationId = validatedData.organizationId;
    }
    if (validatedData.createdById !== undefined) {
      updateData.createdById = validatedData.createdById;
    }

    // Actualizar appointment
    const [updatedAppointment] = await db
      .update(appointment)
      .set(updateData)
      .where(eq(appointment.id, appointmentId))
      .returning();

    // Obtener el appointment actualizado con datos relacionados
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
      .where(eq(appointment.id, appointmentId));

    return NextResponse.json({
      success: true,
      data: appointmentWithRelations,
      message: "Appointment actualizado exitosamente",
    });

  } catch (error) {
    console.error("Error updating appointment:", error);
    
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

// DELETE /api/appointments/[id] - Eliminar appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: appointmentId } = await params;

    // Verificar que el appointment existe
    const [existingAppointment] = await db
      .select()
      .from(appointment)
      .where(eq(appointment.id, appointmentId));

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: "Appointment no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar appointment
    await db
      .delete(appointment)
      .where(eq(appointment.id, appointmentId));

    return NextResponse.json({
      success: true,
      message: "Appointment eliminado exitosamente",
    });

  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
