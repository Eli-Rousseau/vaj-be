CREATE TABLE shop."articleDiscountCoupon" (
    reference UUID CONSTRAINT "articleDiscountCouponPk" PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
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
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);