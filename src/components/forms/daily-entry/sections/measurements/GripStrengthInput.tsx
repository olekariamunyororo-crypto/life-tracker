"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import MeasurementInput from "./MeasurementInput";

interface GripStrengthInputProps {
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function GripStrengthInput({ registration, error }: GripStrengthInputProps) {
  return (
    <MeasurementInput
      id="gripStrength"
      label="Grip Strength (kg)"
      registration={registration}
      error={error}
      placeholder="Enter grip strength in kg"
      unit="kg"
    />
  );
}
