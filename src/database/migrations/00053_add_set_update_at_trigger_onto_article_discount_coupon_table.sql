CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."articleDiscountCoupon"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();