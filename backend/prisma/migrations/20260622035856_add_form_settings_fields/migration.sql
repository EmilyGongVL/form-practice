-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "assignLeadsTo" TEXT,
ADD COLUMN     "formStatus" TEXT DEFAULT 'live',
ADD COLUMN     "redirectLink" TEXT,
ADD COLUMN     "sourceGroup" TEXT,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "submissionCopyTo" TEXT,
ADD COLUMN     "successMessage" TEXT,
ADD COLUMN     "venueName" TEXT;
