DROP TABLE IF EXISTS shop.order_article;
CREATE TABLE shop.order_article (
	  reference SERIAL PRIMARY KEY,
    "order" INT NOT NULL,
    article INT NOT NULL,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    unit_price FLOAT NOT NULL,
    discount FLOAT DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_article_order_fk 
		FOREIGN KEY ("order") REFERENCES shop.order(reference)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
    CONSTRAINT order_article_article_fk 
		FOREIGN KEY (article) REFERENCES shop.article(reference) 
		ON DELETE CASCADE
		ON UPDATE CASCADE
);