export interface SupplementRef {
  id: string;
  name: string;
  userId: string;
}

export interface DailyEntry {
  id: string;
  date: Date;
  timeInOffice: number;
  calories: number;
  protein: number;
  bodyWeight: number | null;
  gripStrength: number | null;
  // Recovery + mood (Phase 2)
  sleepHours: number | null;
  sleepQuality: number | null;
  mood: number | null;
  energy: number | null;
  notes: string | null;
  activities: string | null;
  improvements: string | null;
  userId: string;
  deletedAt: Date | null;
  supplements: {
    id: string;
    entryId: string;
    supplementId: string;
    taken: boolean;
    supplement: SupplementRef;
  }[];
  gymSession: {
    id: string;
    type: string;
    exercises: {
      id: string;
      name: string;
      weight: number;
      reps: number;
      order: number;
    }[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  name: string;
  weight: number;
  reps: number;
  date: Date;
  createdAt: Date;
}

export interface GymSession {
  type: string;
  exercises: Exercise[];
  date: Date;
  bodyWeight: number | null;
  createdAt: Date;
}
