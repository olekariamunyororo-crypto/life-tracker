"use client";

import BodyWeightInput from "./BodyWeightInput";
import GripStrengthInput from "./GripStrengthInput";
import type { DailyEntryFormInstance } from "../../state/types";

interface MeasurementsSectionProps {
  form: DailyEntryFormInstance;
}

export default function MeasurementsSection({ form }: MeasurementsSectionProps) {
  const { register, formState } = form;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Other Measurements
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BodyWeightInput
          registration={register("bodyWeight")}
          error={formState.errors.bodyWeight?.message}
        />
        <GripStrengthInput
          registration={register("gripStrength")}
          error={formState.errors.gripStrength?.message}
        />
      </div>
    </div>
  );
}
