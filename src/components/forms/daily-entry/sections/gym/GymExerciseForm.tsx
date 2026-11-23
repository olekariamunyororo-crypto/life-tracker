"use client";

import { EXERCISE_OPTIONS } from "@/lib/workoutData";
import type { WorkoutType } from "@/lib/workoutData";
import type { GymSessionType } from "@/lib/schemas/dailyEntry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DailyEntryFormInstance, ExerciseRow } from "../../state/types";

interface GymExerciseFormProps {
  form: DailyEntryFormInstance;
  sessionType: GymSessionType;
}

export default function GymExerciseForm({ form, sessionType }: GymExerciseFormProps) {
  const availableExercises = EXERCISE_OPTIONS[sessionType as WorkoutType] ?? [];

  // watch() returns DeepPartial-nested values; the field-array rows are fully
  // populated by this component, so the cast is safe.
  const exercises = (form.watch("gymSession")?.exercises ?? []) as ExerciseRow[];
  const errors = form.formState.errors.gymSession?.exercises;

  const update = (next: ExerciseRow[]) => {
    form.setValue(
      "gymSession.exercises",
      next.map((ex, index) => ({ ...ex, order: index })),
      { shouldValidate: false }
    );
  };

  const addExercise = () => {
    update([
      ...exercises,
      { id: crypto.randomUUID(), name: "", weight: "", reps: "", order: exercises.length },
    ]);
  };

  const updateExercise = (id: string, field: keyof ExerciseRow, value: string) => {
    update(exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const removeExercise = (id: string) => {
    update(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Exercise {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => removeExercise(exercise.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor={`name-${exercise.id}`} className="mb-1 block">
                Exercise Name
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  list={`exercises-${exercise.id}`}
                  id={`name-${exercise.id}`}
                  value={exercise.name}
                  onChange={(e) => updateExercise(exercise.id, "name", e.target.value)}
                  placeholder="Select or type exercise name"
                  aria-invalid={Boolean(errors?.[index]?.name)}
                  required
                />
                <datalist id={`exercises-${exercise.id}`}>
                  {availableExercises.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              {errors?.[index]?.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors[index]?.name?.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`weight-${exercise.id}`} className="mb-1 block">
                  Weight (lbs)
                </Label>
                <Input
                  type="number"
                  id={`weight-${exercise.id}`}
                  value={exercise.weight}
                  onChange={(e) => updateExercise(exercise.id, "weight", e.target.value)}
                  min="0"
                  step="0.5"
                  placeholder="0"
                  aria-invalid={Boolean(errors?.[index]?.weight)}
                  required
                />
                {errors?.[index]?.weight && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[index]?.weight?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={`reps-${exercise.id}`} className="mb-1 block">
                  Reps
                </Label>
                <Input
                  type="number"
                  id={`reps-${exercise.id}`}
                  value={exercise.reps}
                  onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                  min="0"
                  placeholder="0"
                  aria-invalid={Boolean(errors?.[index]?.reps)}
                  required
                />
                {errors?.[index]?.reps && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[index]?.reps?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExercise}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
      >
        + Add Exercise
      </button>
    </div>
  );
}
