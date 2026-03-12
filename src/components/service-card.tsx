import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDuration } from "@/lib/utils";

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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-4xl">🌿</span>
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="bg-black/60 text-white border-0 backdrop-blur-sm gap-1"
          >
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight text-card-foreground">
            {name}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(price)}
          </span>
          <Link href={`/book/${id}`}>
            <Button size="sm" className="gap-1.5 group/btn">
              Book Now
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
