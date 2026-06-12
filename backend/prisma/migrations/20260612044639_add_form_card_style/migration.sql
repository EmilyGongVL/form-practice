-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "borderColor" TEXT,
ADD COLUMN     "borderRadius" INTEGER DEFAULT 8,
ADD COLUMN     "borderStyle" TEXT DEFAULT 'solid',
ADD COLUMN     "borderWidth" INTEGER DEFAULT 0,
ADD COLUMN     "cardShadow" TEXT DEFAULT 'md';
