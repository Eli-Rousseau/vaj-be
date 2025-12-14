CREATE TABLE shop.favorite (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
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