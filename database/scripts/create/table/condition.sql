CREATE TABLE shop.condition (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.condition (reference) VALUES 
('NEW'),
('GREAT'),
('MODERATE'),
('POOR');