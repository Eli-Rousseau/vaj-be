-- ===========================================
--  Insert Users
-- ===========================================
INSERT INTO shop.user (name, birthday, email, phone_number, password, salt, system_authentication, system_role)
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
    WHERE name IN ('Eli', 'Natan', 'Ester')
)
INSERT INTO shop.address (
    "user",
    country,
    state_or_province,
    city,
    zip_code,
    street,
    street_number,
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
    END AS state_or_province,

    CASE name
        WHEN 'Eli'   THEN 'Antwerp'
        WHEN 'Natan' THEN 'Brussels'
        WHEN 'Ester' THEN 'Amsterdam'
    END AS city,

    CASE name
        WHEN 'Eli'   THEN '2000'
        WHEN 'Natan' THEN '1000'
        WHEN 'Ester' THEN '1012'
    END AS zip_code,

    CASE name
        WHEN 'Eli'   THEN 'Meir'
        WHEN 'Natan' THEN 'Kunstlaan'
        WHEN 'Ester' THEN 'Damrak'
    END AS street,

    CASE name
        WHEN 'Eli'   THEN '15'
        WHEN 'Natan' THEN '22'
        WHEN 'Ester' THEN '8'
    END AS street_number,

    NULL AS box,

    TRUE AS shipping,
    TRUE AS billing
FROM users;
