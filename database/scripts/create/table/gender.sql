CREATE TABLE shop.gender (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.gender (reference) VALUES
('MENSWEAR'), ('WOMENSWEAR'), ('UNISEX');