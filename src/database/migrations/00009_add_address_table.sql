CREATE TABLE shop.address (
    reference UUID CONSTRAINT "addressPk" PRIMARY KEY CONSTRAINT "addressReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "user" UUID,
    CONSTRAINT "fkUser "
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    country VARCHAR(255) CONSTRAINT "addressCountryNotNull" NOT NULL,
    "stateOrProvince" VARCHAR(255) DEFAULT NULL,
    city VARCHAR(255) CONSTRAINT "addressCityNotNull" NOT NULL,
    "zipCode" VARCHAR(255) CONSTRAINT "addressZipCodeNotNull" NOT NULL,
    street VARCHAR(255) CONSTRAINT "addressStreetNotNull" NOT NULL,
    "streetNumber" VARCHAR(255) CONSTRAINT "addressStreetNumberNotNull" NOT NULL,
    box VARCHAR(255) DEFAULT NULL,
    shipping BOOL DEFAULT false,
    billing BOOL DEFAULT false,
    "createdAt" TIMESTAMP CONSTRAINT "addressCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "updatedAt" TIMESTAMP CONSTRAINT "addressUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop.address.reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.address."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.address."updatedAt" IS 'AUTOMATIC UPDATE';
