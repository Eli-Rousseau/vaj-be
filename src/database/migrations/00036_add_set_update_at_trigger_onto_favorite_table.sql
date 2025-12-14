CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.favorite
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();