CREATE TABLE shop."orderArticle" (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    "order" UUID,
    CONSTRAINT "fkOrder"
        FOREIGN KEY ("order") 
        REFERENCES shop.order(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    article UUID,
    CONSTRAINT "fkArticle" 
        FOREIGN KEY (article)
        REFERENCES shop.article(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    "articlePrice" FLOAT NOT NULL,
    "articleDiscount" FLOAT DEFAULT NULL,
    "checkoutPrice" FLOAT DEFAULT NULL,
    "currency" TEXT DEFAULT 'EUR',
	CONSTRAINT "fkCurrency"
        FOREIGN KEY (currency) 
        REFERENCES shop."currencyEnum"(currency)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);