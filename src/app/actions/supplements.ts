"use server";

import { AuthError, getSessionUserId } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import * as repo from "@/lib/repositories/dailyEntry";

export type SupplementDTO = { id: string; name: string };

const NAME_MAX = 40;

export async function getSupplements(): Promise<SupplementDTO[]> {
  try {
    const userId = await getSessionUserId();
    return await repo.listSupplements(userId);
  } catch (error) {
    // Signed-out / DB unreachable (e.g. preview without a database): the
    // caller falls back to its defaults. Only unexpected errors are logged.
    if (!(error instanceof AuthError)) console.error("getSupplements failed", error);
    return [];
  }
}

export async function addSupplement(
  rawName: unknown
): Promise<ActionResult & { supplement?: SupplementDTO }> {
  // Server Actions are public endpoints: never trust the declared type.
  if (typeof rawName !== "string") return { ok: false, error: "Supplement name is required." };
  const name = rawName.trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
  if (!name) return { ok: false, error: "Supplement name is required." };

  try {
    const userId = await getSessionUserId();
    const result = await repo.addSupplement(userId, name);
    if (!result.created) return { ok: false, error: "That supplement is already in your list." };
    return { ok: true, supplement: result.supplement };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: "Please sign in to continue." };
    if (error instanceof repo.LimitError) return { ok: false, error: error.message };
    console.error("addSupplement failed", error);
    return { ok: false, error: "Could not add the supplement." };
  }
}
