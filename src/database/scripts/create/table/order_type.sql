CREATE TABLE shop.order_type (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.order_type (reference) VALUES
('PURCHASE'),
('RENTAL'),
('PREORDER'),
('BACKORDER'),
('RETURN'),
('EXCHANGE'),
('GIFT'),
('SUBSCRIPTION');