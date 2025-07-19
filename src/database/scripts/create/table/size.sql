CREATE TABLE shop.size (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.size (reference) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL');