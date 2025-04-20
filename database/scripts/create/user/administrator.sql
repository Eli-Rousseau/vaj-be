-- Drop the user if they already exist to avoid conflicts when recreating
DROP USER IF EXISTS administrator;

-- Create a new user named 'administrator' with a defined password
CREATE USER administrator WITH PASSWORD 'my_password';

-- Grant permission to connect to the database
GRANT CONNECT ON DATABASE vintage_archive_jungle TO administrator;

-- Allow the user to use the 'shop' schema
GRANT USAGE ON SCHEMA shop TO administrator;

-- Grant full CRUD (Create, Read, Update, Delete) access on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shop TO administrator;

-- Grant full access on all sequences (needed for tables with auto-increment IDs)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shop TO administrator;

-- Ensure the user gets the same CRUD permissions on any future tables in the schema
ALTER DEFAULT PRIVILEGES IN SCHEMA shop
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO administrator;
