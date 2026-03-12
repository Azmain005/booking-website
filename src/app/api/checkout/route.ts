import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatDuration } from "@/lib/utils";
import { createBookingSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse + validate ──────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const {
      serviceId,
      customerName,
      customerEmail,
      bookingDate,
      bookingTime,
      notes,
    } = result.data;

    // ── 2. Verify the service exists ─────────────────────────────────────────
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ── 3. Combine date + time into a single UTC DateTime ────────────────────
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);

    // ── 4. Create PENDING booking (no stripeSessionId yet) ───────────────────
    //
    // We save the booking BEFORE creating the Stripe session so that we have
    // a stable bookingId to embed in Stripe metadata. If Stripe fails, the
    // orphaned PENDING record causes no harm — it never gets CONFIRMED without
    // a successful webhook event.
    //
    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        bookingDate: bookingDateTime,
        notes: notes?.trim() || null,
        status: "PENDING",
        serviceId,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error(
        "NEXT_PUBLIC_BASE_URL (or NEXT_PUBLIC_APP_URL) environment variable is not set",
      );
    }

    // ── 5. Create Stripe Checkout Session ────────────────────────────────────
    //
    // IMPORTANT: We do NOT mark the booking as paid here. Payment is only
    // confirmed through the Stripe webhook (see /api/webhooks/stripe). The
    // success_url is purely cosmetic — a user could manually navigate to it
    // without paying, so it can never be used as authoritative confirmation.
    //
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      // Pre-fill the customer's email so they don't need to type it again
      customer_email: booking.customerEmail,

      line_items: [
        {
          quantity: 1,
          price_data: {
            // service.price is stored in cents (e.g. 8500 = $85.00)
            // Stripe expects unit_amount in the smallest currency unit (cents for USD)
            currency: "usd",
            unit_amount: service.price,
            product_data: {
              name: service.name,
              // Truncated to stay within Stripe's 500-char limit
              description: `${service.description.slice(0, 300)} · ${formatDuration(service.duration)}`,
              ...(service.imageUrl ? { images: [service.imageUrl] } : {}),
            },
          },
        },
      ],

      // bookingId is embedded in metadata so the webhook can find our record
      // when Stripe fires checkout.session.completed.
      metadata: {
        bookingId: booking.id,
      },

      // {CHECKOUT_SESSION_ID} is a Stripe template literal — Stripe substitutes
      // the real session ID into the URL before redirecting the customer.
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel?bookingId=${booking.id}`,

      // Session expires after 30 minutes (Stripe minimum). After expiry the
      // customer cannot complete payment and would need to start over.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    // ── 6. Persist the Stripe session ID against the booking ─────────────────
    //
    // This links our DB record ↔ Stripe session, which the webhook uses to
    // look up the booking when payment completes.
    //
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    // Return only the Stripe-hosted checkout URL — never the secret key or
    // any sensitive server-side data.
    return NextResponse.json({ url: session.url }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
