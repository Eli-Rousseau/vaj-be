CREATE TABLE shop."discountCoupon" (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" FLOAT NOT NULL,
    "maxUses" INT NOT NULL DEFAULT 1,
    uses INT NOT NULL DEFAULT 0,
    "minOrderValue" FLOAT DEFAULT NULL,
    "validFrom" TIMESTAMP NOT NULL,
    "validUntil" TIMESTAMP NOT NULL,
    "isAactive" BOOLEAN NOT NULL DEFAULT true,
    "userLimit" INT DEFAULT NULL,
    "isStackable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);