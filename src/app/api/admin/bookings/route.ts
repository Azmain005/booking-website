import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const authed = await requireAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Best-effort payment reconciliation.
  // If webhooks are not configured (common in dev / misconfigured prod),
  // pending bookings can remain "Unpaid" even when Stripe says the session is paid.
  // This reconciles a small window of recent PENDING bookings.
  try {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2); // 48 hours
    const pending = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        stripeSessionId: { not: null },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        service: { select: { name: true, price: true } },
      },
    });

    for (const b of pending) {
      const sessionId = b.stripeSessionId;
      if (!sessionId) continue;

      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch {
        continue;
      }

      // Extra safety: only act if Stripe metadata points back to this booking.
      if (session.metadata?.bookingId !== b.id) continue;
      if (session.payment_status !== "paid") continue;

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      const amountPaid = session.amount_total ?? b.service.price;

      const updated = await prisma.booking.updateMany({
        where: { id: b.id, status: "PENDING" },
        data: {
          status: "CONFIRMED",
          stripePaymentIntentId: paymentIntentId,
          amountPaid,
        },
      });

      // Send email once, after confirmation.
      if (
        (updated.count === 1 || b.status === "CONFIRMED") &&
        !b.confirmationEmailSentAt
      ) {
        try {
          await sendBookingConfirmationEmail({
            customerName: b.customerName,
            customerEmail: b.customerEmail,
            serviceName: b.service.name,
            bookingDate: b.bookingDate,
            amount: amountPaid,
            bookingId: b.id,
          });

          await prisma.booking.update({
            where: { id: b.id },
            data: { confirmationEmailSentAt: new Date() },
          });
        } catch {
          // Ignore here; webhook/success page may retry later.
        }
      }
    }
  } catch {
    // Ignore reconciliation failures; admin list should still load.
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
