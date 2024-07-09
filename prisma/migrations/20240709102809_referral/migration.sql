-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "referrerName" TEXT NOT NULL,
    "referrerEmail" TEXT NOT NULL,
    "referrerPhone" TEXT,
    "referrerID" TEXT,
    "refereeName" TEXT,
    "refereeEmail" TEXT NOT NULL,
    "refereePhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerEmail_key" ON "Referral"("referrerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refereeEmail_key" ON "Referral"("refereeEmail");
