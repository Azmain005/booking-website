import { createClient } from "@libsql/client";
import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

async function main() {
  const url = requireEnv("DATABASE_URL");
  const authToken = process.env["DATABASE_AUTH_TOKEN"]?.trim();

  const client = createClient({
    url,
    authToken,
  });

  // Ensure FK constraints are enforced.
  await client.execute("PRAGMA foreign_keys = ON;");

  // Create tables (idempotent).
  await client.batch(
    [
      {
        sql: `CREATE TABLE IF NOT EXISTS "Service" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "price" INTEGER NOT NULL,
          "duration" INTEGER NOT NULL,
          "imageUrl" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS "Booking" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "customerName" TEXT NOT NULL,
          "customerEmail" TEXT NOT NULL,
          "bookingDate" DATETIME NOT NULL,
          "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "stripeSessionId" TEXT,
          "stripePaymentIntentId" TEXT,
          "amountPaid" INTEGER,
          "confirmationEmailSentAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          "serviceId" TEXT NOT NULL,
          CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        args: [],
      },
      {
        sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");`,
        args: [],
      },
      {
        sql: `CREATE INDEX IF NOT EXISTS "Booking_serviceId_idx" ON "Booking"("serviceId");`,
        args: [],
      },
    ],
    "write",
  );

  // Best-effort migration for older DBs that already have the Booking table.
  // SQLite doesn't support IF NOT EXISTS for ADD COLUMN, so we attempt and
  // ignore the "duplicate column" error.
  try {
    await client.execute(
      'ALTER TABLE "Booking" ADD COLUMN "confirmationEmailSentAt" DATETIME;',
    );
  } catch {
    // ignore
  }

  const rs = await client.execute('SELECT COUNT(*) as "count" FROM "Service";');
  const firstRow: unknown = rs.rows?.[0] ?? null;

  let serviceCount = 0;
  if (firstRow && typeof firstRow === "object") {
    if (Object.prototype.hasOwnProperty.call(firstRow, "count")) {
      const value = (firstRow as Record<string, unknown>)["count"];
      serviceCount = typeof value === "number" ? value : Number(value);
    }
  } else if (Array.isArray(firstRow)) {
    const value: unknown = firstRow[0];
    serviceCount = typeof value === "number" ? value : Number(value);
  }

  console.log(JSON.stringify({ ok: true, serviceCount }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
