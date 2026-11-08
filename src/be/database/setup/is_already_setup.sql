-- To ensure the entire setup of the database finished properly
SELECT 
	CASE
		WHEN 
			-- 1. Was the database vintageArchiveJungle created
			(
				SELECT true
				FROM pg_database 
				WHERE datname = 'vintageArchiveJungle'
			)
			AND
			-- 2. Was the schema shop created
			(
				SELECT true 
				FROM information_schema.schemata 
				WHERE schema_name = 'shop'
			)
			-- 3. Was the schema meta created
			AND 
			(
				SELECT true 
				FROM information_schema.schemata 
				WHERE schema_name = 'meta'
			)
			AND 
			-- 4. Was the schema administrator created
			(
				SELECT true 
				FROM pg_roles 
				WHERE rolname = 'administrator'
			)
		THEN true
		ELSE false
	END AS is_already_setup
;