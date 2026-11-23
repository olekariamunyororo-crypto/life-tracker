import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";
import { LimitError } from "@/lib/repositories/dailyEntry";

// Shared guards for Route Handlers (Server Actions get Next's built-in
// same-origin check and a 1 MB body limit; Route Handlers get neither).

export const MAX_JSON_BODY_BYTES = 64 * 1024;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * CSRF defence for cookie-authenticated browsers: if the request carries an
 * Origin header it must match this host. Non-browser clients (no Origin) pass.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Cross-origin request rejected");
  }
  const allowed = new Set(
    [request.headers.get("host"), request.headers.get("x-forwarded-host"), new URL(request.url).host].filter(
      (h): h is string => Boolean(h)
    )
  );
  if (!allowed.has(originHost)) throw new HttpError(403, "Cross-origin request rejected");
}

/** Reads a JSON body with a content-type check and a hard size cap. */
export async function readJsonBody(
  request: Request,
  maxBytes: number = MAX_JSON_BODY_BYTES
): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Content-Type must be application/json");
  }

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new HttpError(413, "Request body too large");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new HttpError(413, "Request body too large");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

/** Maps known errors to safe responses; anything else is a generic 500 (details only in logs). */
export function toErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof LimitError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
