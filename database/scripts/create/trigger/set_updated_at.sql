DROP FUNCTION IF EXISTS shop.set_updated_at();

CREATE FUNCTION shop.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl RECORD;
    has_updated_at BOOLEAN;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'shop'
    LOOP
        -- Check if the table has an updated_at column
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'shop' 
              AND table_name = tbl.tablename 
              AND column_name = 'updated_at'
        ) INTO has_updated_at;

        IF has_updated_at THEN
            -- Drop trigger if it exists
            EXECUTE format('DROP TRIGGER IF EXISTS trigger_set_updated_at ON shop.%I;', tbl.tablename);

            -- Create the trigger
            EXECUTE format($f$
                CREATE TRIGGER trigger_set_updated_at
                BEFORE UPDATE ON shop.%I
                FOR EACH ROW
                EXECUTE FUNCTION shop.set_updated_at();
            $f$, tbl.tablename);
        END IF;
    END LOOP;
END;
$$
