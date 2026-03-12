import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(payloadB64: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export type AdminSessionPayload = {
  iat: number;
  exp: number;
};

export function createAdminSessionCookieValue(now: Date = new Date()): string {
  const secret = requireEnv("ADMIN_SECRET");
  const issuedAt = Math.floor(now.getTime() / 1000);
  const expiresAt = issuedAt + 60 * 60 * 24 * 7; // 7 days

  const payload: AdminSessionPayload = { iat: issuedAt, exp: expiresAt };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionCookieValue(value: string): boolean {
  const secret = requireEnv("ADMIN_SECRET");

  const [payloadB64, sig] = value.split(".");
  if (!payloadB64 || !sig) return false;

  const expectedSig = sign(payloadB64, secret);
  if (!timingSafeEqual(sig, expectedSig)) return false;

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64)) as AdminSessionPayload;
  } catch {
    return false;
  }

  if (typeof payload.exp !== "number") return false;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return false;

  return true;
}

async function getCookieStore() {
  // In recent Next.js versions, cookies() can be sync or async depending on
  // runtime; always awaiting keeps usage consistent.
  return await cookies();
}

export async function getAdminSessionCookieValue(): Promise<string | null> {
  const store = await getCookieStore();
  const cookie = store.get(COOKIE_NAME);
  return cookie?.value ?? null;
}

export async function isAdminAuthed(): Promise<boolean> {
  const value = await getAdminSessionCookieValue();
  if (!value) return false;
  try {
    return verifyAdminSessionCookieValue(value);
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<boolean> {
  // Helper for API routes / server components. Returns boolean so callers can
  // decide whether to redirect or return 401.
  return await isAdminAuthed();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
