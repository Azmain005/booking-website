import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { adminServiceSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authed = await requireAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

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

  try {
    const updated = await prisma.service.update({
      where: { id },
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
          id: updated.id,
          name: updated.name,
          description: updated.description,
          price: updated.price,
          duration: updated.duration,
          imageUrl: updated.imageUrl,
          createdAtIso: updated.createdAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
}
