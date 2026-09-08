import { env } from "cloudflare:workers";

const COOKIE_NAME = "wedding_guestbook_admin";
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function adminSecret(): string | null {
  const runtimeEnv = env as unknown as { GUESTBOOK_ADMIN_PASSWORD?: string };
  const secret = runtimeEnv.GUESTBOOK_ADMIN_PASSWORD?.trim();
  return secret && secret.length >= 12 ? secret : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hash(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let different = 0;
  for (let index = 0; index < left.length; index += 1) different |= left[index] ^ right[index];
  return different === 0;
}

async function signingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function isGuestbookAdminConfigured(): boolean {
  return adminSecret() !== null;
}

export async function verifyGuestbookAdminPassword(password: string): Promise<boolean> {
  const secret = adminSecret();
  if (!secret || !password) return false;
  const [providedHash, expectedHash] = await Promise.all([hash(password), hash(secret)]);
  return equalBytes(providedHash, expectedHash);
}

export async function createGuestbookAdminCookie(): Promise<string> {
  const secret = adminSecret();
  if (!secret) throw new Error("Guestbook admin access is not configured");

  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  const payload = `guestbook-admin:${expiresAt}`;
  const key = await signingKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  const token = `${expiresAt}.${toBase64Url(signature)}`;

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearGuestbookAdminCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function hasGuestbookAdminSession(request: Request): Promise<boolean> {
  const secret = adminSecret();
  if (!secret) return false;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!token) return false;
  const separator = token.indexOf(".");
  if (separator <= 0) return false;

  const expiresAtText = token.slice(0, separator);
  const signatureText = token.slice(separator + 1);
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const signature = fromBase64Url(signatureText);
  if (!signature) return false;

  const key = await signingKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(`guestbook-admin:${expiresAtText}`),
  );
}
