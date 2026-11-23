"use client";

import { useState } from "react";
import type { DailyEntry } from "@/types/dashboard";
import { EntryViewer } from ".";

interface EntryViewerContainerProps {
  entries: DailyEntry[];
}

export default function EntryViewerContainer({ entries }: EntryViewerContainerProps) {
  // Hook is called unconditionally (rules of hooks) — the empty state renders below.
  const [currentIndex, setCurrentIndex] = useState(0); // Start with most recent entry (index 0)

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 relative z-10">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Recent Entries
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No entries available</p>
      </div>
    );
  }

  // Clamp the index in case the entry list shrank (e.g. after a delete)
  const safeIndex = Math.min(currentIndex, entries.length - 1);

  return (
    <EntryViewer
      entries={entries}
      currentIndex={safeIndex}
      onNavigate={setCurrentIndex}
    />
  );
}
