"use server";

import { revalidatePath } from "next/cache";
import { AuthError, getSessionUserId } from "@/lib/auth";
import { dailyEntryInputSchema, entryIdSchema } from "@/lib/schemas/dailyEntry";
import type { ActionResult } from "@/lib/action-result";
import * as repo from "@/lib/repositories/dailyEntry";

// NOTE: Server Actions are public POST endpoints. TypeScript parameter types
// are NOT enforced at runtime, so every argument is validated here.

function revalidateViews() {
  revalidatePath("/dashboard");
  revalidatePath("/");
}

function failure(error: unknown, fallback: string): ActionResult {
  if (error instanceof AuthError) return { ok: false, error: "Please sign in to continue." };
  if (error instanceof repo.LimitError) return { ok: false, error: error.message };
  console.error(fallback, error);
  return { ok: false, error: fallback };
}

export async function saveDailyEntry(values: unknown, id?: unknown): Promise<ActionResult> {
  try {
    const userId = await getSessionUserId();

    let entryId: string | undefined;
    if (id !== undefined && id !== null) {
      const parsedId = entryIdSchema.safeParse(id);
      if (!parsedId.success) return { ok: false, error: "Entry not found." };
      entryId = parsedId.data;
    }

    const parsed = dailyEntryInputSchema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const entry = entryId
      ? await repo.updateEntry(entryId, userId, parsed.data)
      : await repo.createEntry(userId, parsed.data);
    if (!entry) return { ok: false, error: "Entry not found." };
  } catch (error) {
    return failure(error, "Could not save the entry. Please try again.");
  }

  revalidateViews();
  return { ok: true };
}

export async function deleteDailyEntry(id: unknown): Promise<ActionResult> {
  try {
    const userId = await getSessionUserId();
    const parsedId = entryIdSchema.safeParse(id);
    if (!parsedId.success) return { ok: false, error: "Entry not found." };

    const deleted = await repo.softDeleteEntry(parsedId.data, userId);
    if (!deleted) return { ok: false, error: "Entry not found." };
  } catch (error) {
    return failure(error, "Could not delete the entry. Please try again.");
  }

  revalidateViews();
  return { ok: true };
}
