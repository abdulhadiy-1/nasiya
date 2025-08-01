/*
  Warnings:

  - You are about to drop the column `sum` on the `Debt` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Debt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Debt" DROP COLUMN "sum",
ADD COLUMN     "amount" INTEGER NOT NULL,
ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Sample" ALTER COLUMN "isActive" SET DEFAULT true;
