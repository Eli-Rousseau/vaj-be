DROP TABLE IF EXISTS shop.user;

DROP TYPE IF EXISTS shop.auth_type;
CREATE TYPE shop.auth_type AS ENUM ('INTERN', 'GOOGLE', 'APPLE');

DROP TYPE IF EXISTS shop.role_type;
CREATE TYPE shop.role_type AS ENUM ('SYSTEM DEVELOPER', 'ADMINISTRATOR', 'SUPERUSER', 'USER');

CREATE TABLE shop.user (
    reference SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birthday DATE DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) DEFAULT NULL,
    password TEXT DEFAULT NULL,
    salt TEXT DEFAULT NULL,
    authentication shop.auth_type NOT NULL,
    role shop.role_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
