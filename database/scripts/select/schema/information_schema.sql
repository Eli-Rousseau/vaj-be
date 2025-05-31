COPY (
    SELECT 
	    column_name,
	    data_type,
	    is_nullable,
	    -- column_default,
	    CASE 
			WHEN column_default IS NOT NULL AND is_nullable = 'YES' THEN 'NO'
	        WHEN column_default IS NOT NULL THEN 'YES'
	        ELSE 'NO'
	    END AS is_undefinable
	FROM 
	    information_schema.columns
	WHERE 
	    table_schema = 'shop'
	    AND table_name = :table
) TO :file DELIMITER ',' CSV HEADER;