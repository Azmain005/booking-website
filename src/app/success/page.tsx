import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Successful | Serene Wellness",
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

function formatBookingDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatBookingTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  // ── Guard: session_id must look like a real Stripe session ID ──────────────
  // This prevents passing arbitrary strings to the Stripe API.
  if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) {
    notFound();
  }

  // ── Retrieve the Stripe session server-side ───────────────────────────────
  // We use our server-side secret key. This is safe — STRIPE_SECRET_KEY is
  // never exposed to the browser.
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    // Invalid or expired session ID
    notFound();
  }

  // ── Look up our booking from Stripe metadata ──────────────────────────────
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        select: { name: true, duration: true, price: true },
      },
    },
  });

  if (!booking) notFound();

  // payment_status reflects what Stripe knows right now.
  // Our DB status may still say PENDING until the webhook fires —
  // that is intentional and expected.
  const isPaid = session.payment_status === "paid";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Hero icon + heading */}
          <div className="text-center space-y-3">
            <div
              className={cn(
                "inline-flex items-center justify-center w-16 h-16 rounded-full mb-2",
                isPaid
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30",
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-8 w-8",
                  isPaid
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              {isPaid ? "Payment received!" : "Payment is processing…"}
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {isPaid
                ? "Thank you — your booking is being confirmed. You'll receive a confirmation email shortly."
                : "Your payment is processing. We'll send a confirmation email once it's complete."}
            </p>
          </div>

          {/* Booking summary card */}
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Booking summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2 mt-0.5 shrink-0">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{booking.service.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {formatDuration(booking.service.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2 mt-0.5 shrink-0">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {formatBookingDate(booking.bookingDate)}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {formatBookingTime(booking.bookingDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2 mt-0.5 shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {booking.customerEmail}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount paid</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(booking.service.price)}
              </span>
            </div>

            {/* Webhook-pending notice */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2.5 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Your appointment is being confirmed. A confirmation email will
                arrive within a few minutes.
              </p>
            </div>
          </div>

          {/* Reference */}
          <p className="text-center text-xs text-muted-foreground">
            Booking reference:{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
              {booking.id}
            </code>
          </p>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Back to services
          </Link>
        </div>
      </main>
    </div>
  );
}
