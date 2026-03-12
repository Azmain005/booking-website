import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const {
      serviceId,
      customerName,
      customerEmail,
      bookingDate,
      bookingTime,
      notes,
    } = result.data;

    // 2. Verify the service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 3. Combine date + time into a UTC DateTime
    // bookingDate: "YYYY-MM-DD", bookingTime: "HH:MM"
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);

    // 4. Create PENDING booking (stripeSessionId will be set after Stripe checkout)
    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        bookingDate: bookingDateTime,
        notes: notes?.trim() || null,
        status: "PENDING",
        serviceId,
      },
      include: {
        service: {
          select: { id: true, name: true, price: true, duration: true },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookings]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
