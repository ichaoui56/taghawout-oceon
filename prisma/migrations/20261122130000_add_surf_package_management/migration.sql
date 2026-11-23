CREATE TYPE "SurfPackageReservationStatus" AS ENUM ('NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "SurfPackageCatalogSetting" (
    "id" TEXT NOT NULL DEFAULT 'catalog',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurfPackageCatalogSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SurfPackageReservation" (
    "id" TEXT NOT NULL,
    "status" "SurfPackageReservationStatus" NOT NULL DEFAULT 'NEW',
    "packageId" TEXT NOT NULL,
    "packageTitle" TEXT NOT NULL,
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

    CONSTRAINT "SurfPackageReservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SurfPackageReservation_status_createdAt_idx" ON "SurfPackageReservation"("status", "createdAt");
CREATE INDEX "SurfPackageReservation_bookingDate_bookingTime_idx" ON "SurfPackageReservation"("bookingDate", "bookingTime");