ALTER TABLE shop.user DROP CONSTRAINT fk_shipping_address, DROP CONSTRAINT fk_billing_address;
DROP TABLE shop.address;
DROP TABLE shop.user;
DROP TABLE shop.system_authentication;
DROP TABLE shop.system_role;

CREATE TABLE shop.system_authentication (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.system_authentication (reference)
VALUES ('INTERN'), ('GOOGLE'), ('APPLE');

CREATE TABLE shop.system_role (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.system_role (reference)
VALUES ('SYSTEM DEVELOPER'), ('ADMINISTRATOR'), ('SUPERUSER'), ('USER');

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
		ON DELETE SET NULL,
    CONSTRAINT fk_system_role FOREIGN KEY (system_role) REFERENCES shop.system_role(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL
);

CREATE TABLE shop.address (
    reference SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY ("user") REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    country VARCHAR(255) NOT NULL,
    state_or_province VARCHAR(255) DEFAULT NULL,
    city VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    street_number VARCHAR(255) NOT NULL,
    box VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE shop.user
    ADD CONSTRAINT fk_shipping_address FOREIGN KEY (shipping_address) REFERENCES shop.address(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    ADD CONSTRAINT fk_billing_address FOREIGN KEY (billing_address) REFERENCES shop.address(reference)
        ON UPDATE CASCADE
		ON DELETE SET NULL;
