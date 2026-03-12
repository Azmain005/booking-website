import { ArrowLeft, Clock, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingForm } from "@/components/booking-form";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface BookPageProps {
  params: Promise<{ serviceId: string }>;
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { serviceId } = await params;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { title: "Service Not Found" };
  return {
    title: `Book ${service.name} | Serene Wellness`,
    description: `Reserve your ${service.name} session — ${formatDuration(service.duration)} for ${formatCurrency(service.price)}.`,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { serviceId } = await params;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* ── LEFT: Service Detail ── */}
          <div className="space-y-6">
            {/* Image */}
            {service.imageUrl && (
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            )}

            {/* Meta */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(service.duration)}
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Top rated
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {service.name}
              </h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>

            <Separator />

            {/* Pricing card */}
            <div className="rounded-xl border bg-muted/40 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Session details
              </h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">
                  {formatDuration(service.duration)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(service.price)}
                </span>
              </div>
              <Separator />
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Instant booking
                  confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Secure payment via
                  Stripe
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Free cancellation
                  (24h notice)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Email confirmation
                  sent
                </li>
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Booking Form ── */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Book your session</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in your details and choose a time. Payment is collected
                  at the next step.
                </p>
              </div>
              <BookingForm service={service} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
