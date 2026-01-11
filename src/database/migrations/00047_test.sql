-- ===========================================
--  Insert Users
-- ===========================================
INSERT INTO shop.user (name, birthday, email, "phoneNumber", password, salt, "systemAuthentication", "systemRole")
VALUES 
('Eli',   '2000-01-01', 'eli@mail.com',    '04567890', 'secret', 'sugar', 'GOOGLE', 'SYSTEM DEVELOPER'),
('Natan', '1988-02-21', 'nathan@mail.com', '09876789', 'very',   'sweet', 'INTERN', 'USER'),
('Ester', '2009-10-03', 'ester@gcloud.com','09876543', 'newly',  'secret', 'INTERN', 'SUPERUSER');


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
