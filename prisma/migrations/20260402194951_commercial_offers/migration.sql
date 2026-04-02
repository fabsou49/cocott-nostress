-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_CENTS');

-- CreateEnum
CREATE TYPE "OfferTarget" AS ENUM ('REGISTRATION', 'COMMISSION_RATE');

-- CreateTable
CREATE TABLE "commission_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "success_rate" DECIMAL(5,4) NOT NULL,
    "failure_rate" DECIMAL(5,4) NOT NULL,
    "registration_fee_cents" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_offers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" "OfferTarget" NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "duration_months" INTEGER,
    "max_uses" INTEGER,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_redemptions" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_amount_cents" INTEGER NOT NULL,
    "final_amount_cents" INTEGER NOT NULL,
    "commission_discount_until" TIMESTAMP(3),

    CONSTRAINT "promo_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_offers_code_key" ON "promo_offers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promo_redemptions_offer_id_supplier_id_key" ON "promo_redemptions"("offer_id", "supplier_id");

-- AddForeignKey
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "promo_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_redemptions" ADD CONSTRAINT "promo_redemptions_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
