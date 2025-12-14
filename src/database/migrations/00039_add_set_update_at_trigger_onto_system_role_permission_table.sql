CREATE TRIGGER "triggerSetUpdatedAt"
    BEFORE UPDATE ON shop."systemRolePermission"
    FOR EACH ROW EXECUTE FUNCTION shop."setUpdatedAt"();