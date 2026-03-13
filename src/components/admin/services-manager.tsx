"use client";

import { Loader2, PencilLine, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export type AdminServiceRow = {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  duration: number;
  imageUrl: string | null;
  createdAtIso: string;
};

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
};

function toForm(service: AdminServiceRow): ServiceForm {
  return {
    name: service.name,
    description: service.description,
    price: (service.price / 100).toFixed(2),
    duration: String(service.duration),
    imageUrl: service.imageUrl ?? "",
  };
}

function emptyForm(): ServiceForm {
  return {
    name: "",
    description: "",
    price: "",
    duration: "60",
    imageUrl: "",
  };
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

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

export function ServicesManager({
  initialRows,
}: {
  initialRows: AdminServiceRow[];
}) {
  const [rows, setRows] = useState<AdminServiceRow[]>(initialRows);
  const [createForm, setCreateForm] = useState<ServiceForm>(emptyForm);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ServiceForm>(emptyForm);
  const [savingId, setSavingId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
    [rows],
  );

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const toastId = toast.loading("Creating service...");
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          price: Number(createForm.price),
          duration: Number(createForm.duration),
          imageUrl: createForm.imageUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to create service");
      }

      setRows((prev) => [data.service as AdminServiceRow, ...prev]);
      setCreateForm(emptyForm());
      toast.dismiss(toastId);
      toast.success("Service created");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to create service", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setCreating(false);
    }
  }

  function startEdit(service: AdminServiceRow) {
    setEditingId(service.id);
    setEditForm(toForm(service));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    const toastId = toast.loading("Updating service...");

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          duration: Number(editForm.duration),
          imageUrl: editForm.imageUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to update service");
      }

      setRows((prev) =>
        prev.map((r) => (r.id === id ? (data.service as AdminServiceRow) : r)),
      );
      setEditingId(null);
      setEditForm(emptyForm());
      toast.dismiss(toastId);
      toast.success("Service updated");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to update service", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <p className="text-sm text-muted-foreground">
          Add new services and update existing ones shown on the booking site.
        </p>
      </div>

      <form
        onSubmit={createService}
        className="rounded-2xl border border-border/50 bg-card p-5 space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service-name">Service Name</Label>
            <Input
              id="service-name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Deep Tissue Massage"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-image">Image URL (optional)</Label>
            <Input
              id="service-image"
              value={createForm.imageUrl}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-description">Description</Label>
          <Textarea
            id="service-description"
            rows={3}
            value={createForm.description}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe the treatment and who it is for"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service-price">Price (USD)</Label>
            <Input
              id="service-price"
              type="number"
              min="0.01"
              step="0.01"
              value={createForm.price}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="95.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-duration">Duration (minutes)</Label>
            <Input
              id="service-duration"
              type="number"
              min="15"
              step="15"
              value={createForm.duration}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, duration: e.target.value }))
              }
              placeholder="60"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={creating} className="gap-2">
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Service
        </Button>
      </form>

      <div className="rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="py-4">Name</TableHead>
              <TableHead className="py-4">Price</TableHead>
              <TableHead className="py-4">Duration</TableHead>
              <TableHead className="py-4">Created</TableHead>
              <TableHead className="py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((service) => {
              const isEditing = editingId === service.id;
              const isSaving = savingId === service.id;

              return (
                <TableRow key={service.id}>
                  <TableCell className="align-top">
                    {isEditing ? (
                      <div className="space-y-2 min-w-[320px]">
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Service name"
                        />
                        <Textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Service description"
                        />
                        <Input
                          value={editForm.imageUrl}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="Image URL (optional)"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-w-md">
                        <p className="font-semibold text-base">
                          {service.name}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                        {service.imageUrl && (
                          <p className="text-xs text-muted-foreground truncate">
                            {service.imageUrl}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="align-top">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <span className="font-medium">
                        {formatCurrency(service.price)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="align-top">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={editForm.duration}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <span>{service.duration} min</span>
                    )}
                  </TableCell>

                  <TableCell className="align-top text-sm text-muted-foreground">
                    {formatDateTime(service.createdAtIso)}
                  </TableCell>

                  <TableCell className="align-top text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(service.id)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => startEdit(service)}
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
