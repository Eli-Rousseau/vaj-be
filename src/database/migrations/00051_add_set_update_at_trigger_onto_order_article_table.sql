CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."orderArticle"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();