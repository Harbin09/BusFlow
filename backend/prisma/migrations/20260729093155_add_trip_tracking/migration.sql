-- AlterTable
ALTER TABLE "BusLiveStatus" ADD COLUMN     "heading" DOUBLE PRECISION,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tripId" TEXT;

-- CreateIndex
CREATE INDEX "BusLiveStatus_tripId_idx" ON "BusLiveStatus"("tripId");

-- CreateIndex
CREATE INDEX "BusLiveStatus_timestamp_idx" ON "BusLiveStatus"("timestamp");
