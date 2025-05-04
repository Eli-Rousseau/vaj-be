DROP TYPE IF EXISTS shop.operation_type;
CREATE TYPE shop.operation_type AS ENUM ('view', 'create', 'update', 'delete');