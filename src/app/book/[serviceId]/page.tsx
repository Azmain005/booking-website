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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 mb-12 group bg-muted/50 hover:bg-muted rounded-full px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* ── LEFT: Service Detail ── */}
          <div className="space-y-8">
            {/* Image */}
            {service.imageUrl && (
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                    <span className="text-sm font-semibold">
                      Premium Treatment
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Badge
                  variant="secondary"
                  className="text-sm gap-2 py-1.5 px-3"
                >
                  <Clock className="h-4 w-4" />
                  {formatDuration(service.duration)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-sm gap-2 py-1.5 px-3"
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Top rated
                </Badge>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {service.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>

            <Separator />

            {/* Pricing card */}
            <div className="rounded-2xl border bg-gradient-to-br from-muted/30 to-muted/50 backdrop-blur-sm p-8 space-y-6 shadow-lg">
              <h2 className="text-lg font-bold text-foreground">
                Session Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    Duration
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatDuration(service.duration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    Price
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
              <Separator />
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-xs font-bold">✓</span>
                  </div>
                  Instant booking confirmation
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-500 text-xs font-bold">✓</span>
                  </div>
                  Secure payment via Stripe
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-amber-500 text-xs font-bold">✓</span>
                  </div>
                  Free cancellation (24h notice)
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-500 text-xs font-bold">✓</span>
                  </div>
                  Email confirmation sent
                </li>
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Booking Form ── */}
          <div className="lg:sticky lg:top-32">
            <div className="rounded-3xl border-2 border-border/50 bg-card shadow-2xl p-8 sm:p-10 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Book your session</h2>
                <p className="text-muted-foreground">
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
