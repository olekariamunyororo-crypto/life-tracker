import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Gatekeeper for every page and API route. Without this file Clerk's auth()
// cannot work at all.
//
// When Clerk is not configured the middleware is a no-op and src/lib/auth.ts
// decides (dev user outside production, fail-closed in production).

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

// Browsers fetch the PWA manifest and icons without credentials.
const isPublic = createRouteMatcher(["/manifest.webmanifest", "/icons(.*)"]);
const isApi = createRouteMatcher(["/api(.*)"]);

const protectedHandler = clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return;
  const { userId, redirectToSignIn } = await auth();
  if (userId) return;
  if (isApi(req)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return redirectToSignIn({ returnBackUrl: req.url });
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!clerkConfigured) return NextResponse.next();
  return protectedHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next internals and static files, always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
