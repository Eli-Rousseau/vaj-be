CREATE TABLE shop.season (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.season (reference) VALUES
('SUMMER'),
('SPRING'),
('AUTUMN'),
('WINTER');