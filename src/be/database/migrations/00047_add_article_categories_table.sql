CREATE TABLE shop."articleCategories" (
    reference UUID CONSTRAINT "articleCategoriesPk" PRIMARY KEY CONSTRAINT "articleCategoriesNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "sequentialId" SERIAL CONSTRAINT "articleCategoriesSequentialIdNotNull" NOT NULL,
    article UUID,
    CONSTRAINT "fkArticle"
        FOREIGN KEY (article) 
        REFERENCES shop."article"(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    "articleCategory" UUID,
    CONSTRAINT "fkArticleCategory"
        FOREIGN KEY ("articleCategory") 
        REFERENCES shop."articleCategory"(reference)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    CONSTRAINT "articleCategoryKey" UNIQUE ("article", "articleCategory"),
    "createdAt" TIMESTAMP CONSTRAINT "articleCategoriesCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "updatedAt" TIMESTAMP CONSTRAINT "articleCategoriesUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop."articleCategories".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleCategories"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleCategories"."updatedAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleCategories"."sequentialId" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."articleCategories"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();