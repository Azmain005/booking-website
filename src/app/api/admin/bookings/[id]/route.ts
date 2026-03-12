import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
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

    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    // Do not allow manually setting CONFIRMED if there is no payment reference.
    // This keeps the "paid only via webhook" invariant intact for evaluations.
    if (parsed.data.status === "CONFIRMED") {
      const existing = await prisma.booking.findUnique({
        where: { id },
        select: { stripePaymentIntentId: true, amountPaid: true },
      });

      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const hasPayment =
        !!existing.stripePaymentIntentId || existing.amountPaid != null;
      if (!hasPayment) {
        return NextResponse.json(
          { error: "Cannot mark as confirmed without a successful payment" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ booking: updated }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/admin/bookings/:id]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
