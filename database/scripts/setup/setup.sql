\o /dev/null;

DROP DATABASE IF EXISTS vintage_archive_jungle;

CREATE DATABASE vintage_archive_jungle;

DROP SCHEMA IF EXISTS shop;

CREATE SCHEMA shop;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'administrator') THEN

        REVOKE ALL PRIVILEGES ON DATABASE vintage_archive_jungle FROM administrator;
        REVOKE ALL PRIVILEGES ON SCHEMA shop FROM administrator;
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA shop FROM administrator;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shop FROM administrator;

        REASSIGN OWNED BY administrator TO CURRENT_USER;
        DROP OWNED BY administrator;

        DROP USER administrator;
    END IF;
END $$;

CREATE USER administrator WITH PASSWORD :password;

GRANT CONNECT ON DATABASE vintage_archive_jungle TO administrator;
GRANT USAGE ON SCHEMA shop TO administrator;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shop TO administrator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shop TO administrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA shop
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO administrator;
