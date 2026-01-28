CREATE TABLE shop.favorite (
    reference UUID CONSTRAINT "favoritePk" PRIMARY KEY CONSTRAINT "favoriteReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "user" UUID,
    CONSTRAINT "fkUser "
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    article UUID,
    CONSTRAINT "fkArticle"
        FOREIGN KEY (article) 
        REFERENCES shop.article(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop.favorite.reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.favorite."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.favorite."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.favorite
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();