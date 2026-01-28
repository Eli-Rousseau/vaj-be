import path from "path";

import { logger } from "../utils/logger";
import { postgres } from "../utils/postgres";
import { DataBaseInfo, ColumnInfo, ComputedFieldInfo, TableInfo, CompositeTypeColumnInfo, CompositeTypeInfo, SchemaInfo } from "./types";

const LOGGER = logger.get({
    source: "src",
    service: "database",
    module: path.basename(__filename)
});

let dataBaseInfo: DataBaseInfo | null = null;

export const SCHEMAS_TO_FILTER: string[] = ["shop"];

async function getColumnInfo(schema: string, table: string) {
    const pgPool = postgres.getPool("default");
    const query = `
SELECT
    c.column_name,
    c.data_type,
    (c.is_nullable = 'YES') AS is_nullable,
    BOOL_OR(tc.constraint_type = 'PRIMARY KEY') AS is_primary_key,
    MAX(
        CASE
            WHEN tc.constraint_type = 'FOREIGN KEY'
            THEN ccu.table_name
        END
    ) AS foreign_key,
	CASE
		WHEN (c.column_default IS NOT NULL) THEN true
		ELSE false
	END has_default,
	CASE
		WHEN (d.description = 'AUTOMATIC UPDATE') THEN true
		ELSE false
	END handle_automatic_update
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu
    ON c.table_schema = kcu.table_schema
   AND c.table_name = kcu.table_name
   AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
   AND kcu.table_schema = tc.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
JOIN pg_catalog.pg_class cls
    ON cls.relname = c.table_name
JOIN pg_catalog.pg_namespace ns
    ON ns.oid = cls.relnamespace
   AND ns.nspname = c.table_schema
JOIN pg_catalog.pg_attribute a
    ON a.attrelid = cls.oid
   AND a.attname = c.column_name
LEFT JOIN pg_catalog.pg_description d
    ON d.objoid = cls.oid
   AND d.objsubid = a.attnum
WHERE c.table_schema = '${schema}'
  AND c.table_name = '${table}'
GROUP BY
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.ordinal_position,
	c.column_default,
	d.description
ORDER BY c.ordinal_position;
`;

    const columnInfos: ColumnInfo[] = [];
    try {
        const columnDetails = (await pgPool.query(query)).rows;

        for (const columnDetail of columnDetails) {
            const columnName = columnDetail["column_name"];
            const columnDataType = columnDetail["data_type"];
            const isNullable = columnDetail["is_nullable"];
            const hasDefault = columnDetail["has_default"];
            const isPrimaryKey = columnDetail["is_primary_key"];
            const foreignKey = columnDetail["foreign_key"];
            const handleAutomaticUpdate = columnDetail["handle_automatic_update"];

            const columnInfo: ColumnInfo = {
                name: columnName,
                dataType: columnDataType,
                isNullable,
                hasDefault,
                isPrimaryKey,
                foreignKey,
                handleAutomaticUpdate
            }
            columnInfos.push(columnInfo);
        }
    } catch (error) {
        LOGGER.error(`Failed to query the database column details for schema "${schema}" and table ${table}: ${error}`);
        throw error;
    }

    return columnInfos;
}

async function getComputedFields(schema: string, table: string) {
    const pgPool = postgres.getPool("default");
    const query = `
SELECT
    p.proname                               AS function_name,
    m.schema_name || '.' || m.type_name     AS argument,
    regexp_replace(
        pg_get_function_result(p.oid),
        '^SETOF\\s+|"',
        '',
        'g'
    )                                       AS return_type,
    CASE
        WHEN p.proretset OR t.typelem <> 0 THEN 'ARRAY'
        ELSE 'SINGLE'
    END                                     AS return_cardinality,

    CASE
        WHEN t.typtype = 'c'
             AND c.relkind = 'c'
            THEN 'COMPOSITE'
        WHEN t.typtype = 'c'
             AND c.relkind IN ('r','p','v','m','f')
            THEN 'TABLE'
        ELSE 'REFERENCE'
    END                                     AS return_type_kind

FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_type t ON t.oid = p.prorettype
LEFT JOIN pg_class c ON c.oid = t.typrelid

CROSS JOIN LATERAL (
    SELECT
        replace(m[1], '"', '') AS schema_name,
        replace(m[2], '"', '') AS type_name
    FROM regexp_matches(
        pg_get_function_arguments(p.oid),
        '("${schema}"|${schema})\s*\.\s*("[^"]+"|[A-Za-z0-9_]+)',
        'g'
    ) AS m
) AS m

WHERE n.nspname = '${schema}'
  AND m.type_name = '${table}'

ORDER BY function_name;
`;

    const computedFieldInfos: ComputedFieldInfo[] = [];
    try {
        const computedFieldDetails = (await pgPool.query(query)).rows;
        
        for (const computedFieldDetail of computedFieldDetails) {
            const fnName = computedFieldDetail["function_name"];
            const argType = computedFieldDetail["argument"];
            const returnType = computedFieldDetail["return_type"];
            const returnCardinality = computedFieldDetail["return_cardinality"];
            const returnTypeKind = computedFieldDetail["return_type_kind"];

            const computedFieldInfo: ComputedFieldInfo = {
                name: fnName,
                arg: { name: table, type: argType },
                returnType: returnType,
                returnCardinality,
                returnTypeKind
            };
            computedFieldInfos.push(computedFieldInfo);
        }

    } catch (error) {
        LOGGER.error(`Failed to query the database tables computed functions details: ${error}`);
        throw error;
    }

    return computedFieldInfos;
}

