"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export default function SubmitButton({ isSubmitting, mode }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting} size="lg">
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {mode === "edit" ? "Saving Changes…" : "Saving Entry…"}
        </>
      ) : mode === "edit" ? (
        "Save Changes"
      ) : (
        "Save Daily Entry"
      )}
    </Button>
  );
}
