"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDuration } from "@/lib/utils";
import {
  bookingFormSchema,
  BookingFormValues,
  TIME_SLOTS,
} from "@/lib/validations";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface BookingFormProps {
  service: Service;
}

function formatTimeLabel(slot: string) {
  const [hourStr, minuteStr] = slot.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minuteStr} ${suffix}`;
}

/** Minimum bookable date = tomorrow (YYYY-MM-DD) */
function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/** Maximum bookable date = 90 days from now */
function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().split("T")[0];
}

export function BookingForm({ service }: BookingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: service.id,
      customerName: "",
      customerEmail: "",
      bookingDate: "",
      bookingTime: undefined,
      notes: "",
    },
  });

  const selectedTime = watch("bookingTime");

  async function onSubmit(values: BookingFormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error ?? `Request failed with status ${res.status}`;
        setServerError(msg);
        return;
      }

      // Redirect to confirmation page with booking ID
      router.push(`/book/confirmation?id=${data.booking.id}`);
    } catch {
      setServerError(
        "Network error. Please check your connection and try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Hidden service ID */}
      <input type="hidden" {...register("serviceId")} />

      {/* Service summary banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
          <CalendarDays className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {service.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {service.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(service.duration)}
            </span>
            <span className="font-semibold text-primary">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="customerName"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="customerName"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          aria-invalid={!!errors.customerName}
          {...register("customerName")}
        />
        {errors.customerName && (
          <p className="text-xs text-destructive mt-1">
            {errors.customerName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor="customerEmail"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="customerEmail"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          aria-invalid={!!errors.customerEmail}
          {...register("customerEmail")}
        />
        {errors.customerEmail && (
          <p className="text-xs text-destructive mt-1">
            {errors.customerEmail.message}
          </p>
        )}
      </div>

      {/* Date + Time — side by side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Date */}
        <div className="space-y-1.5">
          <Label
            htmlFor="bookingDate"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            Preferred Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bookingDate"
            type="date"
            min={getMinDate()}
            max={getMaxDate()}
            aria-invalid={!!errors.bookingDate}
            {...register("bookingDate")}
          />
          {errors.bookingDate && (
            <p className="text-xs text-destructive mt-1">
              {errors.bookingDate.message}
            </p>
          )}
        </div>

        {/* Preferred Time */}
        <div className="space-y-1.5">
          <Label
            htmlFor="bookingTime"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Preferred Time <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedTime ?? ""}
            onValueChange={(val) =>
              setValue("bookingTime", val as BookingFormValues["bookingTime"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              id="bookingTime"
              aria-invalid={!!errors.bookingTime}
              className="w-full"
            >
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {formatTimeLabel(slot)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bookingTime && (
            <p className="text-xs text-destructive mt-1">
              {errors.bookingTime.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label
          htmlFor="notes"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          Additional Notes{" "}
          <span className="text-muted-foreground font-normal text-xs">
            (optional)
          </span>
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Any health conditions, preferences, or special requests we should know about…"
          aria-invalid={!!errors.notes}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-xs text-destructive mt-1">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving your booking…
          </>
        ) : (
          <>Confirm Booking — {formatCurrency(service.price)}</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your booking will be held as <strong>pending</strong> until payment is
        completed. You can cancel at any time before your appointment.
      </p>
    </form>
  );
}
