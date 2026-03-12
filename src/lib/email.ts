import { format } from "date-fns";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  bookingDate: Date;
  amount: number; // in cents
  bookingId: string;
}

export async function sendBookingConfirmationEmail({
  customerName,
  customerEmail,
  serviceName,
  bookingDate,
  amount,
  bookingId,
}: BookingConfirmationEmailProps) {
  const formattedDate = format(
    new Date(bookingDate),
    "EEEE, MMMM d, yyyy 'at' h:mm a",
  );
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">✨ Booking Confirmed!</h1>
              <p style="margin:8px 0 0;color:#c7d2fe;font-size:15px;">Your wellness journey begins now</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hi <strong>${customerName}</strong>,</p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Great news! Your payment was successful and your booking is confirmed. We look forward to seeing you soon.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <h2 style="margin:0 0 20px;color:#1e1b4b;font-size:18px;font-weight:600;">Booking Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Service</td>
                        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${serviceName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Date &amp; Time</td>
                        <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Amount Paid</td>
                        <td style="padding:8px 0;color:#059669;font-size:14px;font-weight:600;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Booking ID</td>
                        <td style="padding:8px 0;color:#111827;font-size:12px;font-family:monospace;">${bookingId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
                If you need to reschedule or have any questions, please contact us at least 24 hours before your appointment.
              </p>
              <p style="margin:0;color:#6b7280;font-size:14px;">
                We'll see you soon! 🌿
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} Serene Wellness. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Serene Wellness <onboarding@resend.dev>",
    to: customerEmail,
    subject: `✅ Booking Confirmed: ${serviceName} on ${format(new Date(bookingDate), "MMM d")}`,
    html,
  });

  if (error) {
    console.error("[Email] Failed to send booking confirmation:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log("[Email] Booking confirmation sent:", data?.id);
  return data;
}
