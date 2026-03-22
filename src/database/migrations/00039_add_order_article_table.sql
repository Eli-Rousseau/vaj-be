CREATE TABLE shop."orderArticle" (
    reference UUID CONSTRAINT "orderArticlePk" PRIMARY KEY CONSTRAINT "orderArticleReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "sequentialId" SERIAL CONSTRAINT "orderArticleSequentialIdNotNull" NOT NULL,
    "order" UUID,
    CONSTRAINT "fkOrder"
        FOREIGN KEY ("order") 
        REFERENCES shop.order(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    article UUID,
    CONSTRAINT "fkArticle" 
        FOREIGN KEY (article)
        REFERENCES shop.article(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    quantity INT CONSTRAINT "orderArticleQuantityNotNull" NOT NULL DEFAULT 1,
    "articlePrice" FLOAT CONSTRAINT "orderArticleArticlePriceNotNull" NOT NULL,
    "articleDiscount" FLOAT DEFAULT NULL,
    "checkoutPrice" FLOAT DEFAULT NULL,
    "createdAt" TIMESTAMP CONSTRAINT "orderArticleCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "orderArticleUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop."orderArticle".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."orderArticle"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."orderArticle"."updatedAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."orderArticle"."sequentialId" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."orderArticle"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();