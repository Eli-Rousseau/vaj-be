CREATE TABLE shop."paymentMethodEnum" (
	"paymentMethod" TEXT CONSTRAINT "paymentMethodEnumPk" PRIMARY KEY CONSTRAINT "paymentMethodEnumPaymentMethodNotNull" NOT NULL
);