import { CalendarCheck, CalendarDays, Clock, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Booking Confirmed | Serene Wellness",
};

interface ConfirmationPageProps {
  searchParams: Promise<{ id?: string }>;
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

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { id } = await searchParams;

  if (!id) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: {
        select: { name: true, duration: true, price: true },
      },
    },
  });

  if (!booking) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Success icon + heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
              <CalendarCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Booking received!
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your reservation is <strong>pending payment</strong>. Complete
              payment in the next step to confirm your appointment.
            </p>
          </div>

          {/* Booking details card */}
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Booking details
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2 mt-0.5">
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
                <div className="rounded-md bg-muted p-2 mt-0.5">
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
                <div className="rounded-md bg-muted p-2 mt-0.5">
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
              <span className="text-sm text-muted-foreground">Total due</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(booking.service.price)}
              </span>
            </div>

            {/* Status pill */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 text-center">
              Status: <strong>Pending payment</strong> — your slot is reserved
              for 30 minutes
            </div>
          </div>

          {/* Reference number */}
          <p className="text-center text-xs text-muted-foreground">
            Reference:{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
              {booking.id}
            </code>
          </p>

          {/* CTA — will become "Complete Payment" once Stripe is wired */}
          <div className="space-y-3">
            <Button className="w-full h-11 font-semibold" disabled>
              Complete Payment (Stripe — coming next)
            </Button>
            <Link
              href="/"
              className="inline-flex h-9 w-full shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Back to services
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
