CREATE OR REPLACE FUNCTION shop."userShippingAddress"("user" shop."user")
RETURNS shop.address
LANGUAGE plpgsql
AS $$
DECLARE
  result shop.address;
BEGIN
  SELECT address.*
	INTO result
  FROM shop.address
  WHERE address.user = "user".reference
    AND address.shipping = TRUE
  ORDER BY address."updatedAt" DESC
  LIMIT 1;

	RETURN result;
END;
$$;