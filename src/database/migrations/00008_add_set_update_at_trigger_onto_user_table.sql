CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.user
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();