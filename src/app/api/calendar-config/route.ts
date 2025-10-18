import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar_config } from "@/lib/db/schema";

const ADMIN_ROLES = ["admin", "superadmin"] as const;
const FORBIDDEN_MESSAGE = "Forbidden: Admin access required";

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({ headers: {} });
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    // Check if user has admin or superadmin role
    const userRole = session.user.role;
    if (!ADMIN_ROLES.includes(userRole as "admin" | "superadmin")) {
      return NextResponse.json(
        { success: false, message: FORBIDDEN_MESSAGE, data: null },
        { status: 403 }
      );
    }

    const configs = await db.select().from(calendar_config).orderBy(calendar_config.createdAt);
    
    // Devolver la configuración más reciente o null si no hay ninguna
    const config = configs.length > 0 ? configs[configs.length - 1] : null;
    
    return NextResponse.json({
      success: true,
      data: config,
      message: config ? "Calendar config retrieved successfully" : "No calendar config found"
    });
  } catch (error) {
    console.error("Error fetching calendar config:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching calendar config",
        data: null
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({ headers: {} });
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    // Check if user has admin or superadmin role
    const userRole = session.user.role;
    if (!ADMIN_ROLES.includes(userRole as "admin" | "superadmin")) {
      return NextResponse.json(
        { success: false, message: FORBIDDEN_MESSAGE, data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      calendarId, 
      startDay, 
      endDay, 
      startHourCalendar, 
      endHourCalendar, 
      slotDurationCalendar, 
      createdById 
    } = body;

    const newConfig = await db.insert(calendar_config).values({
      calendarId,
      startDay: startDay || "1",
      endDay: endDay || "6",
      startHourCalendar: startHourCalendar || "08:00",
      endHourCalendar: endHourCalendar || "18:00",
      slotDurationCalendar: slotDurationCalendar || "5",
      createdById,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return NextResponse.json({
      success: true,
      data: newConfig[0],
      message: "Calendar config created successfully"
    });
  } catch (error) {
    console.error("Error creating calendar config:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating calendar config",
        data: null
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({ headers: {} });
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    // Check if user has admin or superadmin role
    const userRole = session.user.role;
    if (!ADMIN_ROLES.includes(userRole as "admin" | "superadmin")) {
      return NextResponse.json(
        { success: false, message: FORBIDDEN_MESSAGE, data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      id, 
      calendarId, 
      startDay, 
      endDay, 
      startHourCalendar, 
      endHourCalendar, 
      slotDurationCalendar 
    } = body;

    const updatedConfig = await db
      .update(calendar_config)
      .set({
        calendarId,
        startDay,
        endDay,
        startHourCalendar,
        endHourCalendar,
        slotDurationCalendar,
        updatedAt: new Date()
      })
      .where(eq(calendar_config.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedConfig[0],
      message: "Calendar config updated successfully"
    });
  } catch (error) {
    console.error("Error updating calendar config:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating calendar config",
        data: null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Calendar config ID is required",
          data: null
        },
        { status: 400 }
      );
    }

    await db.delete(calendar_config).where(eq(calendar_config.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      data: null,
      message: "Calendar config deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting calendar config:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting calendar config",
        data: null
      },
      { status: 500 }
    );
  }
}