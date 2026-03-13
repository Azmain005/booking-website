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
import { sendBookingConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Successful",
  description:
    "Your booking has been confirmed. Check your email for booking details and prepare for your wellness experience.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Payment Successful | Serene Wellness",
    description:
      "Your booking has been confirmed. Check your email for booking details and prepare for your wellness experience.",
    type: "website",
  },
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

  // Guard: session_id must look like a real Stripe session ID.
  // This prevents passing arbitrary strings to the Stripe API.
  if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) {
    notFound();
  }

  // Retrieve the Stripe session server-side.
  // We use our server-side secret key. This is safe - STRIPE_SECRET_KEY is
  // never exposed to the browser.
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    // Invalid or expired session ID
    notFound();
  }

  // Look up our booking from Stripe metadata.
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
  // Our DB status may still say PENDING until the webhook fires -
  // that is intentional and expected.
  const isPaid = session.payment_status === "paid";

  // Fallback reconciliation.
  // If the webhook is delayed/misconfigured, reconcile here using Stripe's
  // server-side session lookup. This keeps admin/payment state consistent and
  // ensures the confirmation email can still be delivered.
  if (isPaid && booking.status === "PENDING") {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const amountPaid = session.amount_total ?? booking.service.price;

    const updated = await prisma.booking.updateMany({
      where: {
        id: booking.id,
        status: "PENDING",
      },
      data: {
        status: "CONFIRMED",
        stripePaymentIntentId: paymentIntentId,
        amountPaid,
      },
    });

    // Send email only once.
    if (updated.count === 1 && !booking.confirmationEmailSentAt) {
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
          where: { id: booking.id },
          data: { confirmationEmailSentAt: new Date() },
        });
      } catch (emailError) {
        console.error(
          `[success] Failed to send confirmation email for booking ${booking.id}:`,
          emailError,
        );
      }
    }
  }

  // If the webhook confirmed payment but email failed, allow a single retry
  // when the customer lands on the success page.
  if (
    isPaid &&
    booking.status === "CONFIRMED" &&
    !booking.confirmationEmailSentAt
  ) {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const amountPaid = session.amount_total ?? booking.service.price;

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
        where: { id: booking.id },
        data: {
          stripePaymentIntentId: paymentIntentId,
          amountPaid,
          confirmationEmailSentAt: new Date(),
        },
      });
    } catch (emailError) {
      console.error(
        `[success] Failed to send confirmation email retry for booking ${booking.id}:`,
        emailError,
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Hero icon + heading */}
          <div className="text-center space-y-6">
            <div
              className={cn(
                "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg",
                isPaid
                  ? "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20"
                  : "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20",
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-10 w-10",
                  isPaid
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {isPaid ? "Payment received!" : "Payment is processing..."}
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                {isPaid
                  ? "Thank you. Your booking is being confirmed. You will receive a confirmation email shortly."
                  : "Your payment is processing. We will send a confirmation email once it is complete."}
              </p>
            </div>
          </div>

          {/* Booking summary card */}
          <div className="rounded-2xl border bg-gradient-to-br from-card to-card/80 shadow-xl p-8 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Booking summary
            </h2>

            <div className="space-y-6 text-sm">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {booking.service.name}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {formatDuration(booking.service.duration)} session
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 shrink-0">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {formatBookingDate(booking.bookingDate)}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {formatBookingTime(booking.bookingDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 shrink-0">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {booking.customerName}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {booking.customerEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">
                  Amount paid
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(booking.service.price)}
                </span>
              </div>
            </div>

            {/* Webhook-pending notice */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Confirmation in progress
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 leading-relaxed">
                  Your appointment is being confirmed. A confirmation email will
                  arrive within a few minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Booking reference</p>
            <code className="font-mono bg-muted border border-border px-4 py-2 rounded-lg text-sm font-medium">
              {booking.id}
            </code>
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-xl border-2 border-border bg-background px-6 text-base font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none hover:bg-muted hover:border-primary/50 hover:text-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 shadow-sm hover:shadow-md"
          >
            Back to services
          </Link>
        </div>
      </main>
    </div>
  );
}
