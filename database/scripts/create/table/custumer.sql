DROP TYPE IF EXISTS shop.auth_type;
DROP TYPE IF EXISTS shop.role_type;

CREATE TYPE shop.auth_type AS ENUM ('INTERN', 'GOOGLE', 'APPLE');
CREATE TYPE shop.role_type AS ENUM ('SYSTEM DEVELOPER', 'ADMINISTRATOR', 'SUPERUSER', 'USER');

DROP TABLE IF EXISTS shop.customer;

CREATE TABLE IF NOT EXISTS shop.customer (
    reference SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birthday DATE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT,
    phone_number VARCHAR(20),
    authentication shop.auth_type NOT NULL,
    role shop.role_type NOT NULL,
    registered_at TIMESTAMP NOT NULL, 
    updated_at TIMESTAMP NOT NULL
);
