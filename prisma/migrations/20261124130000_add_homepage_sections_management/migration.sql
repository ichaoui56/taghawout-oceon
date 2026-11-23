CREATE TABLE "HomepageSectionsSetting" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSectionsSetting_pkey" PRIMARY KEY ("id")
);