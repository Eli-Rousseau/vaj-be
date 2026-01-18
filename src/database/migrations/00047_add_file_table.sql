CREATE TABLE shop.file (
    reference UUID CONSTRAINT "filePk" PRIMARY KEY CONSTRAINT "fileReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    key TEXT CONSTRAINT "fileKeyNotNull" NOT NULL,
    name TEXT CONSTRAINT "fileNameNotNull" NOT NULL,
    bucket TEXT CONSTRAINT "fileBucketNotNull" NOT NULL,
    "contentType" TEXT CONSTRAINT "fileContentTypeNotNull" NOT NULL,
    "isPublic" BOOLEAN DEFAULT false,
    "publicUrl" TEXT DEFAULT NULL,
    id TEXT CONSTRAINT "fileIdNotNull" NOT NULL CONSTRAINT "fileIdKey" UNIQUE,
    "createdAt" TIMESTAMP CONSTRAINT "fileCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "fileUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop.file.reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.file."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.file."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.file
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();