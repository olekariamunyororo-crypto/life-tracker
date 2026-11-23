"use client";

import { TimeMetric, CaloriesMetric, ProteinMetric } from "./";
import type { DailyEntryFormInstance } from "../../state/types";

interface MetricsSectionProps {
  form: DailyEntryFormInstance;
}

export default function MetricsSection({ form }: MetricsSectionProps) {
  const { register, watch, formState } = form;
  const errors = formState.errors;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Daily Goals</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TimeMetric
          value={Number(watch("timeInOffice")) || 0}
          registration={register("timeInOffice")}
          error={errors.timeInOffice?.message}
        />
        <CaloriesMetric
          value={Number(watch("calories")) || 0}
          registration={register("calories")}
          error={errors.calories?.message}
        />
        <ProteinMetric
          value={Number(watch("protein")) || 0}
          registration={register("protein")}
          error={errors.protein?.message}
        />
      </div>
    </div>
  );
}
