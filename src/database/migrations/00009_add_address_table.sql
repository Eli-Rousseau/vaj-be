CREATE TABLE shop.address (
    reference UUID CONSTRAINT "addressPk" PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    "user" UUID,
    CONSTRAINT "fkUser "
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    country VARCHAR(255) NOT NULL,
    "stateOrProvince" VARCHAR(255) DEFAULT NULL,
    city VARCHAR(255) NOT NULL,
    "zipCode" VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    "streetNumber" VARCHAR(255) NOT NULL,
    box VARCHAR(255) DEFAULT NULL,
    shipping BOOL DEFAULT false,
    billing BOOL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
