DROP TABLE IF EXISTS shop.shipment_category;
CREATE TABLE shop.shipment_category (
	reference SERIAL PRIMARY KEY,
	parcel_service shop.parcel_service NOT NULL,
	min_weight_kg FLOAT NOT NULL,
    max_weight_kg FLOAT NOT NULL,
	country shop.shipment_country NOT NULL,
	"cost" FLOAT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);