/*
  Warnings:

  - You are about to drop the column `sellerId` on the `PaymentHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentHistory" DROP CONSTRAINT "PaymentHistory_sellerId_fkey";

-- AlterTable
ALTER TABLE "public"."PaymentHistory" DROP COLUMN "sellerId";
