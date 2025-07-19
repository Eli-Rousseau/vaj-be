CREATE TABLE shop.order_article (
    reference SERIAL PRIMARY KEY,
    "order" INT NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY ("order") REFERENCES shop.order(reference) 
        ON UPDATE CASCADE 
        ON DELETE NO ACTION,
    article INT NOT NULL,
    CONSTRAINT fk_article FOREIGN KEY (article) REFERENCES shop.article(reference) 
        ON UPDATE CASCADE 
        ON DELETE NO ACTION,
    quantity INT NOT NULL DEFAULT 1,
    sale_price FLOAT NOT NULL,
    rental_price FLOAT DEFAULT NULL,
    discount_applied FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);