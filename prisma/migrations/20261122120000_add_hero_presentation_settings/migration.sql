CREATE TABLE "HeroPresentationSetting" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroPresentationSetting_pkey" PRIMARY KEY ("id")
);