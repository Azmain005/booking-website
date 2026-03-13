"use client";

import {
  CalendarDays,
  Clock,
  CreditCard,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminBookingRow } from "./bookings-table";

export type AdminAnalytics = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  todaysBookings: number;
  popularServices: { name: string; count: number }[];
};

function calculateAnalytics(bookings: AdminBookingRow[]): AdminAnalytics {
  const today = new Date().toISOString().split("T")[0];

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED",
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "CANCELLED",
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.amountPaid != null)
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const todaysBookings = bookings.filter((b) =>
    b.bookingDateIso.startsWith(today),
  ).length;

  // Count service popularity
  const serviceCounts: Record<string, number> = {};
  bookings.forEach((booking) => {
    serviceCounts[booking.serviceName] =
      (serviceCounts[booking.serviceName] || 0) + 1;
  });

  const popularServices = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue,
    todaysBookings,
    popularServices,
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function AdminAnalytics({ bookings }: { bookings: AdminBookingRow[] }) {
  const analytics = calculateAnalytics(bookings);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Bookings */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Bookings
            </p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {analytics.totalBookings}
            </p>
          </div>
          <div className="p-3 bg-blue-200/50 dark:bg-blue-800/50 rounded-xl">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border border-green-200 dark:border-green-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Revenue
            </p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(analytics.totalRevenue)}
            </p>
          </div>
          <div className="p-3 bg-green-200/50 dark:bg-green-800/50 rounded-xl">
            <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Confirmed Bookings */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Confirmed
            </p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {analytics.confirmedBookings}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {analytics.pendingBookings} pending
            </p>
          </div>
          <div className="p-3 bg-purple-200/50 dark:bg-purple-800/50 rounded-xl">
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Today&apos;s Sessions
            </p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              {analytics.todaysBookings}
            </p>
          </div>
          <div className="p-3 bg-amber-200/50 dark:bg-amber-800/50 rounded-xl">
            <CalendarDays className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Popular Services */}
      {analytics.popularServices.length > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-muted/50 to-background border border-border/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Most Popular Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.popularServices.map((service, index) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : index === 1
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">
                    {service.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {service.count} booking{service.count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
