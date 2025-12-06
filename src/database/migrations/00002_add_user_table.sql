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
    system_authentication TEXT,
    CONSTRAINT fk_system_authentication FOREIGN KEY (system_authentication) REFERENCES shop.system_authentication(reference)
		    ON UPDATE CASCADE
		    ON DELETE SET NULL,
    system_role TEXT,
    CONSTRAINT fk_system_role FOREIGN KEY (system_role) REFERENCES shop.system_role(reference)
		    ON UPDATE CASCADE
		    ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);