import { and, eq, gte, lte } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { appointment, client, organization, user } from "@/lib/db/schema";

const TOKEN_ENV_KEY = "EXTERNAL_APPOINTMENTS_TOKEN";

function getConfiguredToken() {
  return process.env[TOKEN_ENV_KEY];
}

function extractToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  const headerToken = request.headers.get("x-api-token");
  if (headerToken) {
    return headerToken.trim();
  }

  return null;
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "No autorizado",
    },
    { status: 401 }
  );
}

function parseDateValue(rawValue: string, { endOfDay }: { endOfDay: boolean }) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawValue);
  const dmyMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(rawValue);

  let year: number;
  let month: number;
  let day: number;

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (dmyMatch) {
    day = Number(dmyMatch[1]);
    month = Number(dmyMatch[2]);
    year = Number(dmyMatch[3]);
  } else {
    return null;
  }

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const hours = endOfDay ? 23 : 0;
  const minutes = endOfDay ? 59 : 0;
  const seconds = endOfDay ? 59 : 0;
  const milliseconds = endOfDay ? 999 : 0;

  const timestamp = Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds);
  return new Date(timestamp);
}

export async function GET(request: NextRequest) {
  try {
    const expectedToken = getConfiguredToken();
    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Servicio no configurado",
        },
        { status: 500 }
      );
    }

    const providedToken = extractToken(request);
    if (!providedToken || providedToken !== expectedToken) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Parámetros startDate y endDate son requeridos",
        },
        { status: 400 }
      );
    }

    const startDate = parseDateValue(startDateParam, { endOfDay: false });
    const endDate = parseDateValue(endDateParam, { endOfDay: true });

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Parámetros de fecha inválidos. Usa formato YYYY-MM-DD o DD-MM-YYYY",
        },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "startDate debe ser menor o igual a endDate",
        },
        { status: 400 }
      );
    }

    const filters = [
      gte(appointment.startHour, startDate),
      lte(appointment.endHour, endDate),
    ];

    const appointments = await db
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
      .where(and(...filters))
      .orderBy(appointment.startHour);

    return NextResponse.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching external appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

