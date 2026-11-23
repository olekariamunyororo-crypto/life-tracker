"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { DailyEntryFormInstance } from "../../state/types";
import type { SupplementDTO } from "@/app/actions/supplements";
import SupplementCheckbox from "./SupplementCheckbox";
import { prettySupplementName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SupplementsSectionProps {
  form: DailyEntryFormInstance;
  supplementList: SupplementDTO[];
  onAdd: (name: string) => Promise<void>;
}

export default function SupplementsSection({ form, supplementList, onAdd }: SupplementsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const supplements = form.watch("supplements") ?? {};

  const toggle = (name: string) => {
    form.setValue(
      "supplements",
      { ...supplements, [name]: !supplements[name] },
      { shouldValidate: false }
    );
  };

  const submitAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await onAdd(newName);
      setNewName("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/40 to-violet-50/30 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-100/30 dark:border-purple-900/50">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Daily Supplements
      </h3>
      <div className="space-y-3">
        {supplementList.map((supplement) => (
          <SupplementCheckbox
            key={supplement.id}
            name={supplement.name}
            label={prettySupplementName(supplement.name)}
            checked={Boolean(supplements[supplement.name])}
            onChange={() => toggle(supplement.name)}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add your own supplement…"
          className="h-9"
          maxLength={40}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submitAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void submitAdd()}
          disabled={adding || !newName.trim()}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Your list is saved to your account — tick what you took today.
      </p>
    </div>
  );
}
