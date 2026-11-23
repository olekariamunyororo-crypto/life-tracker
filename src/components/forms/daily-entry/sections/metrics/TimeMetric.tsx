"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { theme } from "@/styles/theme";
import { GOALS } from "../../state/types";
import MetricInput from "./MetricInput";

interface TimeMetricProps {
  value: number;
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function TimeMetric({ value, registration, error }: TimeMetricProps) {
  return (
    <div className="from-blue-50/40 to-indigo-50/30 border-blue-100/30">
      <MetricInput
        id="timeInOffice"
        label="Time in Office"
        value={value}
        registration={registration}
        error={error}
        goal={GOALS.timeInOffice}
        progressColor={theme.colors.metrics.office}
        unit="hours"
        step="0.5"
        max="24"
      />
    </div>
  );
}
