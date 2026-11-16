CREATE TABLE "CustomerReview" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateAdded" DATE NOT NULL,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerReview_isPublished_dateAdded_idx" ON "CustomerReview"("isPublished", "dateAdded");

CREATE TABLE "GoogleReviewSetting" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "location" TEXT NOT NULL DEFAULT '',
    "googleUrl" TEXT NOT NULL DEFAULT '',
    "HostelGrowthUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleReviewSetting_pkey" PRIMARY KEY ("id")
);