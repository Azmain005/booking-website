"use client";

import { Loader2, LogOut, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminBookingRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  bookingDateIso: string;
  createdAtIso: string;
  status: string;
  amountPaid: number | null;
  stripePaymentIntentId: string | null;
};

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

type Status = (typeof STATUSES)[number];

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "secondary" as const;
    case "CONFIRMED":
      return "default" as const;
    case "COMPLETED":
      return "default" as const;
    case "CANCELLED":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function paymentBadge(row: AdminBookingRow) {
  const paid = row.amountPaid != null || !!row.stripePaymentIntentId;
  return paid ? (
    <Badge className="bg-emerald-600 hover:bg-emerald-600">Paid</Badge>
  ) : (
    <Badge variant="secondary">Unpaid</Badge>
  );
}

export function BookingsTable({
  initialRows,
}: {
  initialRows: AdminBookingRow[];
}) {
  const [rows, setRows] = useState<AdminBookingRow[]>(initialRows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sorted = useMemo(() => {
    return [...rows].sort(
      (a, b) =>
        new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
    );
  }, [rows]);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/bookings", { method: "GET" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.rows)) {
        setRows(data.rows);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function updateStatus(id: string, status: Status) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error ?? "Update failed");
        return;
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: data.booking.status } : r,
        ),
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {rows.length} booking{rows.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => {
              const disabled = savingId === row.id;
              const currentStatus = (
                STATUSES.includes(row.status as Status)
                  ? (row.status as Status)
                  : "PENDING"
              ) as Status;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.customerEmail}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                      {row.id}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{row.serviceName}</div>
                  </TableCell>

                  <TableCell>{formatDateTime(row.bookingDateIso)}</TableCell>

                  <TableCell>{paymentBadge(row)}</TableCell>

                  <TableCell>
                    <Badge variant={statusBadgeVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDateTime(row.createdAtIso)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={currentStatus}
                        onValueChange={(val) =>
                          updateStatus(row.id, val as Status)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger
                          className="w-42.5"
                          aria-label="Update status"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {disabled && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Bookings are only marked <strong>CONFIRMED</strong> by verified
        Stripe webhooks.
      </p>
    </div>
  );
}
