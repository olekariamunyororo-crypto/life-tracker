"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MeasurementInputProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
  placeholder?: string;
  unit?: string;
}

export default function MeasurementInput({
  id,
  label,
  registration,
  error,
  placeholder = "0",
  unit,
}: MeasurementInputProps) {
  return (
    <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Input
        type="number"
        id={id}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        unit && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Measured in {unit}</p>
      )}
    </div>
  );
}
