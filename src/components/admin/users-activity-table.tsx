"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminUserActivityRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAtIso: string;
  lastBookingAtIso: string | null;
  lastActivityAtIso: string;
  totalBookings: number;
  confirmedBookings: number;
  totalSpent: number;
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function activityBadge(lastActivityAtIso: string) {
  const last = new Date(lastActivityAtIso).getTime();
  const days = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));

  if (days <= 7) {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
    );
  }

  if (days <= 30) {
    return <Badge variant="secondary">Recently Active</Badge>;
  }

  return <Badge variant="outline">Inactive</Badge>;
}

export function UsersActivityTable({
  initialRows,
}: {
  initialRows: AdminUserActivityRow[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [nowMs] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return [...initialRows].sort(
        (a, b) =>
          new Date(b.lastActivityAtIso).getTime() -
          new Date(a.lastActivityAtIso).getTime(),
      );
    }

    return initialRows
      .filter((row) => {
        const displayName = row.name ?? "";
        return (
          displayName.toLowerCase().includes(normalized) ||
          row.email.toLowerCase().includes(normalized) ||
          row.id.toLowerCase().includes(normalized)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.lastActivityAtIso).getTime() -
          new Date(a.lastActivityAtIso).getTime(),
      );
  }, [initialRows, searchTerm]);

  const totals = useMemo(() => {
    const totalUsers = initialRows.length;
    const activeUsers = initialRows.filter((row) => {
      const days =
        (nowMs - new Date(row.lastActivityAtIso).getTime()) /
        (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length;
    const totalRevenue = initialRows.reduce(
      (sum, row) => sum + row.totalSpent,
      0,
    );

    return { totalUsers, activeUsers, totalRevenue };
  }, [initialRows, nowMs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">Total users</p>
          <p className="text-2xl font-bold">{totals.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">Active (30 days)</p>
          <p className="text-2xl font-bold">{totals.activeUsers}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">Revenue from users</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totals.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-4">
        <Input
          placeholder="Search by user name, email, or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {row.name ?? "Unnamed user"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {row.id}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">{row.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.phone ?? "No phone"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(row.createdAtIso)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(row.lastActivityAtIso)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold">{row.totalBookings}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.confirmedBookings} confirmed
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(row.totalSpent)}
                </TableCell>
                <TableCell>{activityBadge(row.lastActivityAtIso)}</TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No users found for this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
