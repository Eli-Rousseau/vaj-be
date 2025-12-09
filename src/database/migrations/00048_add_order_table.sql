CREATE TABLE shop.order (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    "user" UUID,
    CONSTRAINT fk_user 
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    total_price FLOAT NOT NULL,
    currency TEXT,
	CONSTRAINT fk_currency 
        FOREIGN KEY (currency) 
        REFERENCES shop.currency_enum(currency)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    payment_method TEXT,
	CONSTRAINT fk_payment_method 
        FOREIGN KEY (payment_method) 
        REFERENCES shop.payment_method_enum(payment_method)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    status TEXT,
	CONSTRAINT fk_order_status 
        FOREIGN KEY ("status") 
        REFERENCES shop.order_status_enum(order_status)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    "type" TEXT,
	CONSTRAINT fk_order_type 
        FOREIGN KEY ("type") 
        REFERENCES shop.order_type_enum(order_type)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    rental_start_date TIMESTAMP DEFAULT NULL,
    rental_end_date TIMESTAMP DEFAULT NULL,
    discount_coupon UUID,
    CONSTRAINT fk_discount_coupon 
        FOREIGN KEY (discount_coupon) 
        REFERENCES shop.discount_coupon(reference) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
