DROP TYPE IF EXISTS shop.parcel_service;
CREATE TYPE shop.parcel_service AS ENUM ('bpost', 'PostNL', 'Mondial Relay', 'GLS', 'Homer', 'DHL', 'UPS');