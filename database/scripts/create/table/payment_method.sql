CREATE TABLE shop.payment_method (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.payment_method (reference) VALUES
('PAYPAL');