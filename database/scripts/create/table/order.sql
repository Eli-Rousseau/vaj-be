CREATE TABLE shop.order (
    reference SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    CONSTRAINT order_user_fk 
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    total_price FLOAT NOT NULL,
    currency shop.currency NOT NULL,
    payment_method shop.payment_method NOT NULL,
    status shop.order_status NOT NULL,
    order_type shop.order_type NOT NULL,
    rental_start_date TIMESTAMP DEFAULT NULL,
    rental_end_date TIMESTAMP DEFAULT NULL,
    discount_coupon INT DEFAULT NULL,
    CONSTRAINT order_discount_fk 
        FOREIGN KEY (discount_coupon_reference) 
        REFERENCES shop.discount_coupon(reference) 
        ON DELETE NO ACTION 
        ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);