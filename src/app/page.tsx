import { Header } from "@/components/header";
import { ServiceCard } from "@/components/service-card";
import { prisma } from "@/lib/prisma";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Serene Wellness",
    description:
      "Premium massage and wellness treatments with online booking, instant confirmation, and secure payments.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://serenewellness.com",
    telephone: "+1-555-WELLNESS",
    priceRange: "$$",
    serviceType: ["Massage Therapy", "Wellness Treatments", "Spa Services"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Wellness Services",
      itemListElement: services.map((service, index) => ({
        "@type": "Offer",
        name: service.name,
        description: service.description,
        price: (service.price / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        position: index + 1,
      })),
    },
    "@graph": [
      {
        "@type": "WebSite",
        name: "Serene Wellness",
        url: process.env.NEXT_PUBLIC_BASE_URL || "https://serenewellness.com",
        potentialAction: {
          "@type": "SearchAction",
          target: `${process.env.NEXT_PUBLIC_BASE_URL || "https://serenewellness.com"}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background border-b border-border/50">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-2 text-sm text-primary font-semibold mb-8 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Trusted booking platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight mb-8">
              Restore Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Balance & Wellbeing
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Book a professional massage or wellness treatment in seconds.
              Secure payment, instant confirmation, and a rejuvenating
              experience await.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-sm">
                Instant booking
              </span>
              <span className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-sm">
                Secure payment
              </span>
              <span className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-sm">
                Email confirmation
              </span>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of expertly crafted wellness treatments,
              each designed to restore balance and rejuvenate your mind and
              body.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-32">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border border-border/50 p-12 max-w-md mx-auto">
                <p className="text-xl font-medium text-foreground mb-2">
                  No services available yet
                </p>
                <p className="text-muted-foreground mb-6">
                  We&apos;re preparing our wellness treatments for you.
                </p>
                <code className="bg-muted border border-border px-4 py-2 rounded-lg text-sm font-mono">
                  npm run db:seed
                </code>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ServiceCard
                    id={service.id}
                    name={service.name}
                    description={service.description}
                    price={service.price}
                    duration={service.duration}
                    imageUrl={service.imageUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-t from-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p>
                © {new Date().getFullYear()} Serene Wellness. All rights
                reserved.
              </p>
              <div className="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <p className="text-xs">
                Crafted with care for your wellness journey
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
              <span className="text-xs">Secured by</span>
              <span className="font-semibold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Stripe
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
