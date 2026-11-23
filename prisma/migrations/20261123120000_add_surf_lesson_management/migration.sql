CREATE TYPE "SurfLessonReservationStatus" AS ENUM ('NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "SurfLessonCatalogSetting" (
    "id" TEXT NOT NULL DEFAULT 'catalog',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurfLessonCatalogSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SurfLessonReservation" (
    "id" TEXT NOT NULL,
    "status" "SurfLessonReservationStatus" NOT NULL DEFAULT 'NEW',
    "lessonId" TEXT NOT NULL,
    "lessonTitle" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "notes" TEXT,
    "bookingDate" DATE NOT NULL,
    "bookingTime" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,
    "estimatedTotal" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurfLessonReservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SurfLessonReservation_status_createdAt_idx" ON "SurfLessonReservation"("status", "createdAt");
CREATE INDEX "SurfLessonReservation_bookingDate_bookingTime_idx" ON "SurfLessonReservation"("bookingDate", "bookingTime");