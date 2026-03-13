"use client";

import { Loader2, RefreshCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const sorted = useMemo(() => {
    let filtered = [...rows];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (row) =>
          row.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
    );
  }, [rows, searchTerm, statusFilter]);

  async function refresh() {
    setRefreshing(true);
    const toastId = toast.loading("Refreshing bookings...");
    try {
      const res = await fetch("/api/admin/bookings", { method: "GET" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.rows)) {
        setRows(data.rows);
        toast.dismiss(toastId);
        toast.success(`Refreshed ${data.rows.length} bookings`);
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to refresh bookings");
    } finally {
      setRefreshing(false);
    }
  }

  async function updateStatus(id: string, status: Status) {
    setSavingId(id);
    const toastId = toast.loading(`Updating status to ${status}...`);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Update failed");
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: data.booking.status } : r,
        ),
      );

      toast.dismiss(toastId);
      toast.success(`Status updated to ${status}`, {
        description: `Booking ${id} has been updated`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Update failed";
      toast.dismiss(toastId);
      toast.error("Failed to update status", {
        description: errorMsg,
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col gap-4 p-6 bg-gradient-to-r from-muted/50 to-background border border-border/50 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {sorted.length} booking{sorted.length === 1 ? "" : "s"}
              {searchTerm || statusFilter !== "ALL" ? (
                <span className="text-sm text-muted-foreground font-normal">
                  {" "}
                  ({rows.length} total)
                </span>
              ) : null}
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage appointments and customer information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={refresh}
              disabled={refreshing}
              className="gap-2 hover:bg-muted/80"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, service, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value || "ALL")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground py-4">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                Service
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                Date/Time
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                Payment
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                Status
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                Created
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground py-4">
                Manage
              </TableHead>
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
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors duration-200"
                >
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="font-semibold text-base">
                        {row.customerName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {row.customerEmail}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 inline-block">
                        {row.id}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="font-semibold text-base">
                      {row.serviceName}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="font-medium">
                      {formatDateTime(row.bookingDateIso)}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">{paymentBadge(row)}</TableCell>

                  <TableCell className="py-4">
                    <Badge
                      variant={statusBadgeVariant(row.status)}
                      className="font-medium"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground py-4">
                    <div className="text-sm">
                      {formatDateTime(row.createdAtIso)}
                    </div>
                  </TableCell>

                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Select
                        value={currentStatus}
                        onValueChange={(val) =>
                          updateStatus(row.id, val as Status)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger
                          className="w-44 h-9"
                          aria-label="Update status"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="font-medium"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {disabled && (
                        <div className="flex items-center justify-center w-9 h-9">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/30 rounded-xl p-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <strong>Note:</strong> Bookings are only marked{" "}
          <strong>CONFIRMED</strong> by verified Stripe webhooks.
        </p>
      </div>
    </div>
  );
}
