CREATE TABLE shop.user (
    reference UUID CONSTRAINT "userPk" PRIMARY KEY CONSTRAINT "userReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    name TEXT CONSTRAINT "userNameNotNull" NOT NULL,
    birthday TEXT DEFAULT NULL,
    email TEXT CONSTRAINT "userEmailNotNull" NOT NULL CONSTRAINT "userEmailKey" UNIQUE,
    "phoneNumber" TEXT DEFAULT NULL,
    password TEXT DEFAULT NULL,
    salt TEXT DEFAULT NULL,
    "systemAuthentication" TEXT,
    CONSTRAINT "fkSystemAuthentication"
        FOREIGN KEY ("systemAuthentication") 
        REFERENCES shop."systemAuthenticationEnum"("systemAuthentication")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    "systemRole" TEXT,
    CONSTRAINT "fkSystemRole"
        FOREIGN KEY ("systemRole") 
        REFERENCES shop."systemRoleEnum"("systemRole")
		ON UPDATE CASCADE
		ON DELETE SET NULL,
    "createdAt" TIMESTAMP CONSTRAINT "userCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "updatedAt" TIMESTAMP CONSTRAINT "userUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop.user.reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.user."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.user."updatedAt" IS 'AUTOMATIC UPDATE';