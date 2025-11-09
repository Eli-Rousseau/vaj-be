DROP TABLE shop.article;
DROP TABLE shop.brand;
DROP TABLE shop.article_parent_category;
DROP TABLE shop.article_sub_category;
DROP TABLE shop.gender;
DROP TABLE shop.size;
DROP TABLE shop.availability;
DROP TABLE shop.season;
DROP TABLE shop.condition;
DROP TABLE shop.material;
DROP TABLE shop.color;
DROP TABLE shop.currency;

CREATE TABLE shop.brand (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.brand (reference) VALUES
('Alexander McQueen'),
('Betsey Johnson'),
('Blumarine'),
('Channel'),
('Chloé'),
('Cop Copine'),
('Dior'),
('Dolce & Gabbana'),
('Emilio Pucci'),
('Escada'),
('Fayazi'),
('Fendi'),
('Gaetano Navarra'),
('Gianfranco Ferre'),
('Giuseppe Zanotti'),
('Gucci'),
('Jean Paul Gaultier'),
('John Galliano'),
('Just Cavali'),
('Lexus'),
('Maison Margiela'),
('Moschino'),
('Muxart'),
('Prada'),
('Roberto Cavali'),
('Unbranded'),
('Versace');

CREATE TABLE shop.article_parent_category (
    reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.article_parent_category (reference) VALUES
('TOPS'), 
('BOTTOMS'), 
('OUTERWEAR'), 
('DRESSES'), 
('BAGS'), 
('SHOES'),
('ACCESSORIES'),
('UNDERGARMENTS');

CREATE TABLE shop.article_sub_category (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.article_sub_category (reference) VALUES
('T-SHIRT'),
('SHIRT'),
('BLOUSE'),
('TANK TOP'),
('SWEATER'),
('HOODIE'),
('JEANS'),
('TROUSERS'),
('SHORTS'),
('SKIRT'),
('LEGGINGS'),
('JACKET'),
('COAT'),
('BLAZER'),
('PARKA'),
('RAINCOAT'),
('CASUAL'),
('EVENING'),
('GOWN'),
('JUMPSUIT'),
('ROMPER'),
('BACKPACK'),
('HANDBAG'),
('CROSSBODY'),
('TOTE'),
('CLUTCH'),
('SNEAKERS'),
('BOOTS'),
('HEELS'),
('FLATS'),
('SANDALS'),
('BELT'),
('SCARF'),
('HAT'),
('GLOVES'),
('SUNGLASSES'),
('JEWELRY'),
('BRA'),
('UNDERWEAR'),
('SOCKS'),
('THERMALS');

CREATE TABLE shop.gender (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.gender (reference) VALUES
('MENSWEAR'), ('WOMENSWEAR'), ('UNISEX');

CREATE TABLE shop.size (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.size (reference) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL');

CREATE TABLE shop.color (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.color (reference) VALUES
('BEIGE'),
('BLACK'),
('BLUE'),
('BROWN'),
('BURGUNDY'),
('CREAM'),
('GOLD'),
('GRAY'),
('GREEN'),
('KHAKI'),
('LAVENDER'),
('LIGHT BLUE'),
('MAROON'),
('MULTICOLOR'),
('NAVY'),
('OLIVE'),
('ORANGE'),
('PINK'),
('PURPLE'),
('RED'),
('SILVER'),
('TAN'),
('TEAL'),
('WHITE'),
('YELLOW');

CREATE TABLE shop.material (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.material (reference) VALUES
('ACRYLIC'),
('ALPACA'),
('BAMBOO'),
('CANVAS'),
('CASHMERE'),
('CHIFFON'),
('CORDUROY'),
('COTTON'),
('DENIM'),
('FAUX FUR'),
('FAUX LEATHER'),
('FELT'),
('FLANNEL'),
('FLEECE'),
('HEMP'),
('JERSEY'),
('LACE'),
('LEATHER'),
('LINEN'),
('MESH'),
('MODAL'),
('NYLON'),
('POLYESTER'),
('RAYON'),
('SATIN'),
('SILK'),
('SPANDEX'),
('SUEDE'),
('TWEED'),
('VELVET'),
('VISCOSE'),
('WOOL');

CREATE TABLE shop.condition (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.condition (reference) VALUES 
('NEW'),
('GREAT'),
('MODERATE'),
('POOR');

CREATE TABLE shop.season (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.season (reference) VALUES
('SUMMER'),
('SPRING'),
('AUTUMN'),
('WINTER');

CREATE TABLE shop.currency (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.currency (reference) VALUES
('EUR');

CREATE TABLE shop.availability (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.availability (reference) VALUES
('AVAILABLE'),
('UNAVAILABLE'),
('DAMAGED'),
('FOR_RENT'),
('FOR_SALE'),
('INACTIVE'),
('IN_TRANSIT'),
('OUT_OF_STOCK'),
('RENTED'),
('RESERVED'),
('RETURNED'),
('SOLD');

CREATE TABLE shop.article(
	-- Core Identifiers & Metadata
	reference SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	description TEXT DEFAULT NULL,
	brand TEXT NOT NULL,
	CONSTRAINT fk_brand FOREIGN KEY (brand) REFERENCES shop.brand(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	release TIMESTAMP DEFAULT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	-- Product Attributes
	parent_category TEXT NOT NULL,
	CONSTRAINT fk_article_parent_category FOREIGN KEY (parent_category) REFERENCES shop.article_parent_category(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	sub_category TEXT NOT NULL,
	CONSTRAINT fk_article_sub_category FOREIGN KEY (sub_category) REFERENCES shop.article_sub_category(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	gender TEXT DEFAULT NULL,
	CONSTRAINT fk_gender FOREIGN KEY (gender) REFERENCES shop.gender(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	size TEXT NOT NULL,
	CONSTRAINT fk_size FOREIGN KEY (size) REFERENCES shop.size(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	color TEXT DEFAULT NULL,
	CONSTRAINT fk_color FOREIGN KEY (color) REFERENCES shop.color(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	material TEXT DEFAULT NULL,
	CONSTRAINT fk_material FOREIGN KEY (material) REFERENCES shop.material(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	condition TEXT NOT NULL,
	CONSTRAINT fk_condition FOREIGN KEY (condition) REFERENCES shop.condition(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	season TEXT DEFAULT NULL,
	CONSTRAINT fk_season FOREIGN KEY (season) REFERENCES shop.season(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,

	-- Inventory & Pricing
	quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
	price FLOAT NOT NULL,
	currency TEXT NOT NULL DEFAULT 'EUR',
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES shop.currency(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	discount FLOAT NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	availability TEXT NOT NULL,
	CONSTRAINT fk_availibility FOREIGN KEY (availability) REFERENCES shop.availability(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
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
