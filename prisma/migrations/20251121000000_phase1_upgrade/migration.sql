-- Phase 1 upgrade migration:
--   * user table + userId on daily_entry (multi-user readiness)
--   * soft delete column on daily_entry
--   * recovery + mood fields (sleep/mood/energy/notes)
--   * supplements become user-defined rows; supplement_log gains supplement_id FK
--   * goals table (Phase 3 groundwork)
-- Existing data is backfilled: every entry is assigned to the dev user, and the
-- old hard-coded supplement_name values become Supplement rows.
-- The existing supplement_log.entryId FK (supplement_log_entryId_fkey) is kept
-- as-is — it already references daily_entry with the right semantics.

CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_externalId_key" ON "user"("externalId");

-- Dev user matches src/lib/auth.ts fallback (used to backfill existing rows)
INSERT INTO "user" ("id", "email", "name")
VALUES ('local-dev-user', 'dev@local.test', 'Local Dev')
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "daily_entry" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'local-dev-user',
    ADD COLUMN "deletedAt" TIMESTAMP(3),
    ADD COLUMN "sleepHours" DOUBLE PRECISION,
    ADD COLUMN "sleepQuality" INTEGER,
    ADD COLUMN "mood" INTEGER,
    ADD COLUMN "energy" INTEGER,
    ADD COLUMN "notes" TEXT;

CREATE INDEX "daily_entry_userId_date_idx" ON "daily_entry"("userId", "date");

ALTER TABLE "daily_entry" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "daily_entry" ADD CONSTRAINT "daily_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "supplement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "supplement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "supplement_userId_name_key" ON "supplement"("userId", "name");

-- Backfill: one Supplement row per distinct old supplement_name value
INSERT INTO "supplement" ("id", "name", "userId")
SELECT md5(random()::text || clock_timestamp()::text), names."supplementName", 'local-dev-user'
FROM (
    SELECT DISTINCT sl."supplementName"
    FROM "supplement_log" sl
) AS names
WHERE NOT EXISTS (
    SELECT 1 FROM "supplement" s WHERE s."userId" = 'local-dev-user' AND s."name" = names."supplementName"
);

ALTER TABLE "supplement_log" ADD COLUMN "supplementId" TEXT;

UPDATE "supplement_log" AS sl
SET "supplementId" = s."id"
FROM "supplement" s
JOIN "daily_entry" de ON de."id" = sl."entryId"
WHERE s."userId" = de."userId" AND s."name" = sl."supplementName";

ALTER TABLE "supplement_log" ALTER COLUMN "supplementId" SET NOT NULL;

ALTER TABLE "supplement_log" DROP COLUMN "supplementName";
ALTER TABLE "supplement_log" ADD CONSTRAINT "supplement_log_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "supplement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "supplement_log_entryId_idx" ON "supplement_log"("entryId");

CREATE TABLE "goal" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "goal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "goal_userId_type_key" ON "goal"("userId", "type");

ALTER TABLE "goal" ADD CONSTRAINT "goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
