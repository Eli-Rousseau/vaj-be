DROP TABLE IF EXISTS shop.order;
CREATE TABLE shop.order (
    reference SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    total_price FLOAT NOT NULL,
    currency shop.currency NOT NULL,
    payment_method shop.payment_method NOT NULL,
    status shop.order_status NOT NULL,
	shipment_category INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_user_fk 
		FOREIGN KEY ("user") REFERENCES shop.user(reference) 
		ON DELETE NO ACTION
		ON UPDATE CASCADE,
	CONSTRAINT order_shipment_category_fk
		FOREIGN KEY (shipment_category) REFERENCES shop.shipment_category(reference)
		ON DELETE NO ACTION
		ON UPDATE CASCADE
);