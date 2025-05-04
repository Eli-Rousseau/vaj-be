-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.user;
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.address;
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.article;
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.order;
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.order_article;
DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.shipment_category;

-- Now drop the function
DROP FUNCTION IF EXISTS shop.set_updated_at();

-- Recreate the trigger function
CREATE FUNCTION shop.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reattach the trigger to tables
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.user
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.address
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.article
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.order
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.order_article
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON shop.shipment_category
FOR EACH ROW
EXECUTE FUNCTION shop.set_updated_at();
