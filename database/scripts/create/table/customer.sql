DROP TYPE IF EXISTS shop.auth_type;
DROP TYPE IF EXISTS shop.role_type;

CREATE TYPE shop.auth_type AS ENUM ('INTERN', 'GOOGLE', 'APPLE');
CREATE TYPE shop.role_type AS ENUM ('SYSTEM DEVELOPER', 'ADMINISTRATOR', 'SUPERUSER', 'USER');

DROP TABLE IF EXISTS shop.customer;

CREATE TABLE IF NOT EXISTS shop.customer (
    reference SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birthday DATE DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT DEFAULT NULL,
    phone_number VARCHAR(20) DEFAULT NULL,
    authentication shop.auth_type NOT NULL,
    role shop.role_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);
