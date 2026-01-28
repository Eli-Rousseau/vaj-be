CREATE TABLE shop."systemRolePermission" (
	reference UUID CONSTRAINT "systemRolePermissionPk" PRIMARY KEY CONSTRAINT "systemRolePermissionReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
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
	"createdAt" TIMESTAMP CONSTRAINT "systemRolePermissionCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "systemRolePermissionUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "uniqueSystemRoleSystemPermissionKey" UNIQUE ("systemRole", "systemPermission")
);

COMMENT ON COLUMN shop."systemRolePermission".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."systemRolePermission"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."systemRolePermission"."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."systemRolePermission"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();