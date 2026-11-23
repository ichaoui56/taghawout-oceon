CREATE TABLE "ExperienceGallerySetting" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceGallerySetting_pkey" PRIMARY KEY ("id")
);