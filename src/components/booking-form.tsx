"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
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
import { toast } from "sonner";

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

    // Show loading toast
    const toastId = toast.loading("Creating your booking...", {
      description: "Preparing secure checkout with Stripe",
    });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error ?? `Request failed with status ${res.status}`;
        setServerError(msg);
        toast.dismiss(toastId);
        toast.error("Booking failed", {
          description: msg,
        });
        return;
      }

      // Show success and redirect
      toast.dismiss(toastId);
      toast.success("Redirecting to checkout...", {
        description: "Taking you to Stripe secure payment page",
      });

      // Hard-navigate to Stripe's hosted checkout page.
      // router.push() won't work here because it's an external URL.
      window.location.href = data.url;
    } catch {
      toast.dismiss(toastId);
      const errorMsg =
        "Network error. Please check your connection and try again.";
      setServerError(errorMsg);
      toast.error("Connection failed", {
        description: errorMsg,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* Hidden service ID */}
      <input type="hidden" {...register("serviceId")} />

      {/* Service summary banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 p-6 flex items-start gap-4 shadow-sm">
        <div className="rounded-xl bg-primary/20 p-3 mt-1">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-foreground mb-2">
            {service.name}
          </p>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {service.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground bg-background/50 rounded-full px-3 py-1.5">
              <Clock className="h-4 w-4" />
              {formatDuration(service.duration)}
            </span>
            <span className="font-bold text-primary bg-primary/10 rounded-full px-3 py-1.5">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-3">
        <Label
          htmlFor="customerName"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <User className="h-4 w-4 text-primary" />
          Full Name <span className="text-destructive text-lg">*</span>
        </Label>
        <Input
          id="customerName"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          aria-invalid={!!errors.customerName}
          className={`h-12 text-base transition-all duration-200 ${
            errors.customerName
              ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/30"
              : "focus:border-primary focus:ring-primary/30 hover:border-border"
          }`}
          {...register("customerName")}
        />
        {errors.customerName && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errors.customerName.message}</p>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="space-y-3">
        <Label
          htmlFor="customerEmail"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <Mail className="h-4 w-4 text-primary" />
          Email Address <span className="text-destructive text-lg">*</span>
        </Label>
        <Input
          id="customerEmail"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          aria-invalid={!!errors.customerEmail}
          className={`h-12 text-base transition-all duration-200 ${
            errors.customerEmail
              ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/30"
              : "focus:border-primary focus:ring-primary/30 hover:border-border"
          }`}
          {...register("customerEmail")}
        />
        {errors.customerEmail && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errors.customerEmail.message}</p>
          </div>
        )}
      </div>

      {/* Date + Time - side by side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Preferred Date */}
        <div className="space-y-3">
          <Label
            htmlFor="bookingDate"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            Preferred Date <span className="text-destructive text-lg">*</span>
          </Label>
          <Input
            id="bookingDate"
            type="date"
            min={getMinDate()}
            max={getMaxDate()}
            aria-invalid={!!errors.bookingDate}
            className={`h-12 text-base transition-all duration-200 ${
              errors.bookingDate
                ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/30"
                : "focus:border-primary focus:ring-primary/30 hover:border-border"
            }`}
            {...register("bookingDate")}
          />
          {errors.bookingDate && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errors.bookingDate.message}</p>
            </div>
          )}
        </div>

        {/* Preferred Time */}
        <div className="space-y-3">
          <Label
            htmlFor="bookingTime"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Clock className="h-4 w-4 text-primary" />
            Preferred Time <span className="text-destructive text-lg">*</span>
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
              className={`h-12 text-base transition-all duration-200 ${
                errors.bookingTime
                  ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/30"
                  : "focus:border-primary focus:ring-primary/30 hover:border-border"
              }`}
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
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errors.bookingTime.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <Label
          htmlFor="notes"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          Additional Notes{" "}
          <span className="text-muted-foreground font-normal text-sm">
            (optional)
          </span>
        </Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Any health conditions, preferences, or special requests we should know about..."
          aria-invalid={!!errors.notes}
          className="text-base resize-none transition-all duration-200 focus:border-primary focus:ring-primary/30 hover:border-border"
          {...register("notes")}
        />
        {errors.notes && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errors.notes.message}</p>
          </div>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 backdrop-blur-sm px-6 py-4 text-sm text-destructive shadow-lg"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Something went wrong</p>
              <p>{serverError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-3">
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Redirecting to Stripe...</span>
            </>
          ) : (
            <>
              <span>Pay and book - {formatCurrency(service.price)}</span>
            </>
          )}
        </div>
      </Button>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          You will be taken to Stripe secure checkout. Your slot is{" "}
          <strong className="text-foreground">reserved</strong> once payment is
          complete.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
            SSL encrypted
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
            PCI compliant
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
            Instant confirmation
          </span>
        </div>
      </div>
    </form>
  );
}
