import { NextResponse } from "next/server";

function pick(name: string): string | null {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : null;
}

export async function GET() {
  const required = [
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
    "ADMIN_PASSWORD",
    "ADMIN_SECRET",
  ] as const;

  const missing = required.filter((key) => !pick(key));

  const optional = [
    "DATABASE_AUTH_TOKEN",
    "EMAIL_FROM",
    "NEXT_PUBLIC_BASE_URL",
  ];

  // Attempt DB connectivity without crashing the whole runtime if env is wrong.
  let dbOk = false;
  let dbError: string | null = null;

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.service.count();
    dbOk = true;
  } catch (err) {
    dbOk = false;
    dbError = err instanceof Error ? err.message : String(err);
  }

  const payload = {
    ok: missing.length === 0 && dbOk,
    missing,
    presentOptional: Object.fromEntries(
      optional.map((k) => [k, Boolean(pick(k))]),
    ),
    dbOk,
    dbError,
  };

  return NextResponse.json(payload, {
    status: payload.ok ? 200 : 500,
  });
}