async function getTableInfo(schema: string) {
    const pgPool = postgres.getPool("default");
    const query = `
SELECT 
    table_name,
    CASE 
        WHEN RIGHT(table_name, 4) = 'Enum' THEN true
        ELSE false
    END AS "is_enum"
FROM information_schema.tables
WHERE table_schema = '${schema}';
`;
    const tableInfos: TableInfo[] = [];
    try {
        const tableDetails = (await pgPool.query(query)).rows;

        for (const tableDetail of tableDetails) {
            const tableName = tableDetail["table_name"];
            const isEnum = tableDetail["is_enum"];
            const columnInfos = await getColumnInfo(schema, tableName);
            const computedFields = await getComputedFields(schema, tableName);

            const tableInfo: TableInfo = { 
                name: tableName,
                columns: columnInfos, 
                isEnum,
                computedFields
            };
            tableInfos.push(tableInfo);
        }
        
    } catch (error) {
        LOGGER.error(`Failed to query the database tables details: ${error}`);
        throw error;
    }

    return tableInfos;
}

async function getCompositeTypeColumnInfos(schema: string, compsiteType: string) {
    const pgPool = postgres.getPool("default");
    const query = `
SELECT
    a.attname                                   AS field_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod)
                                                AS data_type,
    (a.atthasdef)                               AS has_default,
    (NOT a.attnotnull)                          AS is_nullable
FROM pg_type t
JOIN pg_namespace n
    ON n.oid = t.typnamespace
JOIN pg_class c
    ON c.oid = t.typrelid
JOIN pg_attribute a
    ON a.attrelid = c.oid
WHERE n.nspname = '${schema}'
  AND t.typname = '${compsiteType}'
  AND t.typtype = 'c'                -- composite types
  AND c.relkind = 'c'                -- NOT tables/views
  AND a.attnum > 0                   -- user-defined fields only
  AND NOT a.attisdropped
ORDER BY a.attnum;
`;

    const columnInfos: CompositeTypeColumnInfo[] = [];
    try {
        const columnDetails = (await pgPool.query(query)).rows;

        for (const columnDetail of columnDetails) {
            const columnName = columnDetail["field_name"];
            const columnDataType = columnDetail["data_type"];
            const isNullable = columnDetail["is_nullable"];
            const hasDefault = columnDetail["has_default"];

            const columnInfo: CompositeTypeColumnInfo = {
                name: columnName,
                dataType: columnDataType,
                isNullable,
                hasDefault
            }
            columnInfos.push(columnInfo);
        }
    } catch (error) {
        LOGGER.error(`Failed to query the database schema compsoite type column details for schema "${schema}" and compsite type "${compsiteType}": ${error}`);
        throw error;
    }

    return columnInfos;
}

async function getCompositeTypes(schema: string) {
    const pgPool = postgres.getPool("default");
    const query = `
SELECT DISTINCT
    t.typname                                   AS composite_type
FROM pg_type t
JOIN pg_namespace n
    ON n.oid = t.typnamespace
JOIN pg_class c
    ON c.oid = t.typrelid
JOIN pg_attribute a
    ON a.attrelid = c.oid
WHERE n.nspname = '${schema}'
  AND t.typtype = 'c'                -- composite types
  AND c.relkind = 'c'                -- NOT tables/views
  AND a.attnum > 0                   -- user-defined fields only
  AND NOT a.attisdropped
;
`;  
    const compositeTypesInfos: CompositeTypeInfo[] = [];
    try {
        const compositeTypesDetails = (await pgPool.query(query)).rows;

        for (const compositeTypeDetail of compositeTypesDetails) {
            const compositeTypeName = compositeTypeDetail["composite_type"];
            const compositeTypeColumnInfos = await getCompositeTypeColumnInfos(schema, compositeTypeName);

            const compositeTypeInfo: CompositeTypeInfo = {
                name: compositeTypeName,
                columns: compositeTypeColumnInfos
            };
            compositeTypesInfos.push(compositeTypeInfo);
        }

    } catch (error) {
        LOGGER.error(`Failed to query the database schema composite types details: ${error}`);
        throw error;
    }

    return compositeTypesInfos;
}

async function getSchemaInfo() {
    const pgPool = postgres.getPool("default");
    const query = `SELECT schema_name FROM information_schema.schemata ;`

    const schemaInfos: SchemaInfo[] = [];
    try {
        let schemaNames = (await pgPool.query(query)).rows.map(record => record["schema_name"]);

        if (SCHEMAS_TO_FILTER) {
            schemaNames = schemaNames.filter(name => SCHEMAS_TO_FILTER!.includes(name));
        }

        for (const schemaName of schemaNames) {
            const tableInfos = await getTableInfo(schemaName);
            const compositeTypeInfo = await getCompositeTypes(schemaName);

            const schemaInfo: SchemaInfo = {
                name: schemaName,
                tables: tableInfos,
                compsiteTypes: compositeTypeInfo
            };
            schemaInfos.push(schemaInfo);
        }
    } catch (error) {
        LOGGER.error(`Failed to query the database schema details: ${error}`);
        throw error;
    }
    
    return schemaInfos; 
}

async function buildDataBaseInfo() {
    const schemaInfos = await getSchemaInfo();
    dataBaseInfo = { schemas: schemaInfos };
    LOGGER.info("Database info retrieved successfully.");
}

export async function getDataBaseInfo(forceBuild: boolean = false): Promise<DataBaseInfo> {
    if (dataBaseInfo && !forceBuild) {
        return dataBaseInfo;
    }

    await buildDataBaseInfo();
    return dataBaseInfo!;
}
