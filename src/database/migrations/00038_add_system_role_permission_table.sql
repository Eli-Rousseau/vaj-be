CREATE TABLE shop."systemRolePermission" (
	reference UUID CONSTRAINT "systemRolePermissionPk" PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
	"systemRole" TEXT,
	CONSTRAINT "fkSystemRole" 
        FOREIGN KEY ("systemRole") 
        REFERENCES shop."systemRoleEnum"("systemRole")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	"systemPermission" TEXT,
	CONSTRAINT "fkSystemPermission"
        FOREIGN KEY ("systemPermission") 
        REFERENCES shop."systemPermissionEnum"("systemPermission")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	"createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "uniqueSystemRoleSystemPermissionKey" UNIQUE ("systemRole", "systemPermission")
);