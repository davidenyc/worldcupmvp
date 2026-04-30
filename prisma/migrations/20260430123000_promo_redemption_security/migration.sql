-- CreateTable
CREATE TABLE "PromoRedemption" (
  "id" TEXT NOT NULL,
  "profileId" UUID NOT NULL,
  "promoId" TEXT NOT NULL,
  "redemptionCode" TEXT NOT NULL,
  "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PromoRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromoRedemption_promoId_idx" ON "PromoRedemption"("promoId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoRedemption_profileId_promoId_key" ON "PromoRedemption"("profileId", "promoId");

-- AddForeignKey
ALTER TABLE "PromoRedemption"
ADD CONSTRAINT "PromoRedemption_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
