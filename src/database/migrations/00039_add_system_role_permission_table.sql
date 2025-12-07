CREATE TABLE shop.system_role_permission (
	reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
	system_role TEXT,
	CONSTRAINT fk_system_role 
        FOREIGN KEY (system_role) 
        REFERENCES shop.system_role_enum(system_role)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	"system_permission" TEXT,
	CONSTRAINT fk_system_permission 
        FOREIGN KEY (system_permission) 
        REFERENCES shop.system_permission_enum(system_permission)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_role_system_permission UNIQUE ("system_role", "system_permission")
);