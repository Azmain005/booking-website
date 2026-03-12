import { XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description:
    "Your booking checkout was cancelled. You can try booking again or contact us for assistance.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Checkout Cancelled | Serene Wellness",
    description:
      "Your booking checkout was cancelled. You can try booking again or contact us for assistance.",
    type: "website",
  },
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

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-muted/80 to-muted/60 mb-4 shadow-lg">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Checkout cancelled
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              No payment was taken and your booking has been cancelled. You can
              start a new booking anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl border-2 border-transparent bg-primary text-primary-foreground px-8 text-base font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 shadow-md hover:shadow-lg"
            >
              Browse services
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-background px-8 text-base font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none hover:bg-muted hover:border-primary/50 hover:text-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 shadow-sm hover:shadow-md"
            >
              Try again
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
