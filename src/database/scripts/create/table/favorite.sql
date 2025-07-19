CREATE TABLE favorite (
    reference SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY ("user") REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    article INT NOT NULL,
    CONSTRAINT fk_article FOREIGN KEY (article) REFERENCES shop.article(reference)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);