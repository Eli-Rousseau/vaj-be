CREATE TABLE shop."discountCoupon" (
    reference UUID CONSTRAINT "discountCouponPk" PRIMARY KEY CONSTRAINT "discountCouponReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    code TEXT CONSTRAINT "discountCouponCodeKey" UNIQUE CONSTRAINT "discountCouponCodeNotNull" NOT NULL,
    description TEXT DEFAULT NULL,
    "discountType" TEXT CONSTRAINT "discountCouponDiscountTypeNotNull" NOT NULL,
    "discountValue" FLOAT CONSTRAINT "discountCouponDiscountValueNotNull" NOT NULL,
    "maxUses" INT,
    "minOrderValue" FLOAT DEFAULT NULL,
    "validFrom" TIMESTAMP CONSTRAINT "discountCouponValidFromNotNull" NOT NULL,
    "validUntil" TIMESTAMP CONSTRAINT "discountCouponValidUntilNotNull" NOT NULL,
    "isAactive" BOOLEAN CONSTRAINT "discountCouponIsActiveNotNull" NOT NULL DEFAULT true,
    "userLimit" INT DEFAULT NULL,
    "isStackable" BOOLEAN CONSTRAINT "discountCouponIsStackableNotNull" NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP CONSTRAINT "discountCouponCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "discountCouponUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);