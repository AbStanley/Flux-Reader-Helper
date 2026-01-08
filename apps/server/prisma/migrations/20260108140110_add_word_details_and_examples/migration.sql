-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "pronunciation" TEXT,
ADD COLUMN     "sourceLanguage" TEXT,
ADD COLUMN     "sourceTitle" TEXT,
ADD COLUMN     "targetLanguage" TEXT;

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "translation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
