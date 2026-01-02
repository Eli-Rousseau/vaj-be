import path from "path";

import { getPgClient, pgClient } from "../../src/utils/database";
import getLogger from "../../src/utils/logger";
import { loadStage } from "../../src/utils/stage";
import * as constructors from "../../src/database/schema/constructors";

const logger = getLogger({
    source: "scripts",
    module: path.basename(__filename)
});

let psqlClient: pgClient | null = null;

let schemaToFilter: string[] | null = null;
let ComputedFieldsByTable: Record<string, Record<string, string[]>> | null = null;

type ColumnInfo = {
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    foreignKey: string | null;
    isNullable: boolean;
};

type TableInfo = {
    name: string;
    isEnum: boolean;
    columns: ColumnInfo[];
    computedFields: string[];
};

type SchemaInfo = {
    name: string;
    tables: TableInfo[];
};

async function getColumnInfo(schema: string, table: string) {
    const query = `
SELECT DISTINCT
    c.column_name,
    c.data_type,
    (c.is_nullable = 'YES') AS is_nullable,
	CASE 
		WHEN (tc.constraint_type = 'PRIMARY KEY') THEN true
		ELSE false
	END AS is_primary_key,
    ccu.table_name AS foreign_key
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
   AND tc.constraint_type = 'FOREIGN KEY'
WHERE c.table_schema = '${schema}'
  AND c.table_name = '${table}'
;
`;

    const columnInfos: ColumnInfo[] = [];
    try {
        const columnDetails = (await psqlClient!.query(query)).rows;
        logger.info(`Retrieved database column details for schema "${schema}" and table ${table}.`);

        for (const columnDetail of columnDetails) {
            const columnName = columnDetail["column_name"];
            const columnDataType = columnDetail["data_type"];
            const isNullable = columnDetail["is_nullable"];
            const isPrimaryKey = columnDetail["is_primary_key"];
            const foreignKey = columnDetail["foreign_key"];

            const columnInfo: ColumnInfo = {
                name: columnName,
                dataType: columnDataType,
                isNullable,
                isPrimaryKey,
                foreignKey
            }
            columnInfos.push(columnInfo);
        }
    } catch (error) {
        logger.error(`Failed to query the database column details for schema "${schema}" and table ${table}: ${error}`);
        process.exit(1);
    }

    return columnInfos;
}

async function getTableInfo(schema: string) {
    const query = `
SELECT 
    table_name,
    CASE 
        WHEN RIGHT(table_name, 4) = 'Enum' THEN true
        ELSE false
    END AS "is_enum"
FROM information_schema.tables
WHERE table_schema = '${schema}';
`
    const tableInfos: TableInfo[] = [];
    try {
        const tableDetails = (await psqlClient!.query(query)).rows;
        logger.info(`Retrieved database table details for schema "${schema}".`);

        for (const tableDetail of tableDetails) {
            const tableName = tableDetail["table_name"];
            const isEnum = tableDetail["is_enum"];
            const computedFields = ComputedFieldsByTable?.[schema]?.[tableName] ?? [];
            const columnInfos = await getColumnInfo(schema, tableName);

            const tableInfo: TableInfo = { 
                name: tableName,
                columns: columnInfos, 
                isEnum, 
                computedFields 
            };
            tableInfos.push(tableInfo);
        }
        
    } catch (error) {
        logger.error(`Failed to query the database tables details: ${error}`);
        process.exit(1);
    }

    return tableInfos;
}

async function getSchemaInfo(){
    const query = `SELECT schema_name FROM information_schema.schemata ;`

    const schemaInfos: SchemaInfo[] = [];
    try {
        let schemaNames = (await psqlClient!.query(query)).rows.map(record => record["schema_name"]);
        logger.info("Retrieved database schema details.");

        if (schemaToFilter) {
            schemaNames = schemaNames.filter(name => schemaToFilter!.includes(name));
        }

        for (const schemaName of schemaNames) {
            const tableInfos = await getTableInfo(schemaName);

            const schemaInfo: SchemaInfo = {
                name: schemaName,
                tables: tableInfos
            };
            schemaInfos.push(schemaInfo);
        }
    } catch (error) {
        logger.error(`Failed to query the database schema details: ${error}`);
        process.exit(1);
    }
    
    return schemaInfos; 
}

function createSchemaTypeDefs() {}

function createSchemaResolvers() {}

function createTransformerClasses() {}

async function main() {
    // >>> Configurables <<<
    schemaToFilter = ["shop"];
    ComputedFieldsByTable = {
        "shop": {
            "user": ["userBillingAddress", "userShippingAddress"] 
        }
    }
    // >>> Configurables <<<

    await loadStage();

    psqlClient = await getPgClient();

    const schemaInfos = await getSchemaInfo();
    process.exit(0);
}

main();