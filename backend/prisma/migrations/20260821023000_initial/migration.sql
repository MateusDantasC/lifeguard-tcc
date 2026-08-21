CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "UserType" AS ENUM ('ELDER', 'CAREGIVER');
CREATE TYPE "LinkStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');
CREATE TYPE "ReadingSource" AS ENUM ('DEVICE', 'SIMULATOR', 'MANUAL');
CREATE TYPE "SignalQuality" AS ENUM ('GOOD', 'FAIR', 'POOR', 'NO_CONTACT', 'UNKNOWN');
CREATE TYPE "AlertType" AS ENUM ('HEART_RATE', 'TEMPERATURE', 'DEVICE_OFFLINE', 'SIGNAL_LOST');
CREATE TYPE "AlertStatus" AS ENUM ('NEW', 'SEEN', 'RESOLVED');
CREATE TYPE "AggregationPeriod" AS ENUM ('HOUR', 'DAY');

CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElderProfile" (
    "userId" UUID NOT NULL,
    "birthDate" TIMESTAMP(3),
    "medicalConditions" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    CONSTRAINT "ElderProfile_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "CaregiverElderLink" (
    "id" UUID NOT NULL,
    "caregiverId" UUID NOT NULL,
    "elderId" UUID NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CaregiverElderLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElderLinkCode" (
    "id" UUID NOT NULL,
    "elderId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElderLinkCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Device" (
    "id" UUID NOT NULL,
    "hardwareCode" TEXT NOT NULL,
    "elderId" UUID NOT NULL,
    "nickname" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pairedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reading" (
    "id" BIGSERIAL NOT NULL,
    "deviceId" UUID NOT NULL,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "ReadingSource" NOT NULL DEFAULT 'DEVICE',
    "signalQuality" "SignalQuality" NOT NULL DEFAULT 'UNKNOWN',
    "contactDetected" BOOLEAN NOT NULL DEFAULT true,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "invalidReason" TEXT,
    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AggregatedReading" (
    "id" BIGSERIAL NOT NULL,
    "deviceId" UUID NOT NULL,
    "period" "AggregationPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "sampleCount" INTEGER NOT NULL,
    "heartRateAverage" DOUBLE PRECISION,
    "heartRateMinimum" INTEGER,
    "heartRateMaximum" INTEGER,
    "temperatureAverage" DOUBLE PRECISION,
    "temperatureMinimum" DOUBLE PRECISION,
    "temperatureMaximum" DOUBLE PRECISION,
    CONSTRAINT "AggregatedReading_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertLimit" (
    "id" UUID NOT NULL,
    "elderId" UUID NOT NULL,
    "heartRateMinimum" INTEGER NOT NULL DEFAULT 50,
    "heartRateMaximum" INTEGER NOT NULL DEFAULT 120,
    "temperatureMinimum" DOUBLE PRECISION NOT NULL DEFAULT 35.5,
    "temperatureMaximum" DOUBLE PRECISION NOT NULL DEFAULT 37.8,
    "definedById" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AlertLimit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Alert" (
    "id" UUID NOT NULL,
    "elderId" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "measuredValue" DOUBLE PRECISION,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AlertStatus" NOT NULL DEFAULT 'NEW',
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationSent" (
    "id" UUID NOT NULL,
    "alertId" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "providerId" TEXT,
    CONSTRAINT "NotificationSent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PushToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "CaregiverElderLink_elderId_status_idx" ON "CaregiverElderLink"("elderId", "status");
CREATE UNIQUE INDEX "CaregiverElderLink_caregiverId_elderId_key" ON "CaregiverElderLink"("caregiverId", "elderId");
CREATE UNIQUE INDEX "ElderLinkCode_code_key" ON "ElderLinkCode"("code");
CREATE INDEX "ElderLinkCode_elderId_expiresAt_idx" ON "ElderLinkCode"("elderId", "expiresAt");
CREATE UNIQUE INDEX "Device_hardwareCode_key" ON "Device"("hardwareCode");
CREATE INDEX "Device_elderId_active_idx" ON "Device"("elderId", "active");
CREATE INDEX "Reading_deviceId_timestamp_idx" ON "Reading"("deviceId", "timestamp" DESC);
CREATE INDEX "Reading_timestamp_idx" ON "Reading"("timestamp");
CREATE INDEX "AggregatedReading_periodStart_idx" ON "AggregatedReading"("periodStart");
CREATE UNIQUE INDEX "AggregatedReading_deviceId_period_periodStart_key" ON "AggregatedReading"("deviceId", "period", "periodStart");
CREATE UNIQUE INDEX "AlertLimit_elderId_key" ON "AlertLimit"("elderId");
CREATE INDEX "Alert_elderId_timestamp_idx" ON "Alert"("elderId", "timestamp" DESC);
CREATE INDEX "Alert_status_timestamp_idx" ON "Alert"("status", "timestamp" DESC);
CREATE INDEX "NotificationSent_recipientId_readAt_idx" ON "NotificationSent"("recipientId", "readAt");
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");
CREATE INDEX "PushToken_userId_active_idx" ON "PushToken"("userId", "active");

ALTER TABLE "ElderProfile" ADD CONSTRAINT "ElderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaregiverElderLink" ADD CONSTRAINT "CaregiverElderLink_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaregiverElderLink" ADD CONSTRAINT "CaregiverElderLink_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElderLinkCode" ADD CONSTRAINT "ElderLinkCode_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Device" ADD CONSTRAINT "Device_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AggregatedReading" ADD CONSTRAINT "AggregatedReading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AlertLimit" ADD CONSTRAINT "AlertLimit_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AlertLimit" ADD CONSTRAINT "AlertLimit_definedById_fkey" FOREIGN KEY ("definedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationSent" ADD CONSTRAINT "NotificationSent_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationSent" ADD CONSTRAINT "NotificationSent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
