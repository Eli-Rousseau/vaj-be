CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."discountCoupon"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();