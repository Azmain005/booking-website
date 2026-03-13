import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { adminServiceSchema } from "@/lib/validations";

export async function GET() {
  const authed = await requireAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    duration: s.duration,
    imageUrl: s.imageUrl,
    createdAtIso: s.createdAt.toISOString(),
  }));

  return NextResponse.json({ rows }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const authed = await requireAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = adminServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const created = await prisma.service.create({
    data: {
      name: parsed.data.name.trim(),
      description: parsed.data.description.trim(),
      price: Math.round(parsed.data.price * 100),
      duration: parsed.data.duration,
      imageUrl: parsed.data.imageUrl?.trim() || null,
    },
  });

  return NextResponse.json(
    {
      service: {
        id: created.id,
        name: created.name,
        description: created.description,
        price: created.price,
        duration: created.duration,
        imageUrl: created.imageUrl,
        createdAtIso: created.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
