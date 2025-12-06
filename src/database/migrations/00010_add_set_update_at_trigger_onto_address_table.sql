CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON shop.address
    FOR EACH ROW EXECUTE FUNCTION shop.set_updated_at();