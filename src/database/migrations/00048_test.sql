-- ===========================================
--  Insert Users
-- ===========================================
INSERT INTO shop.user (name, birthday, email, "phoneNumber", password, "systemAuthentication", "systemRole")
VALUES 
('Eli',   '2000-01-01', 'eli@mail.com',    '04567890', 'secret', 'GOOGLE', 'DEVELOPER'),
('Natan', '1988-02-21', 'nathan@mail.com', '09876789', 'very', 'INTERNAL', 'USER'),
('Ester', '2009-10-03', 'ester@gcloud.com','09876543', 'newly', 'INTERNAL', 'SUPERUSER');

-- ===========================================
--  Insert Addresses for Each User
-- ===========================================
WITH users AS (
    SELECT reference, name
    FROM shop.user
    WHERE name IN ('Eli', 'Natan')
)
INSERT INTO shop.address (
    "user",
    country,
    "stateOrProvince",
    city,
    "zipCode",
    street,
    "streetNumber",
    box,
    shipping,
    billing
)
SELECT 
    reference,
    CASE name
        WHEN 'Eli'   THEN 'Belgium'
        WHEN 'Natan' THEN 'Belgium'
        WHEN 'Ester' THEN 'Netherlands'
    END AS country,

    CASE name
        WHEN 'Eli'   THEN 'Flanders'
        WHEN 'Natan' THEN 'Brussels'
        WHEN 'Ester' THEN 'North Holland'
    END AS stateOrProvince,

    CASE name
        WHEN 'Eli'   THEN 'Antwerp'
        WHEN 'Natan' THEN 'Brussels'
        WHEN 'Ester' THEN 'Amsterdam'
    END AS city,

    CASE name
        WHEN 'Eli'   THEN '2000'
        WHEN 'Natan' THEN '1000'
        WHEN 'Ester' THEN '1012'
    END AS zipCode,

    CASE name
        WHEN 'Eli'   THEN 'Meir'
        WHEN 'Natan' THEN 'Kunstlaan'
        WHEN 'Ester' THEN 'Damrak'
    END AS street,

    CASE name
        WHEN 'Eli'   THEN '15'
        WHEN 'Natan' THEN '22'
        WHEN 'Ester' THEN '8'
    END AS streetNumber,

    NULL AS box,

    TRUE AS shipping,
    TRUE AS billing
FROM users;

INSERT INTO shop."article" 
(title, description, brand, gender, size, color, material, "condition", season, price, availability, "forSale", "forRent")
VALUES 
('Blue jeans', 'Timeless jeans', 'Dior', 'WOMENSWEAR', 'M', 'BLUE', 'DENIM', 'GREAT', 'SPRING', 100.00, 'AVAILABLE', true, false),
('Leather jacket', 'Black leather biker jacket', 'Gucci', 'MENSWEAR', 'L', 'BLACK', 'LEATHER', 'GREAT', 'AUTUMN', 250.00, 'AVAILABLE', true, false),
('White summer dress', 'Light cotton summer dress', 'Channel', 'WOMENSWEAR', 'S', 'WHITE', 'COTTON', 'NEW', 'SUMMER', 180.00, 'AVAILABLE', true, true),
('Wool coat', 'Warm long wool coat', 'Blumarine', 'WOMENSWEAR', 'M', 'BEIGE', 'WOOL', 'GREAT', 'WINTER', 300.00, 'AVAILABLE', false, true),
('Sneakers', 'Limited edition casual sneakers', 'Fendi', 'MENSWEAR', 'M', 'RED', 'NYLON', 'MODERATE', 'SPRING', 120.00, 'AVAILABLE', true, false);

INSERT INTO shop."order"
("user", "paymentMethod", "totalPrice", status, type)
SELECT 
  reference,
  'PAYPAL',
  200.00,
  'CONFIRMED',
  'PURCHASE'
FROM shop."user"
WHERE name = 'Eli'

UNION ALL

SELECT 
  reference,
  'PAYPAL',
  60.00,
  'PAID',
  'RENTAL'
FROM shop."user"
WHERE name = 'Eli'

UNION ALL

SELECT 
  reference,
  'PAYPAL',
  953.53,
  'SHIPPED',
  'RETURN'
FROM shop."user"
WHERE name = 'Natan'

UNION ALL

SELECT 
  reference,
  'PAYPAL',
  89.00,
  'PAID',
  'EXCHANGE'
FROM shop."user"
WHERE name = 'Ester';

INSERT INTO shop."orderArticle"
("order", article, "articlePrice")
SELECT 
  reference,
  (SELECT reference FROM shop.article WHERE "sequentialId" = 1),
  "totalPrice"
FROM shop.order
WHERE "sequentialId" = 1

UNION ALL

SELECT 
  reference,
  (SELECT reference FROM shop.article WHERE "sequentialId" = 2),
  "totalPrice"
FROM shop.order
WHERE "sequentialId" = 2

UNION ALL

SELECT 
  reference,
  (SELECT reference FROM shop.article WHERE "sequentialId" = 3),
  "totalPrice"
FROM shop.order
WHERE "sequentialId" = 3

UNION ALL

SELECT 
  reference,
  (SELECT reference FROM shop.article WHERE "sequentialId" = 4),
  "totalPrice"
FROM shop.order
WHERE "sequentialId" = 4
;

CREATE OR REPLACE FUNCTION shop."userReferenceType"("user" shop."user")
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT address.reference::TEXT
	INTO result
  FROM shop.address
  WHERE address.user = "user".reference
    AND address.billing = TRUE
  ORDER BY address."updatedAt" DESC
  LIMIT 1;

	RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION shop."userReferenceTypeArray"("user" shop."user")
RETURNS SETOF TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT address.reference::TEXT
  FROM shop.address
  ORDER BY address."updatedAt" DESC;
END;
$$;

CREATE TYPE shop."userCompositeType" AS (
	reference UUID,
	country VARCHAR,
	city VARCHAR
);

CREATE OR REPLACE FUNCTION shop."userGetCompositeType"("user" shop."user")
RETURNS shop."userCompositeType"
LANGUAGE plpgsql
AS $$
DECLARE
  result shop."userCompositeType";
BEGIN
  SELECT address.reference, address.country, address.city
	INTO result
  FROM shop.address
  WHERE address.user = "user".reference
    AND address.billing = TRUE
  ORDER BY address."updatedAt" DESC
  LIMIT 1;

	RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION shop."userGetCompositeTypeArray"("user" shop."user")
RETURNS SETOF shop."userCompositeType"
LANGUAGE plpgsql
AS $$
DECLARE
  result shop."userCompositeType";
BEGIN
  RETURN QUERY
  SELECT address.reference, address.country, address.city
  FROM shop.address
  ORDER BY address."updatedAt" DESC;
END;
$$;

CREATE OR REPLACE FUNCTION shop."userBillingAddressArray"("user" shop."user")
RETURNS SETOF shop.address
LANGUAGE plpgsql
AS $$
DECLARE
  result shop.address;
BEGIN
  RETURN QUERY
  SELECT address.*
  FROM shop.address
  ORDER BY address."updatedAt" DESC;
END;
$$;
