CREATE TABLE shop.article(
	-- Core Identifiers & Metadata
	reference SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	description TEXT DEFAULT NULL,
	brand TEXT NOT NULL,
	CONSTRAINT fk_brand FOREIGN KEY (brand) REFERENCES shop.brand(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	release TIMESTAMP DEFAULT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	-- Product Attributes
	parent_category TEXT NOT NULL,
	CONSTRAINT fk_article_parent_category FOREIGN KEY (parent_category) REFERENCES shop.article_parent_category(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	sub_category TEXT NOT NULL,
	CONSTRAINT fk_article_sub_category FOREIGN KEY (sub_category) REFERENCES shop.article_sub_category(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	gender TEXT DEFAULT NULL,
	CONSTRAINT fk_gender FOREIGN KEY (gender) REFERENCES shop.gender(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	size TEXT NOT NULL,
	CONSTRAINT fk_size FOREIGN KEY (size) REFERENCES shop.size(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	color TEXT DEFAULT NULL,
	CONSTRAINT fk_color FOREIGN KEY (color) REFERENCES shop.color(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	material TEXT DEFAULT NULL,
	CONSTRAINT fk_material FOREIGN KEY (material) REFERENCES shop.material(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	condition TEXT NOT NULL,
	CONSTRAINT fk_condition FOREIGN KEY (condition) REFERENCES shop.condition(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	season TEXT DEFAULT NULL,
	CONSTRAINT fk_season FOREIGN KEY (season) REFERENCES shop.season(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,

	-- Inventory & Pricing
	quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
	price FLOAT NOT NULL,
	currency TEXT NOT NULL DEFAULT 'EUR',
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES shop.currency(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	discount FLOAT NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	availability TEXT NOT NULL,
	CONSTRAINT fk_availibility FOREIGN KEY (availability) REFERENCES shop.availability(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	for_sale BOOLEAN NOT NULL,
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