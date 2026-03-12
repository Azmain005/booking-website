import { Header } from "@/components/header";
import { ServiceCard } from "@/components/service-card";
import { prisma } from "@/lib/prisma";
import { Sparkles } from "lucide-react";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Wellness Treatments
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Restore Your{" "}
              <span className="text-primary">Balance &amp; Wellbeing</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Book a professional massage or wellness treatment in seconds.
              Secure payment, instant confirmation, and a rejuvenating experience await.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">✅ Instant booking</span>
              <span className="flex items-center gap-1.5">🔒 Secure payment</span>
              <span className="flex items-center gap-1.5">📧 Email confirmation</span>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Our Services
            </h2>
            <p className="mt-2 text-muted-foreground">
              Choose from our range of expertly crafted wellness treatments.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No services available yet.</p>
              <p className="text-sm mt-1">
                Run{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  npm run db:seed
                </code>{" "}
                to add services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description}
                  price={service.price}
                  duration={service.duration}
                  imageUrl={service.imageUrl}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Serene Wellness. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Secured by{" "}
              <span className="font-semibold text-foreground">Stripe</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

