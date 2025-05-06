CREATE TABLE shop.address (
    reference SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    CONSTRAINT address_user_fk 
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE,
        ON DELETE NO ACTION,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    street_number VARCHAR(255) NOT NULL,
    box VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
