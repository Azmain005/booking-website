import { AdminAnalytics } from "@/components/admin/admin-analytics";
import { BookingsTable } from "@/components/admin/bookings-table";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Manage bookings, view business analytics, and oversee operations.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Admin Dashboard | Serene Wellness",
    description:
      "Manage bookings, view business analytics, and oversee operations.",
    type: "website",
  },
};

export default async function AdminDashboardPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    serviceName: b.service.name,
    bookingDateIso: b.bookingDate.toISOString(),
    createdAtIso: b.createdAt.toISOString(),
    status: b.status,
    amountPaid: b.amountPaid,
    stripePaymentIntentId: b.stripePaymentIntentId,
  }));

  return (
    <main className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage bookings and view business insights
        </p>
      </div>

      <AdminAnalytics bookings={rows} />
      <BookingsTable initialRows={rows} />
    </main>
  );
}
