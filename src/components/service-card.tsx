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
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-border">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform duration-500">
            <span className="text-5xl">🌿</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Duration badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="bg-black/70 text-white border-0 backdrop-blur-md gap-1.5 py-1.5 px-3 text-xs font-medium shadow-lg"
          >
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 gap-4">
        <div className="space-y-3">
          <h3 className="font-bold text-xl leading-tight text-card-foreground group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-muted-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
          <div className="space-y-1">
            <span className="text-2xl font-bold text-primary block">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground">per session</span>
          </div>
          <Link href={`/book/${id}`}>
            <Button
              size="sm"
              className="gap-2 group/btn h-10 px-6 font-semibold shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              Book Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
