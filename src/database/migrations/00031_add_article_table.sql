CREATE TABLE shop.article(
	-- Core Identifiers & Metadata
	reference UUID CONSTRAINT "articlePk" PRIMARY KEY CONSTRAINT "articleReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
	title TEXT CONSTRAINT "articleTitleNotNull" NOT NULL,
	description TEXT DEFAULT NULL,
	brand TEXT,
	CONSTRAINT "fkBrand" 
        FOREIGN KEY (brand) 
        REFERENCES shop."articleBrandEnum"("articleBrand")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	release TIMESTAMP DEFAULT NULL,
	"createdAt" TIMESTAMP CONSTRAINT "articleCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP CONSTRAINT "articleUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
	quantity INT CONSTRAINT "articleQuantityNotNull" NOT NULL DEFAULT 1 CONSTRAINT "ArticleQuantityCheck" CHECK (quantity > 0),
	price FLOAT CONSTRAINT "articlePriceNotNull" NOT NULL,
	currency TEXT DEFAULT 'EUR',
	CONSTRAINT "fkCurrency"
        FOREIGN KEY (currency) 
        REFERENCES shop."currencyEnum"(currency)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	discount FLOAT CONSTRAINT "articleDiscountNotNull" NOT NULL DEFAULT 0 CONSTRAINT "ArticleDiscountCheck" CHECK (discount >= 0 AND discount <= 100),
	availability TEXT,
	CONSTRAINT "fkAvailibility"
        FOREIGN KEY (availability) 
        REFERENCES shop."articleAvailabilityEnum"("articleAvailability")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	"forSale" BOOLEAN CONSTRAINT "articleForSaleNotNull" NOT NULL,
	"forRent" BOOLEAN CONSTRAINT "articleForRentNotNull" NOT NULL,
	"rentalPrice" FLOAT DEFAULT NULL
);

COMMENT ON COLUMN shop.article.reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.article."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.article."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.article
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();