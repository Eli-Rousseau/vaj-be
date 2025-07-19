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