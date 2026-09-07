CREATE TABLE shop."refreshToken" (
    reference UUID CONSTRAINT "refreshTokenPk" PRIMARY KEY CONSTRAINT "refreshTokenReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "sequentialId" SERIAL CONSTRAINT "refreshTokenSequentialIdNotNull" NOT NULL,
    "user" UUID,
    CONSTRAINT "fkUser "
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    "tokenHash" TEXT CONSTRAINT "refreshTokenTokenHashNotNull" NOT NULL,
    "revokedAt" TIMESTAMP DEFAULT NULL,
    "replacedBy" UUID DEFAULT NULL,
    CONSTRAINT "fkReplacedBy"
        FOREIGN KEY ("replacedBy")
        REFERENCES shop."refreshToken"(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    "expiresAt" TIMESTAMP CONSTRAINT "refreshTokenExpiresAtNotNull" NOT NULL,
    "createdAt" TIMESTAMP CONSTRAINT "refreshTokenCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP CONSTRAINT "refreshTokenUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop."refreshToken".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."refreshToken"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."refreshToken"."updatedAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."refreshToken"."sequentialId" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."refreshToken"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();