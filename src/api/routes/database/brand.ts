import express, { Router } from "express";

import { ExpectedRequest, ExpectedResponse } from "../../server";
import { getPgClient } from "../../../utils/database";
import { QueryResult } from "pg";

const databaseBrandRoute: Router = express.Router();

// Handle the retrieval of the pgClient
databaseBrandRoute.use((req: ExpectedRequest, res: ExpectedResponse, next) => {
  try {
    req.pgClient = getPgClient();
  } catch (error) {
    res
      .status(500)
      .json({
        error: `Encountered an error when getting the postgresql client: ${error}`,
      })
      .end();
    return;
  }
  next();
});

// Handle request on the main route
databaseBrandRoute
  .route("/")
  .get(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Format the database query
    const querySelectEnum: string = `
SELECT unnest(enum_range(null::shop.brand));    
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        querySelectEnum
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: querySelectEnum,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: querySelectEnum,
        })
        .end();
      return;
    }

    // Sort the values
    rows = rows.map((row) => row["unnest"]).sort();

    // Finish the response
    res.status(200).json(rows).end();
    return;
  })
  .post(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the request body
    let body: any = req.body;

    // Verify whether the input is an array
    const inputIsArray: boolean = Array.isArray(body);
    if (!inputIsArray) {
      res
        .status(400)
        .json({
          error: `Expected body as an array. Received: ${body}`,
        })
        .end();
      return;
    }

    // Format the database query
    const queryAlterEnum: string = `
DO $$
DECLARE
  new_value TEXT;
BEGIN
  FOREACH new_value IN ARRAY ARRAY[${body
    .map((value: string) => `'${value}'`)
    .join(", ")}]
  LOOP
    BEGIN
      EXECUTE format('ALTER TYPE shop.brand ADD VALUE %L', new_value);
    EXCEPTION
      WHEN duplicate_object THEN
        RAISE NOTICE 'Value "%" already exists in shop.brand enum. Skipping.', new_value;
    END;
  END LOOP;
END $$;    
`;
    const querySelectEnum: string = `
SELECT unnest(enum_range(null::shop.brand));    
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      await req.pgClient!.query(queryAlterEnum);
      const queryResult: QueryResult = await req.pgClient!.query(
        querySelectEnum
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryAlterEnum,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: queryAlterEnum,
        })
        .end();
      return;
    }

    // Sort the values
    rows = rows.map((row) => row["unnest"]).sort();

    // Finish the response
    res.status(200).json(rows).end();
    return;
  })
  .put(async (req: ExpectedRequest, res: ExpectedResponse) => {})
  .delete(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the request body
    let body: any = req.body;

    // Verify whether the input is an array
    const inputIsArray: boolean = Array.isArray(body);
    if (!inputIsArray) {
      res
        .status(400)
        .json({
          error: `Expected body as an array. Received: ${body}`,
        })
        .end();
      return;
    }

    // Format the database query
    const queryDeleteEnum: string = `
DO $$
DECLARE
  b TEXT;
  t TEXT;
  new_enum_values TEXT[] := ARRAY[]::TEXT[];
  brands_to_remove TEXT[] := ARRAY[${body
    .map((value: string) => `'${value}'`)
    .join(", ")}];
  tables_with_brand TEXT[];
  allowed_values_sql TEXT;
BEGIN
  -- 1. Get all tables with a 'brand' column in schema 'shop'
  SELECT ARRAY(
    SELECT t.table_name
    FROM information_schema.tables t
    JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE c.column_name = 'brand'
      AND t.table_schema = 'shop'
      AND t.table_type = 'BASE TABLE'
  ) INTO tables_with_brand;

  -- 2. Rename the existing enum
  ALTER TYPE shop.brand RENAME TO brand_old;

  -- 3. Collect allowed enum values
  FOR b IN SELECT unnest(enum_range(NULL::shop.brand_old))
  LOOP
    IF b NOT IN (SELECT unnest(brands_to_remove)) THEN
      new_enum_values := array_append(new_enum_values, b);
    END IF;
  END LOOP;

  -- 4. Create the new enum
  EXECUTE format(
    'CREATE TYPE shop.brand AS ENUM (%s)',
    array_to_string(array_agg(quote_literal(val)), ', ')
  )
  FROM unnest(new_enum_values) AS val;

  -- 5. Build allowed value list for dynamic SQL
  allowed_values_sql := array_to_string(
    ARRAY(
      SELECT format('%L', val)
      FROM unnest(new_enum_values) AS val
    ), ', '
  );

  -- 6. Iterate over tables and update the brand column
  FOREACH t IN ARRAY tables_with_brand
  LOOP
    -- Convert to TEXT first
    EXECUTE format('ALTER TABLE shop.%I ALTER COLUMN brand TYPE TEXT;', t);

    -- Then convert to new enum with fallback to NULL
    EXECUTE format($sql$
      ALTER TABLE shop.%I
      ALTER COLUMN brand TYPE shop.brand
      USING (
        CASE
          WHEN brand IN (%s) THEN brand::shop.brand
          ELSE NULL
        END
      )
    $sql$, t, allowed_values_sql);
  END LOOP;

  -- 7. Drop the old enum
  DROP TYPE shop.brand_old;
END $$;
`;
    const querySelectEnum: string = `
SELECT unnest(enum_range(null::shop.brand));    
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      await req.pgClient!.query(queryDeleteEnum);
      const queryResult: QueryResult = await req.pgClient!.query(
        querySelectEnum
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryDeleteEnum,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: queryDeleteEnum,
        })
        .end();
      return;
    }

    // Sort the values
    rows = rows.map((row) => row["unnest"]).sort();

    // Finish the response
    res.status(200).json(rows).end();
    return;
  });

export default databaseBrandRoute;
