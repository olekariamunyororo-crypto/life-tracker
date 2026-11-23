import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { dailyEntryInputSchema, entryIdSchema } from "@/lib/schemas/dailyEntry";
import { softDeleteEntry, updateEntry } from "@/lib/repositories/dailyEntry";
import { assertSameOrigin, readJsonBody, toErrorResponse } from "@/lib/api-guard";

// Thin REST endpoint kept for non-browser clients. All queries are scoped to
// the authenticated user via the repository layer.

type RouteContext = { params: Promise<{ id: string }> };

async function parseId(context: RouteContext): Promise<string | null> {
  const { id } = await context.params;
  const parsed = entryIdSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

const notFound = () => NextResponse.json({ error: "Entry not found" }, { status: 404 });

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const userId = await getSessionUserId();
    const id = await parseId(context);
    if (!id) return notFound();

    const deleted = await softDeleteEntry(id, userId);
    if (!deleted) return notFound();

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete entry");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const userId = await getSessionUserId();
    const id = await parseId(context);
    if (!id) return notFound();

    const body = await readJsonBody(request);
    const parsed = dailyEntryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateEntry(id, userId, parsed.data);
    if (!updated) return notFound();

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error, "Failed to update entry");
  }
}
