import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authed = await requireAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    serviceName: b.service.name,
    bookingDateIso: b.bookingDate.toISOString(),
    createdAtIso: b.createdAt.toISOString(),
    status: b.status,
    amountPaid: b.amountPaid,
    stripePaymentIntentId: b.stripePaymentIntentId,
  }));

  return NextResponse.json({ rows });
}
