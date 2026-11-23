import type { DailyEntryFormValues } from "./types";

// Offline draft: the in-progress form is persisted to localStorage so a reload
// or a flaky connection never loses what the user typed (create mode only).

const STORAGE_KEY = "daily-entry-form-draft";

export function loadDraft(): Partial<DailyEntryFormValues> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DailyEntryFormValues>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.error("Failed to read the daily-entry draft:", error);
    return null;
  }
}

export function saveDraft(values: DailyEntryFormValues): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    // Quota / private-mode errors are non-fatal for the form itself
    console.error("Failed to persist the daily-entry draft:", error);
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear the daily-entry draft:", error);
  }
}
