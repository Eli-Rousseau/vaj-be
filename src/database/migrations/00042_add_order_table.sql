CREATE TABLE shop.order (
    reference UUID CONSTRAINT "orderPk" PRIMARY KEY CONSTRAINT "orderReferenceNotNull" NOT NULL DEFAULT shop.uuid_generate_v4(),
    "user" UUID,
    CONSTRAINT "fkUser" 
        FOREIGN KEY ("user") 
        REFERENCES shop.user(reference)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    "totalPrice" FLOAT CONSTRAINT "orderTotalPriceNotNull" NOT NULL,
    currency TEXT,
	CONSTRAINT "fkCurrency"
        FOREIGN KEY ("currency") 
        REFERENCES shop."currencyEnum"(currency)
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    "paymentMethod" TEXT,
	CONSTRAINT "fkPaymentMethod"
        FOREIGN KEY ("paymentMethod") 
        REFERENCES shop."paymentMethodEnum"("paymentMethod")
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    status TEXT,
	CONSTRAINT "fkOrderStatus" 
        FOREIGN KEY ("status") 
        REFERENCES shop."orderStatusEnum"("orderStatus")
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    "type" TEXT,
	CONSTRAINT "fkOrderType"
        FOREIGN KEY ("type") 
        REFERENCES shop."orderTypeEnum"("orderType")
		ON UPDATE CASCADE
        ON DELETE SET NULL,
    "rentalStartDate" TIMESTAMP DEFAULT NULL,
    "rentalEndDate" TIMESTAMP DEFAULT NULL,
    "discountCoupon" UUID,
    CONSTRAINT "fkDiscountCoupon"
        FOREIGN KEY ("discountCoupon") 
        REFERENCES shop."discountCoupon"("reference") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    "createdAt" TIMESTAMP CONSTRAINT "orderCreatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP CONSTRAINT "orderUpdatedAtNotNull" NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN shop.order.reference IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.order."createdAt" IS 'AUTOMATIC UPDATE';
COMMENT ON COLUMN shop.order."updatedAt" IS 'AUTOMATIC UPDATE';

CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.order
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();
