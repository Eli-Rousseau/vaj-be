CREATE TABLE favorite (
    reference SERIAL PRIMARY KEY,
    user INT NOT NULL,
    CONSTRAINT favorite_user_fk
        FOREIGN KEY (user)
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    article INT NOT NULL,
    CONSTRAINT favorite_acticle_fk
        FOREIGN KEY (article)
        REFERENCES shop.article(reference)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);