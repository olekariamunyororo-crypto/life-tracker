"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReflectionTextareaProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
  placeholder: string;
}

export default function ReflectionTextarea({
  id,
  label,
  registration,
  error,
  placeholder,
}: ReflectionTextareaProps) {
  return (
    <div className="mb-6 last:mb-0">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Textarea
        id={id}
        rows={4}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
