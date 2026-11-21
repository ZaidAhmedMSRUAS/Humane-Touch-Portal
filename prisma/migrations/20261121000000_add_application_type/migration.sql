DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ApplicationType'
  ) THEN
    CREATE TYPE "ApplicationType" AS ENUM ('FRESH', 'RENEWAL');
  END IF;
END $$;

ALTER TABLE "Application"
ADD COLUMN IF NOT EXISTS "applicationType" "ApplicationType";
