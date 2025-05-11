COPY (SELECT tablename FROM pg_tables WHERE schemaname = 'shop') TO :file DELIMITER ',' CSV HEADER;
