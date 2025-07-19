CREATE TABLE shop.user (
    reference SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    birthday TEXT DEFAULT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT DEFAULT NULL,
    shipping_address INT,
    billing_address INT,
    password TEXT DEFAULT NULL,
    salt TEXT DEFAULT NULL,
    system_authentication TEXT NOT NULL,
    system_role TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_system_authentication FOREIGN KEY (system_authentication) REFERENCES shop.system_authentication(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
    CONSTRAINT fk_system_role FOREIGN KEY (system_role) REFERENCES shop.system_role(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION
);

-- Alter the user table after the address table was created
ALTER TABLE shop.user
    ADD CONSTRAINT fk_shipping_address FOREIGN KEY (shipping_address) REFERENCES shop.address(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
    ADD CONSTRAINT fk_billing_address FOREIGN KEY (billing_address) REFERENCES shop.address(reference)
        ON UPDATE CASCADE
		ON DELETE NO ACTION;
