import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminSections } from "@/components/admin/admin-sections";
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

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bookings: {
        select: {
          createdAt: true,
          status: true,
          amountPaid: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
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

  const serviceRows = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    duration: s.duration,
    imageUrl: s.imageUrl,
    createdAtIso: s.createdAt.toISOString(),
  }));

  const userRows = users.map((user) => {
    const lastBookingAt = user.bookings[0]?.createdAt ?? null;
    const lastActivityAt =
      lastBookingAt && lastBookingAt > user.createdAt
        ? lastBookingAt
        : user.createdAt;

    const totalSpent = user.bookings.reduce(
      (sum, booking) => sum + (booking.amountPaid ?? 0),
      0,
    );
    const confirmedBookings = user.bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED" || booking.status === "COMPLETED",
    ).length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAtIso: user.createdAt.toISOString(),
      lastBookingAtIso: lastBookingAt ? lastBookingAt.toISOString() : null,
      lastActivityAtIso: lastActivityAt.toISOString(),
      totalBookings: user.bookings.length,
      confirmedBookings,
      totalSpent,
    };
  });

  return (
    <main className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage bookings and view business insights
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      <AdminSections
        bookingRows={rows}
        serviceRows={serviceRows}
        userRows={userRows}
      />
    </main>
  );
}
