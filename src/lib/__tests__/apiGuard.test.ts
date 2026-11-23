import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));

import { AuthError } from "../auth";
import { LimitError } from "../repositories/dailyEntry";
import {
  HttpError,
  MAX_JSON_BODY_BYTES,
  assertSameOrigin,
  readJsonBody,
  toErrorResponse,
} from "../api-guard";

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("https://app.example.com/api/daily-entry", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...headers },
  });

describe("readJsonBody", () => {
  it("parses valid JSON", async () => {
    await expect(readJsonBody(post('{"a":1}'))).resolves.toEqual({ a: 1 });
  });

  it("rejects non-JSON content types (blocks text/plain CSRF-style posts) with 415", async () => {
    const req = post('{"a":1}', { "content-type": "text/plain" });
    await expect(readJsonBody(req)).rejects.toMatchObject({ status: 415 });
  });

  it("rejects bodies over the cap with 413, by declared length and by actual size", async () => {
    const big = JSON.stringify({ pad: "x".repeat(MAX_JSON_BODY_BYTES + 1) });
    await expect(readJsonBody(post(big))).rejects.toMatchObject({ status: 413 });
    const lying = post("{}", { "content-length": String(MAX_JSON_BODY_BYTES + 1) });
    await expect(readJsonBody(lying)).rejects.toMatchObject({ status: 413 });
  });

  it("rejects malformed JSON with 400", async () => {
    await expect(readJsonBody(post("{nope"))).rejects.toMatchObject({ status: 400 });
  });
});

describe("assertSameOrigin", () => {
  const req = (origin?: string) =>
    new Request("https://app.example.com/api/daily-entry", {
      method: "POST",
      headers: origin ? { origin } : {},
    });

  it("allows requests without an Origin (non-browser clients)", () => {
    expect(() => assertSameOrigin(req())).not.toThrow();
  });
  it("allows a same-origin browser request", () => {
    expect(() => assertSameOrigin(req("https://app.example.com"))).not.toThrow();
  });
  it("rejects a cross-origin browser request with 403", () => {
    expect(() => assertSameOrigin(req("https://evil.example.net"))).toThrow(HttpError);
    try {
      assertSameOrigin(req("https://evil.example.net"));
    } catch (e) {
      expect((e as HttpError).status).toBe(403);
    }
  });
  it("rejects a malformed Origin", () => {
    expect(() => assertSameOrigin(req("not a url"))).toThrow(HttpError);
  });
});

describe("toErrorResponse", () => {
  it("maps auth errors to their status", async () => {
    const r = toErrorResponse(new AuthError("Authentication required", 401), "x");
    expect(r.status).toBe(401);
  });
  it("maps limit errors to 422", () => {
    expect(toErrorResponse(new LimitError("too many"), "x").status).toBe(422);
  });
  it("hides internal error details behind a generic 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = toErrorResponse(new Error("password=hunter2 in connection string"), "Failed to create daily entry");
    expect(r.status).toBe(500);
    expect(JSON.stringify(await r.json())).not.toContain("hunter2");
    spy.mockRestore();
  });
});
