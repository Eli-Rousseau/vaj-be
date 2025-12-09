CREATE TABLE shop.article_discount_coupon (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    article UUID,
    CONSTRAINT article_fk
        FOREIGN KEY (article)
        REFERENCES shop.article(reference)
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    discount_coupon UUID,
    CONSTRAINT discount_coupon_fk
        FOREIGN KEY (discount_coupon)
        REFERENCES shop.discount_coupon(reference)
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);