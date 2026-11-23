"use client";

import { WORKOUT_TYPES } from "@/lib/workoutData";
import type { GymSessionType } from "@/lib/schemas/dailyEntry";
import type { DailyEntryFormInstance } from "../../state/types";

interface GymSessionTypeSelectorProps {
  form: DailyEntryFormInstance;
}

export default function GymSessionTypeSelector({ form }: GymSessionTypeSelectorProps) {
  const value = (form.watch("gymSession")?.type ?? null) as GymSessionType | null;

  const selectType = (type: GymSessionType) => {
    form.setValue(
      "gymSession",
      value === type
        ? null
        : { type, exercises: form.getValues("gymSession")?.exercises ?? [] },
      { shouldValidate: false }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Gym Session</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {WORKOUT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => selectType(type)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium capitalize
              transition-colors duration-200
              ${
                value === type
                  ? "bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-2 border-sky-400"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {value && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Selected: <span className="font-medium capitalize">{value}</span>
        </p>
      )}
    </div>
  );
}
