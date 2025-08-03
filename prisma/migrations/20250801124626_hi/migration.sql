/*
  Warnings:

  - You are about to drop the column `debtorId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debtId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_debtorId_fkey";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "debtorId",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "debtId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "month" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "public"."Debt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
