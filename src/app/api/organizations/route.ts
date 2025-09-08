import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema";
import { asc, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Number(searchParams.get("limit") ?? 25);
    const offset = Number(searchParams.get("offset") ?? 0);
    const sortBy = (searchParams.get("sortBy") ?? "createdAt") as string;
    const sortDirection = (searchParams.get("sortDirection") ?? "desc") as "asc" | "desc";

    const orderBy = (() => {
      const dir = sortDirection === "asc" ? asc : desc;
      switch (sortBy) {
        case "name":
          return dir(organization.name);
        case "slug":
          return dir(organization.slug);
        case "createdAt":
        default:
          return dir(organization.createdAt);
      }
    })();

    // Base query
    let base = db.select().from(organization);

    // Apply simple search on name/slug using ILIKE
    if (q) {
      const pattern = `%${q}%`;
      base = db
        .select()
        .from(organization)
        .where(sql`lower(${organization.name}) ilike ${pattern.toLowerCase()} or lower(${organization.slug}) ilike ${pattern.toLowerCase()}`);
    }

    const [{ value: total }] = await db
      .select({ value: sql<number>`count(*)` })
      .from(organization);

    const rows = await base.orderBy(orderBy).limit(limit).offset(offset);

    return NextResponse.json({ organizations: rows, total, limit, offset });
  } catch (error) {
    console.error("GET /api/organizations error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


