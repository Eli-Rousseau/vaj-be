CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.order
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();