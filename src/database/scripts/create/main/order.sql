DROP TABLE shop.order_article;
DROP TABLE shop.order;
DROP TABLE shop.discount_coupon;
DROP TABLE shop.payment_method;
DROP TABLE shop.order_status;
DROP TABLE shop.order_type;

CREATE TABLE shop.payment_method (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.payment_method (reference) VALUES
('PAYPAL');

CREATE TABLE shop.order_status (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.order_status (reference) VALUES
('PENDING'),
('CONFIRMED'),
('PROCESSING'),
('AWAITING_PAYMENT'),
('PAID'),
('SHIPPED'),
('IN_TRANSIT'),
('DELIVERED'),
('COMPLETED'),
('CANCELLED'),
('RETURNED'),
('REFUNDED'),
('FAILED'),
('ON_HOLD');

CREATE TABLE shop.order_type (
	reference TEXT PRIMARY KEY NOT NULL UNIQUE
);

INSERT INTO shop.order_type (reference) VALUES
('PURCHASE'),
('RENTAL'),
('PREORDER'),
('BACKORDER'),
('RETURN'),
('EXCHANGE'),
('GIFT'),
('SUBSCRIPTION');

CREATE TABLE shop.discount_coupon (
    reference SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    discount_type TEXT NOT NULL,
    discount_value FLOAT NOT NULL,
    max_uses INT NOT NULL DEFAULT 1,
    uses INT NOT NULL DEFAULT 0,
    min_order_value FLOAT DEFAULT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    user_limit INT DEFAULT NULL,
    is_stackable BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop.order (
    reference SERIAL PRIMARY KEY,
    "user" INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY ("user") REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    total_price FLOAT NOT NULL,
    currency TEXT NOT NULL,
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES shop.currency(reference)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    payment_method TEXT NOT NULL,
	CONSTRAINT fk_payment_method FOREIGN KEY (payment_method) REFERENCES shop.payment_method(reference)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    status TEXT NOT NULL,
	CONSTRAINT fk_order_status FOREIGN KEY (status) REFERENCES shop.order_status(reference)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    "type" TEXT NOT NULL,
	CONSTRAINT fk_order_type FOREIGN KEY ("type") REFERENCES shop.order_type(reference)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    rental_start_date TIMESTAMP DEFAULT NULL,
    rental_end_date TIMESTAMP DEFAULT NULL,
    discount_coupon INT DEFAULT NULL,
    CONSTRAINT fk_discount_coupon FOREIGN KEY (discount_coupon) REFERENCES shop.discount_coupon(reference) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop.order_article (
    reference SERIAL PRIMARY KEY,
    "order" INT NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY ("order") REFERENCES shop.order(reference) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    article INT NOT NULL,
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