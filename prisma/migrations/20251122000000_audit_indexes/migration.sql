-- Index the foreign keys that are joined on every dashboard load.
-- (Postgres does not index FK columns automatically.)
CREATE INDEX IF NOT EXISTS "gym_exercise_sessionId_idx" ON "gym_exercise"("sessionId");
CREATE INDEX IF NOT EXISTS "supplement_log_supplementId_idx" ON "supplement_log"("supplementId");
