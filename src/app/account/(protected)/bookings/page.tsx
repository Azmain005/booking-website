import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

function statusVariant(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "default" as const;
    case "PENDING":
      return "secondary" as const;
    case "CANCELLED":
      return "outline" as const;
    case "COMPLETED":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

function formatDate(isoDate: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(isoDate);
}

export default async function AccountBookingsPage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      service: {
        select: {
          name: true,
          duration: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My bookings</h1>
            <p className="text-muted-foreground">
              View all bookings linked to your account.
            </p>
          </div>
          <Link href="/account/profile">
            <Button variant="outline">Back to profile</Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No bookings yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you complete checkout, your bookings will appear here.
              </p>
              <Link href="/">
                <Button>Browse services</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">
                        {booking.service.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(booking.service.duration)} -{" "}
                        {formatCurrency(booking.service.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.bookingDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ref: {booking.id}
                      </p>
                    </div>
                    <Badge variant={statusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
