import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { dailyEntryInputSchema } from "@/lib/schemas/dailyEntry";
import { createEntry } from "@/lib/repositories/dailyEntry";
import { assertSameOrigin, readJsonBody, toErrorResponse } from "@/lib/api-guard";

// Thin REST endpoint kept for non-browser clients (mobile/webhook parity).
// Browser traffic goes through the Server Action in src/app/actions/dailyEntry.ts.
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const userId = await getSessionUserId();
    const body = await readJsonBody(request);

    const parsed = dailyEntryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const entry = await createEntry(userId, parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create daily entry");
  }
}
