-- CreateTable
CREATE TABLE "DraftMatch" (
    "id" TEXT NOT NULL,
    "draftEventId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "gamesWon1" INTEGER NOT NULL DEFAULT 0,
    "gamesWon2" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftMatch_draftEventId_round_idx" ON "DraftMatch"("draftEventId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "DraftMatch_draftEventId_round_participant1Id_participant2Id_key" ON "DraftMatch"("draftEventId", "round", "participant1Id", "participant2Id");

-- AddForeignKey
ALTER TABLE "DraftMatch" ADD CONSTRAINT "DraftMatch_draftEventId_fkey" FOREIGN KEY ("draftEventId") REFERENCES "DraftEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftMatch" ADD CONSTRAINT "DraftMatch_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "DraftParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftMatch" ADD CONSTRAINT "DraftMatch_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "DraftParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
