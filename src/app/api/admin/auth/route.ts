import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import {
  ADMIN_COOKIE_NAME,
  createAdminSessionCookieValue,
  verifyAdminSessionCookieValue,
} from "@/lib/admin-auth";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  try {
    const { password } = (await request.json()) as { password?: string };
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const expected = requireEnv("ADMIN_PASSWORD");

    // Prevent timing leaks.
    const ok = safeEqual(password, expected);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const value = createAdminSessionCookieValue();

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/admin/auth]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  // Logout: clear cookie.
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest) {
  // Minimal auth check endpoint (useful for debugging).
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const ok = cookie ? verifyAdminSessionCookieValue(cookie) : false;
  return NextResponse.json({ ok }, { status: 200 });
}
