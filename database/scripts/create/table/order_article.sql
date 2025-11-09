CREATE TABLE shop.order_article (
    reference SERIAL PRIMARY KEY,
    "order" INT,
    CONSTRAINT fk_order FOREIGN KEY ("order") REFERENCES shop.order(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    article INT,
    CONSTRAINT fk_article FOREIGN KEY (article) REFERENCES shop.article(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    sale_price FLOAT NOT NULL,
    rental_price FLOAT DEFAULT NULL,
    discount_applied FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);