-- Drop the user if it exists
DROP USER IF EXISTS :username;

-- Create the user
CREATE USER :username WITH PASSWORD :password;

-- Enable connection to database
GRANT CONNECT ON DATABASE "vintageArchiveJungle" TO :username;

-- Grant usage on schema
GRANT USAGE ON SCHEMA shop TO :username;

-- Grant CRUD privileges on schema tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shop TO :username;

-- Apply default privileges for user
ALTER DEFAULT PRIVILEGES IN SCHEMA shop GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :username;