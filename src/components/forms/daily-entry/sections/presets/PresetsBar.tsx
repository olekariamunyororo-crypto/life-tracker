"use client";

// Phase 2: one-tap presets that pre-fill common day shapes.
import { Zap } from "lucide-react";
import type { Preset } from "@/lib/schemas/dailyEntry";

interface PresetsBarProps {
  presets: Preset[];
  onApply: (preset: Preset) => void;
}

export default function PresetsBar({ presets, onApply }: PresetsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Zap className="h-4 w-4" />
        Quick fill:
      </span>
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={preset.description}
          onClick={() => onApply(preset)}
          className="px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
