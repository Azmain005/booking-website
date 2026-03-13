import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
  points: string[];
  children: ReactNode;
}

export function AuthShell({
  badge,
  title,
  description,
  panelTitle,
  panelDescription,
  points,
  children,
}: AuthShellProps) {
  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-64 w-[92%] rounded-[2.5rem] bg-gradient-to-r from-primary/12 via-primary/5 to-transparent blur-3xl" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm sm:p-8">
          <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {badge}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>

          <Card className="mt-7 border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Continue securely</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </section>

        <aside className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            {panelTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {panelDescription}
          </p>

          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li
                key={point}
                className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground"
              >
                {point}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
