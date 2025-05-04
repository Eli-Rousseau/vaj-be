DROP TYPE IF EXISTS shop.address_type;
CREATE TYPE shop.address_type AS ENUM ('SHIPPING', 'BILLING');