CREATE TABLE shop.system_role_permission (
	reference SERIAL PRIMARY KEY,
	system_role TEXT NOT NULL,
	CONSTRAINT fk_system_role FOREIGN KEY (system_role) REFERENCES shop.system_role(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	"system_permission" TEXT NOT NULL,
	CONSTRAINT fk_system_permission FOREIGN KEY (system_permission) REFERENCES shop.system_permission(reference)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_role_system_permission UNIQUE ("system_role", "system_permission")
);