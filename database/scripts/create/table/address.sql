DROP TYPE IF EXISTS shop.address_type;

CREATE TYPE shop.address_type AS ENUM ('SHIPPING', 'BILLING', 'BOTH');

DROP TABLE IF EXISTS shop.address;

CREATE TABLE shop.address (
    customer INT NOT NULL,
    type shop.address_type NOT NULL,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    street_number VARCHAR(255) NOT NULL,
    box VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Composite primary key
    PRIMARY KEY (customer, type),

    -- Foreign key constraint
    CONSTRAINT address_customer_fk
        FOREIGN KEY (customer) REFERENCES shop.customer(reference)
        ON DELETE CASCADE
);
