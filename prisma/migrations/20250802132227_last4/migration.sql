/*
  Warnings:

  - You are about to drop the column `debtId` on the `PaymentHistory` table. All the data in the column will be lost.
  - Added the required column `debtorId` to the `PaymentHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentHistory" DROP CONSTRAINT "PaymentHistory_debtId_fkey";

-- AlterTable
ALTER TABLE "public"."PaymentHistory" DROP COLUMN "debtId",
ADD COLUMN     "debtorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PaymentHistory" ADD CONSTRAINT "PaymentHistory_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "public"."Debtor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
