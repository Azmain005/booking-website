import { sendBookingConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe webhook handler for checkout.session.completed events.
 *
 * SECURITY: This endpoint verifies the Stripe webhook signature to ensure
 * requests genuinely come from Stripe. Never trust the payload without
 * signature verification.
 *
 * IDEMPOTENCY: Stripe may retry webhooks if we don't return 200 quickly.
 * We check if the booking is already CONFIRMED before processing.
 */
export async function POST(request: NextRequest) {
  // ── 1. Read raw body ──────────────────────────────────────────────────────
  //
  // Stripe's signature is computed over the raw request body. We MUST read
  // the raw string before any JSON parsing. Next.js App Router doesn't auto-
  // parse bodies, so `request.text()` gives us the raw payload.
  //
  let body: string;
  try {
    body = await request.text();
  } catch {
    console.error("[webhook] Failed to read request body");
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // ── 2. Get Stripe signature from headers ──────────────────────────────────
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("[webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not configured");
    // Return 500 (not 400) so Stripe retries when we fix config
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  // ── 3. Verify webhook signature ───────────────────────────────────────────
  //
  // This is the CRITICAL security step. If signature verification fails,
  // we reject the request immediately — it either didn't come from Stripe
  // or was tampered with in transit.
  //
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 },
    );
  }

  // ── 4. Handle checkout.session.completed ──────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(
      `[webhook] Processing checkout.session.completed: ${session.id}`,
    );

    // Extract bookingId from metadata (set in /api/checkout)
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error(
        `[webhook] Missing bookingId in session ${session.id} metadata`,
      );
      // Return 200 so Stripe doesn't retry — this is a permanent error
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // For card payments, checkout.session.completed typically means paid.
    // For some asynchronous payment methods, this event can arrive before the
    // funds are actually captured. We only confirm bookings when Stripe says
    // the session is paid.
    if (session.payment_status !== "paid") {
      console.log(
        `[webhook] Session ${session.id} payment_status=${session.payment_status}; skipping confirmation`,
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      // ── 5. Fetch booking (for email payload) ───────────────────────────────
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          service: {
            select: { name: true, price: true },
          },
        },
      });

      if (!booking) {
        console.error(`[webhook] Booking ${bookingId} not found`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const alreadyConfirmed = booking.status === "CONFIRMED";

      // ── 6. Extract payment details ──────────────────────────────────────────
      //
      // session.payment_intent is an ID string by default. To get the actual
      // amount, we need to expand it or trust session.amount_total.
      // session.amount_total is in cents (for USD) and is safe to use.
      //
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      const amountPaid = session.amount_total ?? booking.service.price;

      // ── 7. Update booking to CONFIRMED ───────────────────────────────────────
      //
      // IDEMPOTENCY (production-safe): use an atomic conditional update.
      // Stripe can retry the same event, and two deliveries could race.
      // We only transition a booking from PENDING→CONFIRMED once.
      //
      const updated = await prisma.booking.updateMany({
        where: {
          id: bookingId,
          status: "PENDING",
          // Prefer matching the session when present, but allow null to avoid
          // a rare race (or partial write) preventing confirmation forever.
          OR: [{ stripeSessionId: session.id }, { stripeSessionId: null }],
        },
        data: {
          status: "CONFIRMED",
          stripePaymentIntentId: paymentIntentId,
          amountPaid,
        },
      });

      const confirmedNow = updated.count === 1;
      if (confirmedNow) {
        console.log(`[webhook] Booking ${bookingId} confirmed successfully`);
      } else if (!alreadyConfirmed) {
        console.log(
          `[webhook] Booking ${bookingId} not updated (already processed, cancelled, or session mismatch).`,
        );
      }

      // ── 8. Send confirmation email ───────────────────────────────────────────
      //
      // IMPORTANT (serverless): do not fire-and-forget — the runtime may freeze
      // immediately after returning a response. Await the send so it actually
      // gets a chance to run.
      //
      // Only send if we haven't sent it yet.
      // We re-fetch the emailSent flag if we didn't confirm in this request,
      // because the booking may already be CONFIRMED from a previous attempt.
      const current = confirmedNow
        ? { confirmationEmailSentAt: booking.confirmationEmailSentAt }
        : await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { confirmationEmailSentAt: true },
          });

      const shouldSendEmail = !current?.confirmationEmailSentAt;
      if (shouldSendEmail && (confirmedNow || alreadyConfirmed)) {
        console.log(
          `[webhook] Sending confirmation email for booking ${bookingId}`,
        );
        try {
          await sendBookingConfirmationEmail({
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            serviceName: booking.service.name,
            bookingDate: booking.bookingDate,
            amount: amountPaid,
            bookingId: booking.id,
          });

          await prisma.booking.update({
            where: { id: bookingId },
            data: { confirmationEmailSentAt: new Date() },
          });
        } catch (emailError) {
          console.error(
            `[webhook] Failed to send confirmation email for booking ${bookingId}:`,
            emailError,
          );
        }
      }

      return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
      console.error(`[webhook] Error processing booking ${bookingId}:`, error);
      // Return 500 so Stripe retries
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }

  // ── Other event types ─────────────────────────────────────────────────────
  //
  // Stripe may send other events to the same webhook URL (e.g.,
  // payment_intent.succeeded, charge.succeeded). We acknowledge but ignore them.
  //
  console.log(`[webhook] Received unhandled event type: ${event.type}`);
  return NextResponse.json({ received: true }, { status: 200 });
}
