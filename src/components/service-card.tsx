import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string | null;
}

export function ServiceCard({
  id,
  name,
  description,
  price,
  duration,
  imageUrl,
}: ServiceCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground transition-transform duration-500 group-hover:scale-110">
            <span className="text-sm font-medium">Service image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute right-4 top-4">
          <Badge
            variant="secondary"
            className="gap-1.5 border-0 bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
          >
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-bold leading-tight text-card-foreground transition-colors duration-300 group-hover:text-primary">
            {name}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">
            {description}
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border/30 bg-muted/30 p-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Professional service
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Flexible scheduling
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Quality guaranteed
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
          <div className="space-y-1">
            <span className="block text-2xl font-bold text-primary">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground">per session</span>
          </div>
          <Link href={`/book/${id}`}>
            <Button
              size="sm"
              className="group/btn h-10 gap-2 bg-gradient-to-r from-primary to-primary/90 px-6 font-semibold shadow-md transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-lg"
            >
              Book now
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
