COPY (
    SELECT 
        cols.column_name,
        cols.data_type,
        cols.is_nullable,
        (ct.conname IS NOT NULL) AS is_primary_key
    FROM 
        information_schema.columns AS cols
    JOIN 
        pg_class cls ON cls.relname = cols.table_name
    JOIN 
        pg_namespace nsp ON nsp.nspname = cols.table_schema AND nsp.oid = cls.relnamespace
    LEFT JOIN 
        pg_attribute attr ON attr.attrelid = cls.oid AND attr.attname = cols.column_name
    LEFT JOIN 
        pg_constraint ct ON ct.conrelid = cls.oid 
            AND ct.contype = 'p' 
            AND attr.attnum = ANY (ct.conkey)
    WHERE 
        cols.table_name = :table
        AND cols.table_schema = 'shop'
) TO :file DELIMITER ',' CSV HEADER;