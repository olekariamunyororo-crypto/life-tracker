"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  registration: UseFormRegisterReturn;
  error?: FieldError["message"];
}

export default function DateField({ registration, error }: DateFieldProps) {
  return (
    <div>
      <Label htmlFor="date" className="mb-1 block">
        Date
      </Label>
      <Input type="date" id="date" {...registration} required />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
