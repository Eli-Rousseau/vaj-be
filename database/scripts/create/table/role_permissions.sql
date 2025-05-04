DROP TABLE IF EXISTS shop.role_permission;
CREATE TABLE shop.role_permission (
	reference SERIAL PRIMARY KEY,
	"role" shop.role_type NOT NULL,
	operation_type shop.operation_type NOT NULL,
	"table" shop.table NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_role_operation_table UNIQUE ("role", operation_type, "table")
);