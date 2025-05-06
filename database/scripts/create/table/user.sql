CREATE TABLE shop.user (
    reference SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birthday DATE DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) DEFAULT NULL,
    shipping_address INT,
    billing_address INT,
    password TEXT DEFAULT NULL,
    salt TEXT DEFAULT NULL,
    authentication shop.auth_type NOT NULL,
    role shop.role_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter the user table after the address table was created
ALTER TABLE shop.user
    ADD CONSTRAINT user_shipping_address_fk
        FOREIGN KEY (shipping_address) REFERENCES shop.address(reference)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    ADD CONSTRAINT user_billing_address_fk
        FOREIGN KEY (billing_address) REFERENCES shop.address(reference)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
