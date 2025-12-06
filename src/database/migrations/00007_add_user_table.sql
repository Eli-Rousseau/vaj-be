CREATE TABLE shop.user (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    name TEXT NOT NULL,
    birthday TEXT DEFAULT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT DEFAULT NULL,
    shipping_address UUID,
    billing_address UUID,
    password TEXT DEFAULT NULL,
    salt TEXT DEFAULT NULL,
    system_authentication TEXT,
    CONSTRAINT fk_system_authentication 
        FOREIGN KEY (system_authentication) 
        REFERENCES shop.system_authentication_enum(system_authentication)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    system_role TEXT,
    CONSTRAINT fk_system_role 
        FOREIGN KEY (system_role) 
        REFERENCES shop.system_role_enum(system_role)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);