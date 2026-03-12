import { XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout Cancelled | Serene Wellness",
};

interface CancelPageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const { bookingId } = await searchParams;

  // Mark the PENDING booking as CANCELLED so it doesn't pollute the admin panel.
  // We only do this if the bookingId is present and the booking is still PENDING
  // (it can't be CONFIRMED here because the webhook only fires on successful payment).
  if (bookingId) {
    await prisma.booking.updateMany({
      where: { id: bookingId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
            <XCircle className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Checkout cancelled
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              No payment was taken and your booking has been cancelled. You can
              start a new booking anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding bg-primary text-primary-foreground px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Browse services
            </Link>
            <Link
              href="/"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Try again
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
