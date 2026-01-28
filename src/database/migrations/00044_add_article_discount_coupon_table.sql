CREATE TABLE shop."articleDiscountCoupon" (
    reference UUID CONSTRAINT "articleDiscountCouponPk" PRIMARY KEY CONSTRAINT "articleDiscountCouponReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    article UUID,
    CONSTRAINT "fkArticle"
        FOREIGN KEY (article)
        REFERENCES shop.article(reference)
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    "discountCoupon" UUID,
    CONSTRAINT "fkDiscountCoupon"
        FOREIGN KEY ("discountCoupon")
        REFERENCES shop."discountCoupon"(reference)
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    "createdAt" TIMESTAMP CONSTRAINT "articleDiscountCouponCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "articleDiscountCouponUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop."articleDiscountCoupon".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleDiscountCoupon"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleDiscountCoupon"."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."articleDiscountCoupon"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();