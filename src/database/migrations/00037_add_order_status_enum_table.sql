CREATE TABLE shop."orderStatusEnum" (
	"orderStatus" TEXT CONSTRAINT "orderStatusEnumPk" PRIMARY KEY CONSTRAINT "orderStatusEnumOrderStatusNotNull" NOT NULL
);