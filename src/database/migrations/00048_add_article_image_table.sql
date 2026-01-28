CREATE TABLE shop."articleImage" (
    reference UUID CONSTRAINT "articleImagePk" PRIMARY KEY CONSTRAINT "articleImageReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    article UUID CONSTRAINT "articleImageArticleNotNull" NOT NULL,
    CONSTRAINT "fkArticle"
        FOREIGN KEY (article)
        REFERENCES shop.article(reference)
        ON UPDATE CASCADE
		ON DELETE SET NULL,
    file UUID CONSTRAINT "articleFileNotNull" NOT NULL,
    CONSTRAINT "fkFile"
        FOREIGN KEY (file)
        REFERENCES shop.file(reference)
        ON UPDATE CASCADE
		ON DELETE SET NULL,
    CONSTRAINT "articleFileKey" UNIQUE ("article", "file"),
    "isCover" BOOLEAN CONSTRAINT "articleImageIsCoverNotNull" NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP CONSTRAINT "articleImageCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "articleImageUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop."articleImage".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleImage"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleImage"."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."articleImage"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();
