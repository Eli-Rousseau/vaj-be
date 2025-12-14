CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.address
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();