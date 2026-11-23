"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import CircularProgress from "@/components/ui/CircularProgress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MetricInputProps {
  id: string;
  label: string;
  value: number;
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
  goal: number;
  progressColor: string;
  isInverse?: boolean;
  unit?: string;
  step?: string;
  min?: string;
  max?: string;
}

export default function MetricInput({
  id,
  label,
  value,
  registration,
  error,
  goal,
  progressColor,
  isInverse = false,
  unit,
  step = "1",
  min = "0",
  max,
}: MetricInputProps) {
  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-br from-opacity-40 to-opacity-30 border border-opacity-30">
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor={id}>{label}</Label>
        <div className="w-16 h-16">
          <CircularProgress
            value={value}
            max={goal}
            progressColor={progressColor}
            isInverse={isInverse}
            size={64}
            strokeWidth={6}
          />
        </div>
      </div>
      <Input
        type="number"
        id={id}
        placeholder="0"
        step={step}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Goal: {isInverse ? `under ${goal}` : goal}
          {unit ? ` ${unit}` : ""}
        </p>
      )}
    </div>
  );
}
