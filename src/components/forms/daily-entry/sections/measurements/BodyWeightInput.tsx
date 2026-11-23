"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import MeasurementInput from "./MeasurementInput";

interface BodyWeightInputProps {
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function BodyWeightInput({ registration, error }: BodyWeightInputProps) {
  return (
    <MeasurementInput
      id="bodyWeight"
      label="Body Weight (lbs)"
      registration={registration}
      error={error}
      placeholder="Enter weight in lbs"
      unit="lbs"
    />
  );
}
