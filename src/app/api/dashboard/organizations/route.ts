import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { member, organization } from "@/lib/db/schema";

// GET /api/dashboard/organizations - Obtener organizaciones del usuario
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

    // Obtener todas las organizaciones del usuario
    const userOrganizations = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
      })
      .from(organization)
      .innerJoin(member, eq(organization.id, member.organizationId))
      .where(eq(member.userId, session.user.id));

    return NextResponse.json({
      success: true,
      data: userOrganizations,
    });
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
