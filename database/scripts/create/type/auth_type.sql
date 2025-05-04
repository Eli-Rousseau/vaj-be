DROP TYPE IF EXISTS shop.auth_type;
CREATE TYPE shop.auth_type AS ENUM ('INTERN', 'GOOGLE', 'APPLE');