"use client";

import ActivitiesInput from "./ActivitiesInput";
import ImprovementsInput from "./ImprovementsInput";
import type { DailyEntryFormInstance } from "../../state/types";

interface ReflectionSectionProps {
  form: DailyEntryFormInstance;
}

export default function ReflectionSection({ form }: ReflectionSectionProps) {
  const { register, formState } = form;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/40 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100/30 dark:border-amber-900/50 backdrop-blur-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
        Daily Reflection
      </h3>
      <ActivitiesInput
        registration={register("activities")}
        error={formState.errors.activities?.message}
      />
      <ImprovementsInput
        registration={register("improvements")}
        error={formState.errors.improvements?.message}
      />
    </div>
  );
}
