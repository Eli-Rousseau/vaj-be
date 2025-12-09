CREATE TABLE shop.article(
	-- Core Identifiers & Metadata
	reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
	title TEXT NOT NULL,
	description TEXT DEFAULT NULL,
	brand TEXT,
	CONSTRAINT fk_brand 
        FOREIGN KEY (brand) 
        REFERENCES shop.article_brand_enum(article_brand)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	release TIMESTAMP DEFAULT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	-- Product Attributes
	parent_category TEXT,
	CONSTRAINT fk_article_parent_category 
        FOREIGN KEY (parent_category) 
        REFERENCES shop.article_parent_category_enum(article_parent_category)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	sub_category TEXT,
	CONSTRAINT fk_article_sub_category 
        FOREIGN KEY (sub_category) 
        REFERENCES shop.article_sub_category_enum(article_sub_category)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	gender TEXT,
	CONSTRAINT fk_gender 
        FOREIGN KEY (gender) 
        REFERENCES shop.article_gender_enum(article_gender)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	size TEXT,
	CONSTRAINT fk_size 
        FOREIGN KEY ("size") 
        REFERENCES shop.article_size_enum(article_size)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	color TEXT,
	CONSTRAINT fk_color 
        FOREIGN KEY (color) 
        REFERENCES shop.article_color_enum(article_color)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	material TEXT,
	CONSTRAINT fk_material 
        FOREIGN KEY (material) 
        REFERENCES shop.article_material_enum(article_material)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	condition TEXT,
	CONSTRAINT fk_condition 
        FOREIGN KEY (condition) 
        REFERENCES shop.article_condition_enum(article_condition)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	season TEXT,
	CONSTRAINT fk_season 
        FOREIGN KEY (season) 
        REFERENCES shop.article_season_enum(article_season)
		ON UPDATE CASCADE
		ON DELETE SET NULL,

	-- Inventory & Pricing
	quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
	price FLOAT NOT NULL,
	currency TEXT DEFAULT 'EUR',
	CONSTRAINT fk_currency 
        FOREIGN KEY (currency) 
        REFERENCES shop.currency_enum(currency)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	discount FLOAT NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	availability TEXT,
	CONSTRAINT fk_availibility 
        FOREIGN KEY (availability) 
        REFERENCES shop.article_availability_enum(article_availability)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	for_sale BOOLEAN NOT NULL,
	for_rent BOOLEAN NOT NULL,
	rental_price FLOAT DEFAULT NULL,
	thumbnail JSONB DEFAULT NULL,
	media JSONB DEFAULT NULL
);