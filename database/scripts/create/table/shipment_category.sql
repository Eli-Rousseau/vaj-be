CREATE TABLE shop.shipment_category (
	reference SERIAL PRIMARY KEY,
	parcel_service shop.parcel_service NOT NULL,
	min_weight_kg FLOAT DEFAULT NULL,
    max_weight_kg FLOAT DEFAULT NULL,
	min_height_cm FLOAT DEFAULT NULL,
	max_height_cm FLOAT DEFAULT NULL,
	min_width_cm FLOAT DEFAULT NULL,
	max_width_cm FLOAT DEFAULT NULL,
	min_depth_cm FLOAT DEFAULT NULL,
	max_depth_cm FLOAT DEFAULT NULL,
	country shop.shipment_country NOT NULL,
	"cost" FLOAT NOT NULL,
	currency shop.currency DEFAULT 'EUR',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);