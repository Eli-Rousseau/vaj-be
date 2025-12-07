CREATE TABLE shop.favorite (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    "user" UUID,
    CONSTRAINT fk_user 
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    article UUID,
    CONSTRAINT fk_article 
        FOREIGN KEY (article) 
        REFERENCES shop.article(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);