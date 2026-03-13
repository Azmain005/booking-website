import { Leaf } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-all duration-200 shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
              Serene Wellness
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 rounded-xl hover:bg-accent/80 relative group"
            >
              <span className="relative z-10">Services</span>
              <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 rounded-xl hover:bg-accent/80 relative group"
            >
              <span className="relative z-10">Admin</span>
              <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
