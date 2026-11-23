"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import ReflectionTextarea from "./ReflectionTextarea";

interface ActivitiesInputProps {
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function ActivitiesInput({ registration, error }: ActivitiesInputProps) {
  return (
    <ReflectionTextarea
      id="activities"
      label="Daily Activities"
      registration={registration}
      error={error}
      placeholder="What did you accomplish today?"
    />
  );
}
