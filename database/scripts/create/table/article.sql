CREATE TABLE shop.article(
	-- Core Identifiers & Metadata
	reference SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	description TEXT DEFAULT NULL,
	brand shop.brand NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	-- Product Attributes
	category INT NOT NULL,
	CONSTRAINT article_category_fk
		FOREIGN KEY (category)
		REFERENCES shop.category(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	gender shop.gender DEFAULT NULL,
	size shop.size NOT NULL,
	color shop.color DEFAULT NULL,
	material shop.material DEFAULT NULL,
	condition shop.condition NOT NULL,
	season shop.season DEFAULT NULL,

	-- Inventory & Pricing
	quantity INT DEFAULT 1 CHECK (quantity > 0),
	price FLOAT NOT NULL,
	currency shop.currency DEFAULT 'EUR',
	discount FLOAT DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	status shop.availability NOT NULL,
	for_rent BOOLEAN NOT NULL,
	rental_price FLOAT DEFAULT NULL,
	thumbnail JSONB DEFAULT NULL,
	media JSONB DEFAULT NULL,
	
	-- Shipping
	weight FLOAT NOT NULL,
	height FLOAT NOT NULL,
	width FLOAT NOT NULL,
	depth FLOAT NOT NULL
);
	
	
	
	
	
	
	
	
);