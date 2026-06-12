-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_formId_fkey";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "formType" TEXT NOT NULL DEFAULT 'Lead Form';

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
