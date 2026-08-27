-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_tripId_date_key" ON "Itinerary"("tripId", "date");
