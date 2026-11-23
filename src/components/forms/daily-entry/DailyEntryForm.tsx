"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  dailyEntryFormSchema,
  PRESETS,
  type DailyEntryFormOutput,
  type DailyEntryFormValues,
  type GymSessionType,
  type Preset,
} from "@/lib/schemas/dailyEntry";
import { saveDailyEntry } from "@/app/actions/dailyEntry";
import { toDateKey } from "@/lib/dates";
import { addSupplement, getSupplements, type SupplementDTO } from "@/app/actions/supplements";
import type { DailyEntry } from "@/types/dashboard";
import { DEFAULT_SUPPLEMENT_NAMES, type DailyEntryFormProps } from "./state/types";
import { clearDraft, loadDraft, saveDraft } from "./state/useLocalStorage";
import {
  FormLayout,
  StatusMessage,
  SubmitButton,
} from "./shared";
import {
  DateField,
  MetricsSection,
  MeasurementsSection,
  ReflectionSection,
  RecoverySection,
  SupplementsSection,
  GymSessionTypeSelector,
  GymExerciseForm,
  PresetsBar,
} from "./sections";

function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function buildDefaultValues(
  entry: DailyEntry | undefined,
  supplementNames: readonly string[]
): DailyEntryFormValues {
  const supplements: Record<string, boolean> = {};
  for (const name of supplementNames) {
    supplements[name] = entry
      ? entry.supplements.some((s) => s.supplement.name === name && s.taken)
      : false;
  }

  return {
    date: entry ? toDateKey(entry.date) : "",
    timeInOffice: entry ? String(entry.timeInOffice) : "0",
    calories: entry ? String(entry.calories) : "0",
    protein: entry ? String(entry.protein) : "0",
    bodyWeight: entry?.bodyWeight != null ? String(entry.bodyWeight) : "",
    gripStrength: entry?.gripStrength != null ? String(entry.gripStrength) : "",
    sleepHours: entry?.sleepHours != null ? String(entry.sleepHours) : "",
    sleepQuality: entry?.sleepQuality != null ? String(entry.sleepQuality) : "",
    mood: entry?.mood != null ? String(entry.mood) : "",
    energy: entry?.energy != null ? String(entry.energy) : "",
    notes: entry?.notes ?? "",
    activities: entry?.activities ?? "",
    improvements: entry?.improvements ?? "",
    supplements,
    gymSession: entry?.gymSession
      ? {
          // gym_session.type is a plain string in the DB; the schema enum is the contract
          type: entry.gymSession.type as GymSessionType,
          exercises: entry.gymSession.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            weight: String(ex.weight),
            reps: String(ex.reps),
            order: ex.order,
          })),
        }
      : null,
  };
}

