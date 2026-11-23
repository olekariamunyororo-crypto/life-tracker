// Auth abstraction.
//
// SECURITY MODEL
//   * Clerk configured  -> the signed-in Clerk user is the only identity. If
//     there is no session (or Clerk errors) the request is rejected: we NEVER
//     fall back to a shared user.
//   * Clerk NOT configured -> a stable single "dev" user is used, but ONLY when
//     NODE_ENV !== "production". In production the app fails closed, so a
//     misconfigured deployment can never expose one person's data to the
//     public internet.
//
// Every repository query is scoped by the id returned here.

import { prisma } from "@/lib/db";

export const DEV_USER_ID = "local-dev-user";

export class AuthError extends Error {
  readonly status: 401 | 503;
  constructor(message = "Authentication required", status: 401 | 503 = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

/** Make sure a `user` row exists for this id (first-request provisioning). */
async function ensureUserRow(userId: string, email: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (existing) return;
  try {
    await prisma.user.create({
      data: { id: userId, externalId: userId, email },
    });
  } catch (error) {
    // Lost a race with a concurrent first request (unique violation) — fine.
    const code = (error as { code?: string } | null)?.code;
    if (code !== "P2002") throw error;
  }
}

export async function getSessionUserId(): Promise<string> {
  if (isClerkConfigured()) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) throw new AuthError("Authentication required", 401);
    // email is NOT NULL + unique in the schema; Clerk ids are unique, so this
    // placeholder cannot collide. A webhook can replace it with the real email.
    await ensureUserRow(userId, `${userId}@users.clerk.invalid`);
    return userId;
  }

  if (process.env.NODE_ENV === "production") {
    throw new AuthError(
      "Authentication is not configured (set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY)",
      503
    );
  }
  return DEV_USER_ID;
}
