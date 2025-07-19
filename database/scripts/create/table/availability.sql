CREATE TABLE shop.availability (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.availability (reference) VALUES
('AVAILABLE'),
('UNAVAILABLE'),
('DAMAGED'),
('FOR_RENT'),
('FOR_SALE'),
('INACTIVE'),
('IN_TRANSIT'),
('OUT_OF_STOCK'),
('RENTED'),
('RESERVED'),
('RETURNED'),
('SOLD');