import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "aurelle_session";
const DEV_SESSION_SECRET = "local-aurelle-session-secret";
const LEGACY_PASSWORD_SALT = "aurelle-demo-salt";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

const currentUserSelect = {
  id: true,
  role: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarSeed: true,
  bio: true,
  schoolId: true,
  createdAt: true,
  updatedAt: true,
  school: true,
  ownedProvider: {
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      plan: true,
      providerType: true,
      approximateArea: true,
      isMobileService: true,
      trustScore: true,
    },
  },
} satisfies Prisma.UserSelect;

function getSessionSecret() {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  return DEV_SESSION_SECRET;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}.${hash}`;
}

function verifyPasswordHash(password: string, hash: string) {
  const [salt, existingHash] = hash.includes(".") ? hash.split(".", 2) : [LEGACY_PASSWORD_SALT, hash];
  const derived = scryptSync(password, salt, 64);
  const existing = Buffer.from(existingHash, "hex");
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
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
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
  const expected = Buffer.from(sign(payload), "hex");
  const actual = Buffer.from(signature, "hex");

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
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
    select: currentUserSelect,
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
