-- Step 1: Clean up if user already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'administrator') THEN
        -- Revoke privileges first
        REVOKE ALL PRIVILEGES ON DATABASE vintage_archive_jungle FROM administrator;
        REVOKE ALL PRIVILEGES ON SCHEMA shop FROM administrator;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA shop FROM administrator;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shop FROM administrator;

        -- Drop owned objects if any (comment this out if you want to preserve objects)
        DROP OWNED BY administrator;

        -- Finally, drop the user
        DROP USER administrator;
    END IF;
END $$;

-- Step 2: Create the user with a defined password
CREATE USER administrator WITH PASSWORD 'my_password';

-- Step 3: Grant permission to connect to the database
GRANT CONNECT ON DATABASE vintage_archive_jungle TO administrator;

-- Step 4: Allow access to the 'shop' schema
GRANT USAGE ON SCHEMA shop TO administrator;

-- Step 5: Grant CRUD privileges on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shop TO administrator;

-- Step 6: Grant privileges on all sequences (for ID columns, etc.)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shop TO administrator;

-- Step 7: Ensure future tables inherit CRUD permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA shop
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO administrator;
