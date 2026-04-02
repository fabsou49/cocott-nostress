-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'SPONSORING';

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN     "sponsored_until" TIMESTAMP(3);
