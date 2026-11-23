"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import ReflectionTextarea from "./ReflectionTextarea";

interface ImprovementsInputProps {
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function ImprovementsInput({ registration, error }: ImprovementsInputProps) {
  return (
    <ReflectionTextarea
      id="improvements"
      label="Areas for Improvement"
      registration={registration}
      error={error}
      placeholder="What could be better tomorrow?"
    />
  );
}
