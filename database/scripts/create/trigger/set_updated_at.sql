DROP FUNCTION IF EXISTS shop.set_updated_at();

-- Create the trigger
CREATE FUNCTION shop.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the tables
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.user;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.user
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.address;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.address
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

