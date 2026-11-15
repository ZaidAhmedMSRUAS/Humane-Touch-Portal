ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "academicYear" TEXT;

UPDATE "Application"
SET "academicYear" = CASE
  WHEN split_part("referenceNumber", '/', 2) ~ '^[0-9]{2}-[0-9]{2}$'
    THEN '20' || left(split_part("referenceNumber", '/', 2), 2) || '-20' || right(split_part("referenceNumber", '/', 2), 2)
  WHEN split_part("referenceNumber", '/', 2) ~ '^20[0-9]{2}-20[0-9]{2}$'
    THEN split_part("referenceNumber", '/', 2)
  ELSE NULL
END
WHERE "academicYear" IS NULL AND "referenceNumber" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Application_academicYear_status_idx"
ON "Application" ("academicYear", "status");
