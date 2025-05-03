DROP TABLE IF EXISTS shop.article;

DROP TYPE IF EXISTS shop.currency;
CREATE TYPE shop.currency AS ENUM ('EUR');

DROP TYPE IF EXISTS shop.condition;
CREATE TYPE shop.condition AS ENUM ('NEW', 'GREAT', 'MODERATE', 'POOR');

DROP TYPE IF EXISTS shop.brand;
CREATE TYPE shop.brand AS ENUM (
	'Unknown', 
	'Roberto Cavali', 
	'Just Cavali', 
	'Dolce & Gabbana', 
	'Dior', 
	'Guiliano Galiano'
);

DROP TYPE IF EXISTS shop.category;
CREATE TYPE shop.category AS ENUM (
  -- Tops
  'TOPS - T-SHIRT',
  'TOPS - SHIRT',
  'TOPS - BLOUSE',
  'TOPS - TANK TOP',
  'TOPS - SWEATER',
  'TOPS - HOODIE',

  -- Bottoms
  'BOTTOMS - JEANS',
  'BOTTOMS - TROUSERS',
  'BOTTOMS - SHORTS',
  'BOTTOMS - SKIRT',
  'BOTTOMS - LEGGINGS',

  -- Outerwear
  'OUTERWEAR - JACKET',
  'OUTERWEAR - COAT',
  'OUTERWEAR - BLAZER',
  'OUTERWEAR - PARKA',
  'OUTERWEAR - RAINCOAT',

  -- Dresses & Jumpsuits
  'DRESSES - CASUAL',
  'DRESSES - EVENING',
  'DRESSES - GOWN',
  'DRESSES - JUMPSUIT',
  'DRESSES - ROMPER',

  -- Bags
  'BAGS - BACKPACK',
  'BAGS - HANDBAG',
  'BAGS - CROSSBODY',
  'BAGS - TOTE',
  'BAGS - CLUTCH',

  -- Shoes
  'SHOES - SNEAKERS',
  'SHOES - BOOTS',
  'SHOES - HEELS',
  'SHOES - FLATS',
  'SHOES - SANDALS',

  -- Accessories
  'ACCESSORIES - BELT',
  'ACCESSORIES - SCARF',
  'ACCESSORIES - HAT',
  'ACCESSORIES - GLOVES',
  'ACCESSORIES - SUNGLASSES',
  'ACCESSORIES - JEWELRY',

  -- Undergarments (optional category)
  'UNDERGARMENTS - BRA',
  'UNDERGARMENTS - UNDERWEAR',
  'UNDERGARMENTS - SOCKS',
  'UNDERGARMENTS - THERMALS'
);

DROP TYPE IF EXISTS shop.size;
CREATE TYPE shop.size AS ENUM ('XS', 'S', 'M', 'L', 'XL');

DROP TYPE IF EXISTS shop.gender;
CREATE TYPE shop.gender AS ENUM ('MENSWEAR', 'WOMENSWEAR', 'UNISEX');

DROP TYPE IF EXISTS shop.availability;
CREATE TYPE shop.availability AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'FOR SALE', 'SOLD');

CREATE TABLE shop.article(
	reference SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	brand shop.brand NOT NULL,
	category shop.category NOT NULL,
	size shop.category NOT NULL,
	condition shop.condition NOT NULL,
	gender shop.gender NOT NULL,
	description TEXT,
	status shop.availability NOT NULL,
	price FLOAT,
	currency shop.currency,
	for_rent BOOL NOT NULL,
	discount INT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);