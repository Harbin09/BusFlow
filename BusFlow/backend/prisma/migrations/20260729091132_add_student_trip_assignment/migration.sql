-- CreateEnum
CREATE TYPE "StudentTripAssignmentStatus" AS ENUM ('SCHEDULED', 'BOARDED', 'ALIGHTED', 'NO_SHOW', 'CANCELLED');

-- CreateTable
CREATE TABLE "StudentTripAssignment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "boardingStopId" TEXT,
    "status" "StudentTripAssignmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "boardingTime" TIMESTAMP(3),
    "alightingTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentTripAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentTripAssignment_studentId_idx" ON "StudentTripAssignment"("studentId");

-- CreateIndex
CREATE INDEX "StudentTripAssignment_tripId_idx" ON "StudentTripAssignment"("tripId");

-- CreateIndex
CREATE INDEX "StudentTripAssignment_status_idx" ON "StudentTripAssignment"("status");

-- CreateIndex
CREATE INDEX "StudentTripAssignment_boardingStopId_idx" ON "StudentTripAssignment"("boardingStopId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTripAssignment_studentId_tripId_key" ON "StudentTripAssignment"("studentId", "tripId");

-- AddForeignKey
ALTER TABLE "StudentTripAssignment" ADD CONSTRAINT "StudentTripAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTripAssignment" ADD CONSTRAINT "StudentTripAssignment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTripAssignment" ADD CONSTRAINT "StudentTripAssignment_boardingStopId_fkey" FOREIGN KEY ("boardingStopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
