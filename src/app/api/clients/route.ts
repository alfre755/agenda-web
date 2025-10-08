import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { client } from "@/lib/db/schema";

// GET /api/clients - Listar clientes o buscar por RUT
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
    const rut = searchParams.get("rut");

    // Si no hay RUT, listar todos los clientes
    if (!rut) {
      const clients = await db.select().from(client);
      return NextResponse.json({
        success: true,
        data: clients,
        message: "Clientes obtenidos exitosamente"
      });
    }

    // Buscar cliente por RUT - solo verificar existencia
    const existingClient = await db
      .select({ 
        id: client.id,
        rut: client.rut,
        name: client.name,
        email: client.email,
        phone: client.phone
      })
      .from(client)
      .where(eq(client.rut, rut))
      .limit(1);

    if (existingClient.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        exists: false,
        message: "Cliente no encontrado"
      });
    }

    return NextResponse.json({
      success: true,
      data: existingClient[0],
      exists: true,
      message: "Cliente encontrado"
    });

  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Crear nuevo cliente
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
    const { rut, name, email, phone } = body;

    // Validaciones básicas
    if (!rut || !name) {
      return NextResponse.json(
        { success: false, error: "RUT y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el cliente ya existe
    const existingClient = await db
      .select()
      .from(client)
      .where(eq(client.rut, rut))
      .limit(1);

    if (existingClient.length > 0) {
      return NextResponse.json(
        { success: false, error: "Ya existe un cliente con este RUT" },
        { status: 409 }
      );
    }

    // Crear nuevo cliente
    const [newClient] = await db
      .insert(client)
      .values({
        rut,
        name,
        email: email || "",
        phone: phone || "",
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newClient,
      message: "Cliente creado exitosamente"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
