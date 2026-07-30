-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "timetableId" TEXT;

-- CreateIndex
CREATE INDEX "Trip_timetableId_idx" ON "Trip"("timetableId");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
