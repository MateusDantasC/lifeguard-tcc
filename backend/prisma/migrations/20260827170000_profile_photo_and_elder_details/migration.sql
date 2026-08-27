ALTER TABLE "User" ADD COLUMN "profilePhoto" TEXT;

ALTER TABLE "ElderProfile"
ADD COLUMN "bloodType" TEXT,
ADD COLUMN "allergies" TEXT,
ADD COLUMN "medications" TEXT,
ADD COLUMN "importantNotes" TEXT;
