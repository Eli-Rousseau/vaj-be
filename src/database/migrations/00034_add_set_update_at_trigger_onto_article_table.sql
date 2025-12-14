CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop.article
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();