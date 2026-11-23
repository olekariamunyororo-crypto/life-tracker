'use client';

import type { GymProgressTrackerProps } from './utils/types';
import { Container } from './layout/Container';
import { useGymProgress } from './hooks/useGymProgress';
import { StrengthSection } from './sections/StrengthSection';
import { RecordsSection } from './sections/RecordsSection';

export default function GymProgressTracker({ sessions }: GymProgressTrackerProps) {
  // Hooks run unconditionally (rules of hooks) — the empty state renders below.
  const {
    selectedExercise,
    exerciseNames,
    exerciseHistory,
    personalRecords,
    latestBodyWeight,
    handleCardClick,
  } = useGymProgress(sessions ?? []);

  if (!sessions || sessions.length === 0) {
    return (
      <Container title="Strength Progress">
        <div className="text-gray-500 text-center py-4">
          No gym sessions recorded yet
        </div>
      </Container>
    );
  }

  return (
    <Container title="Strength Progress">
      <StrengthSection 
        personalRecords={personalRecords}
        latestBodyWeight={latestBodyWeight}
      />

      <RecordsSection
        exerciseNames={exerciseNames}
        personalRecords={personalRecords}
        exerciseHistory={exerciseHistory}
        selectedExercise={selectedExercise}
        onCardClick={handleCardClick}
      />
    </Container>
  );
}
