ALTER TABLE shop.user
    ADD CONSTRAINT fk_shipping_address 
        FOREIGN KEY (shipping_address) 
        REFERENCES shop.address(reference)
		    ON UPDATE CASCADE
		    ON DELETE SET NULL,
    ADD CONSTRAINT fk_billing_address 
        FOREIGN KEY (billing_address) 
        REFERENCES shop.address(reference)
        ON UPDATE CASCADE
		    ON DELETE SET NULL;