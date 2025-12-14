CREATE TABLE shop.user (
    reference UUID PRIMARY KEY DEFAULT shop.uuid_generate_v4(),
    name TEXT NOT NULL,
    birthday TEXT DEFAULT NULL,
    email TEXT NOT NULL UNIQUE,
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
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);