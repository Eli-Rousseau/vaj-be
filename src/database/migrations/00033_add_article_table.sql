CREATE TABLE shop.article(
	-- Core Identifiers & Metadata
	reference UUID CONSTRAINT "articlePk" PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
	title TEXT NOT NULL,
	description TEXT DEFAULT NULL,
	brand TEXT,
	CONSTRAINT "fkBrand" 
        FOREIGN KEY (brand) 
        REFERENCES shop."articleBrandEnum"("articleBrand")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	release TIMESTAMP DEFAULT NULL,
	"createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	-- Product Attributes
	"parentCategory" TEXT,
	CONSTRAINT "fkArticleParentCategory"
        FOREIGN KEY ("parentCategory") 
        REFERENCES shop."articleParentCategoryEnum"("articleParentCategory")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	"subCategory" TEXT,
	CONSTRAINT "fkArticleSubCategory"
        FOREIGN KEY ("subCategory") 
        REFERENCES shop."articleSubCategoryEnum"("articleSubCategory")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	gender TEXT,
	CONSTRAINT "fkGender"
        FOREIGN KEY (gender) 
        REFERENCES shop."articleGenderEnum"("articleGender")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	size TEXT,
	CONSTRAINT "fkSize"
        FOREIGN KEY ("size") 
        REFERENCES shop."articleSizeEnum"("articleSize")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	color TEXT,
	CONSTRAINT "fkColor"
        FOREIGN KEY (color) 
        REFERENCES shop."articleColorEnum"("articleColor")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	material TEXT,
	CONSTRAINT "fkMaterial"
        FOREIGN KEY (material) 
        REFERENCES shop."articleMaterialEnum"("articleMaterial")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	condition TEXT,
	CONSTRAINT "fkCondition"
        FOREIGN KEY (condition) 
        REFERENCES shop."articleConditionEnum"("articleCondition")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	season TEXT,
	CONSTRAINT "fkSeason"
        FOREIGN KEY (season) 
        REFERENCES shop."articleSeasonEnum"("articleSeason")
		ON UPDATE CASCADE
		ON DELETE SET NULL,

	-- Inventory & Pricing
	quantity INT CONSTRAINT "articleQuantityCheck" NOT NULL DEFAULT 1 CHECK (quantity > 0),
	price FLOAT NOT NULL,
	currency TEXT DEFAULT 'EUR',
	CONSTRAINT "fkCurrency"
        FOREIGN KEY (currency) 
        REFERENCES shop."currencyEnum"(currency)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	discount FLOAT CONSTRAINT "articleDiscountCheck" NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	availability TEXT,
	CONSTRAINT "fkAvailibility"
        FOREIGN KEY (availability) 
        REFERENCES shop."articleAvailabilityEnum"("articleAvailability")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	"forSale" BOOLEAN NOT NULL,
	"forRent" BOOLEAN NOT NULL,
	"rentalPrice" FLOAT DEFAULT NULL,
	media JSONB DEFAULT NULL
);