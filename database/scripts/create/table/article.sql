CREATE TABLE shop.article(
	reference SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	brand shop.brand NOT NULL,
	CONSTRAINT article_brand_fk 
		FOREIGN KEY (brand) 
		REFERENCES shop.brand(reference)
		ON DELETE NO ACTION
		ON UPDATE CASCADE,
	quantity INT DEFAULT 1 CHECK (quantity > 0),
	category shop.category NOT NULL,
	size shop.size NOT NULL,
	condition shop.condition NOT NULL,
	gender shop.gender NOT NULL,
	description TEXT,
	status shop.availability NOT NULL,
	price FLOAT,
	currency shop.currency DEFAULT 'EUR',
	for_rent BOOL NOT NULL,
	discount FLOAT DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	media JSONB,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);