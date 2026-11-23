import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: mocks.findUnique, create: mocks.create } },
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));

import { AuthError, DEV_USER_ID, getSessionUserId } from "../auth";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
  vi.stubEnv("CLERK_SECRET_KEY", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("getSessionUserId — Clerk NOT configured", () => {
  it("FAILS CLOSED in production (no shared anonymous user on the public internet)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const err = await getSessionUserId().catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
    expect(err.status).toBe(503);
  });

  it("uses the stable dev user outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(getSessionUserId()).resolves.toBe(DEV_USER_ID);
  });
});

describe("getSessionUserId — Clerk configured", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_x");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_x");
  });

  it("rejects a signed-out request instead of falling back to the dev user (even in dev)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.auth.mockResolvedValue({ userId: null });
    const err = await getSessionUserId().catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
    expect(err.status).toBe(401);
  });

  it("does not swallow Clerk failures into the dev user", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.auth.mockRejectedValue(new Error("clerk down"));
    await expect(getSessionUserId()).rejects.toThrow("clerk down");
  });

  it("provisions the user row on first request and returns the Clerk id", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_123" });
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockResolvedValue({});
    await expect(getSessionUserId()).resolves.toBe("user_123");
    expect(mocks.create).toHaveBeenCalledWith({
      data: { id: "user_123", externalId: "user_123", email: "user_123@users.clerk.invalid" },
    });
  });

  it("does not write when the user already exists", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_123" });
    mocks.findUnique.mockResolvedValue({ id: "user_123" });
    await getSessionUserId();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("tolerates losing the first-request creation race (unique violation)", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_123" });
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    await expect(getSessionUserId()).resolves.toBe("user_123");
  });

  it("surfaces other provisioning errors", async () => {
    mocks.auth.mockResolvedValue({ userId: "user_123" });
    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockRejectedValue(Object.assign(new Error("db down"), { code: "P1001" }));
    await expect(getSessionUserId()).rejects.toThrow("db down");
  });
});
