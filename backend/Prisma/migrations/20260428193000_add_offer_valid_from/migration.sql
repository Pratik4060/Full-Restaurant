-- Add nullable validFrom to Offer
ALTER TABLE "Offer"
ADD COLUMN "validFrom" TIMESTAMP(3);
