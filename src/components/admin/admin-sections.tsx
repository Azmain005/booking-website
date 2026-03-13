"use client";

import { useState } from "react";

import { AdminAnalytics } from "@/components/admin/admin-analytics";
import {
  type AdminBookingRow,
  BookingsTable,
} from "@/components/admin/bookings-table";
import {
  type AdminServiceRow,
  ServicesManager,
} from "@/components/admin/services-manager";
import {
  type AdminUserActivityRow,
  UsersActivityTable,
} from "@/components/admin/users-activity-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SectionKey = "overview" | "services" | "bookings" | "users";

const sections: { key: SectionKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "services", label: "Services" },
  { key: "bookings", label: "Bookings" },
  { key: "users", label: "Users" },
];

export function AdminSections({
  bookingRows,
  serviceRows,
  userRows,
}: {
  bookingRows: AdminBookingRow[];
  serviceRows: AdminServiceRow[];
  userRows: AdminUserActivityRow[];
}) {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");

  return (
    <div className="space-y-6">
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle>Admin sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const active = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {activeSection === "overview" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <p className="text-sm text-muted-foreground">
              Key business metrics and demand trends.
            </p>
          </div>
          <AdminAnalytics bookings={bookingRows} />
        </section>
      )}

      {activeSection === "services" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Services</h2>
            <p className="text-sm text-muted-foreground">
              Add and edit the services displayed on the booking site.
            </p>
          </div>
          <ServicesManager initialRows={serviceRows} />
        </section>
      )}

      {activeSection === "bookings" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
            <p className="text-sm text-muted-foreground">
              Monitor payments, booking states, and customer appointments.
            </p>
          </div>
          <BookingsTable initialRows={bookingRows} />
        </section>
      )}

      {activeSection === "users" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-sm text-muted-foreground">
              Monitor user activity, booking volume, and spending behavior.
            </p>
          </div>
          <UsersActivityTable initialRows={userRows} />
        </section>
      )}
    </div>
  );
}
