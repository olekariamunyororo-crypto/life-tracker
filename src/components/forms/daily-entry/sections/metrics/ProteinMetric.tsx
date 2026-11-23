"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { theme } from "@/styles/theme";
import { GOALS } from "../../state/types";
import MetricInput from "./MetricInput";

interface ProteinMetricProps {
  value: number;
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function ProteinMetric({ value, registration, error }: ProteinMetricProps) {
  return (
    <div className="from-green-50/40 to-emerald-50/30 border-green-100/30">
      <MetricInput
        id="protein"
        label="Protein"
        value={value}
        registration={registration}
        error={error}
        goal={GOALS.protein}
        progressColor={theme.colors.metrics.protein}
        unit="grams"
        max="1000"
      />
    </div>
  );
}
