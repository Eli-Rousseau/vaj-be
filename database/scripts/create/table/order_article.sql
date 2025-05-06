CREATE TABLE shop.order_article (
    reference SERIAL PRIMARY KEY,
    "order" INT NOT NULL,
    CONSTRAINT order_article_order_fk 
        FOREIGN KEY (order_reference) 
        REFERENCES shop.order(reference) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    article INT NOT NULL,
    CONSTRAINT order_article_article_fk 
        FOREIGN KEY (article_reference) 
        REFERENCES shop.article(reference) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    sale_price FLOAT NOT NULL,
    rental_price FLOAT DEFAULT NULL,
    discount_applied FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);