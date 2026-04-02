-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'ESCROW';

-- AlterTable
ALTER TABLE "client_profiles" ADD COLUMN     "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "commissions" ADD COLUMN     "stripe_refund_id" TEXT,
ADD COLUMN     "stripe_transfer_id" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "escrow_payment_intent_id" TEXT;

-- AlterTable
ALTER TABLE "supplier_profiles" ADD COLUMN     "stripe_account_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripe_account_id" TEXT;
