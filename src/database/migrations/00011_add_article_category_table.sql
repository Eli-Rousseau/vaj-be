CREATE TABLE shop."articleCategory" (
    reference UUID CONSTRAINT "articleCategoryPk" PRIMARY KEY CONSTRAINT "articleCategoryNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "sequentialId" SERIAL CONSTRAINT "articleCategorySequentialIdNotNull" NOT NULL,
    "c1" TEXT CONSTRAINT "articleCategoryC1NotNull" NOT NULL,
    "c2" TEXT,
    "c3" TEXT,
    "c4" TEXT,
    "c5" TEXT,
    "c6" TEXT,
    CONSTRAINT "categoryKey" UNIQUE ("c1", "c2", "c3", "c4", "c5", "c6"),
    "createdAt" TIMESTAMP CONSTRAINT "articleCategoryCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "updatedAt" TIMESTAMP CONSTRAINT "articleCategoryUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop."articleCategory".reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleCategory"."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleCategory"."updatedAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop."articleCategory"."sequentialId" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."articleCategory"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();