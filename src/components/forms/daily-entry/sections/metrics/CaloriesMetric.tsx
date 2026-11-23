"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { theme } from "@/styles/theme";
import { GOALS } from "../../state/types";
import MetricInput from "./MetricInput";

interface CaloriesMetricProps {
  value: number;
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function CaloriesMetric({ value, registration, error }: CaloriesMetricProps) {
  return (
    <div className="from-red-50/40 to-orange-50/30 border-red-100/30">
      <MetricInput
        id="calories"
        label="Calories"
        value={value}
        registration={registration}
        error={error}
        goal={GOALS.calories}
        progressColor={theme.colors.metrics.calories}
        isInverse
        unit="kcal"
        max="20000"
      />
    </div>
  );
}