export default function DailyEntryForm({
  initialData,
  onSuccess,
  mode = "create",
}: DailyEntryFormProps) {
  const router = useRouter();
  const [supplementList, setSupplementList] = useState<SupplementDTO[]>(
    DEFAULT_SUPPLEMENT_NAMES.map((name) => ({ id: name, name }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const form = useForm<DailyEntryFormValues, unknown, DailyEntryFormOutput>({
    resolver: zodResolver(dailyEntryFormSchema),
    defaultValues: useMemo(
      () => buildDefaultValues(initialData, DEFAULT_SUPPLEMENT_NAMES),
      [initialData]
    ),
  });

  // Load the user's supplement list (falls back to defaults when DB is unreachable)
  useEffect(() => {
    let cancelled = false;
    getSupplements().then((list) => {
      if (cancelled || list.length === 0) return;
      setSupplementList(list);
      // Re-sync the supplements map with the real list (edit mode may add names)
      const current = form.getValues("supplements") ?? {};
      const merged: Record<string, boolean> = { ...current };
      for (const s of list) if (!(s.name in merged)) merged[s.name] = false;
      if (initialData) {
        for (const s of initialData.supplements) {
          merged[s.supplement.name] = s.taken;
        }
      }
      form.setValue("supplements", merged, { shouldValidate: false });
    });
    return () => {
      cancelled = true;
    };
  }, [form, initialData]);

  // Mount-time init: today's date + restore the saved draft (create mode only).
  // Done in an effect so SSR and the client render never disagree on the date.
  useEffect(() => {
    if (mode !== "create") return;
    const draft = loadDraft();
    if (draft) {
      form.reset({
        ...buildDefaultValues(undefined, DEFAULT_SUPPLEMENT_NAMES),
        ...draft,
        supplements: { ...(draft.supplements ?? {}) },
        gymSession: draft.gymSession ?? null,
      });
    } else {
      form.setValue("date", todayISO(), { shouldValidate: false });
    }
  }, [form, mode]);

  // Persist the draft as the user types (create mode only)
  useEffect(() => {
    if (mode !== "create") return;
    const subscription = form.watch((values) => {
      saveDraft(values as DailyEntryFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, mode]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const result = await saveDailyEntry(values, mode === "edit" ? initialData?.id : undefined);

      if (!result.ok) {
        setSubmitStatus({
          type: "error",
          message: result.error ?? "Failed to save entry. Please try again.",
        });
        return;
      }

      setSubmitStatus({
        type: "success",
        message: `Daily entry ${mode === "edit" ? "updated" : "saved"} successfully!`,
      });

      if (mode === "create") {
        clearDraft();
        form.reset(buildDefaultValues(undefined, DEFAULT_SUPPLEMENT_NAMES));
        form.setValue("date", todayISO(), { shouldValidate: false });
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.refresh();
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  });

  const applyPreset = (preset: Preset) => {
    const { apply } = preset;
    form.setValue("timeInOffice", apply.timeInOffice, { shouldValidate: false });
    if (apply.calories !== "") form.setValue("calories", apply.calories, { shouldValidate: false });
    if (apply.protein !== "") form.setValue("protein", apply.protein, { shouldValidate: false });
    form.setValue(
      "supplements",
      { ...(form.getValues("supplements") ?? {}), ...apply.supplements },
      { shouldValidate: false }
    );
    form.setValue(
      "gymSession",
      apply.gymSession ? { ...apply.gymSession, exercises: [] } : null,
      { shouldValidate: false }
    );
  };

  const handleAddSupplement = async (name: string) => {
    const result = await addSupplement(name);
    if (!result.ok || !result.supplement) {
      setSubmitStatus({ type: "error", message: result.error ?? "Could not add supplement." });
      return;
    }
    setSupplementList((prev) =>
      [...prev, result.supplement!].sort((a, b) => a.name.localeCompare(b.name))
    );
    form.setValue(
      "supplements",
      { ...(form.getValues("supplements") ?? {}), [result.supplement.name]: true },
      { shouldValidate: false }
    );
  };

  const selectedType = form.watch("gymSession")?.type ?? null;

  return (
    <FormLayout mode={mode}>
      <StatusMessage type={submitStatus.type} message={submitStatus.message} />

      <form onSubmit={onSubmit} className="space-y-8">
        {mode === "create" && <PresetsBar onApply={applyPreset} presets={PRESETS} />}

        {/* Date field */}
        <DateField
          registration={form.register("date")}
          error={form.formState.errors.date?.message}
        />

        {/* Daily Goals */}
        <MetricsSection form={form} />

        {/* Other Measurements */}
        <MeasurementsSection form={form} />

        {/* Gym Session */}
        <GymSessionTypeSelector form={form} />

        {selectedType && (
          <GymExerciseForm form={form} sessionType={selectedType} />
        )}

        {/* Supplements */}
        <SupplementsSection
          form={form}
          supplementList={supplementList}
          onAdd={handleAddSupplement}
        />

        {/* Recovery + mood (Phase 2) */}
        <RecoverySection form={form} />

        {/* Daily Reflection */}
        <ReflectionSection form={form} />

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <SubmitButton isSubmitting={isSubmitting} mode={mode} />
        </div>
      </form>
    </FormLayout>
  );
}
