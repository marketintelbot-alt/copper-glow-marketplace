import { createHmac, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "copper_glow_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "local-copper-glow-session-secret";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function createPasswordHash(password: string) {
  return scryptSync(password, "copper-glow-demo-salt", 64).toString("hex");
}

function verifyPasswordHash(password: string, hash: string) {
  const derived = scryptSync(password, "copper-glow-demo-salt", 64);
  const existing = Buffer.from(hash, "hex");
  return existing.length === derived.length && timingSafeEqual(derived, existing);
}

export async function createUserPasswordHash(password: string) {
  return createPasswordHash(password);
}

export async function verifyUserPassword(password: string, hash: string) {
  return verifyPasswordHash(password, hash);
}

export async function createSession(userId: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_TTL_SECONDS;
  const nonce = randomUUID();
  const payload = `${userId}.${expiresAt}.${nonce}`;
  const value = `${payload}.${sign(payload)}`;

  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUserId() {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 4) {
    return null;
  }

  const [userId, expiresAt, nonce, signature] = parts;
  const payload = `${userId}.${expiresAt}.${nonce}`;
  const expected = sign(payload);

  if (expected !== signature) {
    return null;
  }

  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return userId;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedProvider: true,
      school: true,
    },
  });
}

export async function requireUser(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/sign-in${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`);
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

export async function requireProvider() {
  const user = await requireUser("/provider/dashboard");
  if (user.role !== "PROVIDER" && user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
