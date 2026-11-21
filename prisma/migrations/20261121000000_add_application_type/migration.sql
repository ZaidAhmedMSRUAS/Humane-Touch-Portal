CREATE TYPE "ApplicationType" AS ENUM ('FRESH', 'RENEWAL');

ALTER TABLE "Application"
ADD COLUMN "applicationType" "ApplicationType";
