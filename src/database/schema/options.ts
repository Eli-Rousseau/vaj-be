import path from "path";

import { getPgClient, pgClient } from "../../utils/database";
import getLogger from "../../utils/logger";
import { loadStage } from "../../utils/stage";
import * as constructors from "./constructors";

const logger = getLogger({
    source: "scripts",
    module: path.basename(__filename)
});

let psqlClient: pgClient | null = null;
let dataBaseInfo: DataBaseInfo | null = null;

let schemaToFilter: string[] | null = null;

type ColumnInfo = {
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    hasDefault: boolean;
    foreignKey: string | null;
    isNullable: boolean;
    handleAutomaticUpdate: boolean;
};

type ComputedFieldInfo = {
    name: string;
    arg: { name: string, type: string };
    returnType: string;
    returnCardinality: "SINGLE" | "ARRAY" ;
};

type TableInfo = {
    name: string;
    isEnum: boolean;
    columns: ColumnInfo[];
    computedFields: ComputedFieldInfo[];
};

type SchemaInfo = {
    name: string;
    tables: TableInfo[];
};

type DataBaseInfo = {
    schemas: SchemaInfo[] 
}

async function getColumnInfo(schema: string, table: string) {
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
        const columnDetails = (await psqlClient!.query(query)).rows;

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
        logger.error(`Failed to query the database column details for schema "${schema}" and table ${table}: ${error}`);
        throw error;
    }

    return columnInfos;
}

async function getComputedFields(schema: string, table: string) {
    const query = `
SELECT
    p.proname                               AS function_name,
    m.schema_name || '.' || m.type_name     AS argument,
    pg_get_function_result(p.oid)           AS return_type,

    CASE
        WHEN p.proretset OR t.typelem <> 0 THEN 'ARRAY'
        ELSE 'SINGLE'
    END                                     AS return_cardinality

FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_type t ON t.oid = p.prorettype

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
        const computedFieldDetails = (await psqlClient!.query(query)).rows;
        
        for (const computedFieldDetail of computedFieldDetails) {
            const fnName = computedFieldDetail["function_name"];
            const argType = computedFieldDetail["argument"];
            const returnType = computedFieldDetail["return_type"];
            const returnCardinality = computedFieldDetail["return_cardinality"];

            const computedFieldInfo: ComputedFieldInfo = {
                name: fnName,
                arg: { name: table, type: argType },
                returnType: returnType,
                returnCardinality
            };
            computedFieldInfos.push(computedFieldInfo);
        }

    } catch (error) {
        logger.error(`Failed to query the database tables computed functions details: ${error}`);
        throw error;
    }

    return computedFieldInfos;
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
`;
    const tableInfos: TableInfo[] = [];
    try {
        const tableDetails = (await psqlClient!.query(query)).rows;

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
        logger.error(`Failed to query the database tables details: ${error}`);
        throw error;
    }

    return tableInfos;
}

async function getSchemaInfo() {
    const query = `SELECT schema_name FROM information_schema.schemata ;`

    const schemaInfos: SchemaInfo[] = [];
    try {
        let schemaNames = (await psqlClient!.query(query)).rows.map(record => record["schema_name"]);

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
        throw error;
    }
    
    return schemaInfos; 
}

async function buildDataBaseInfo() {
    const schemaInfos = await getSchemaInfo();
    dataBaseInfo = { schemas: schemaInfos };
    logger.info("Database info retrieved successfully.");
}

export async function getDataBaseInfo() {
    if (dataBaseInfo) {
        return dataBaseInfo;
    }

    await buildDataBaseInfo();
    return dataBaseInfo;
}

type PostgresType =
  | "bigint"
  | "boolean"
  | "character"
  | "character varying"
  | "date"
  | "double precision"
  | "integer"
  | "json"
  | "jsonb"
  | "numeric"
  | "smallint"
  | "text"
  | "time"
  | "timestamp"
  | "timestamp without time zone"
  | "timestamp with time zone"
  | "USER-DEFINED"
  | "uuid";

type YogaType = 
  | "String"
  | "JSON"
  | "ID"
  | "Boolean"
  | "Int"
  | "Float";

const PostgresYogaTypesMap: Record<PostgresType, YogaType> = {
    bigint: "Int",
    boolean: "Boolean",
    character: "String",
    "character varying": "String",
    date: "String",
    "double precision": "Float",
    integer: "Int",
    json: "JSON",
    jsonb: "JSON",
    numeric: "Float",
    smallint: "Int",
    text: "String",
    time: "String",
    timestamp: "String",
    "timestamp without time zone": "String",
    "timestamp with time zone": "String",
    "USER-DEFINED": "String",
    uuid: "ID",
}

function plural(text: string) {
    return text.endsWith("s") ? text + "es" : text + "s";
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function computedFieldReturnType(schema: string, comptedField: ComputedFieldInfo): { field: string, type: string} {
    const regExpSchema = new RegExp(`^${schema}\.`);

    if (regExpSchema.test(comptedField.returnType)) {
        const returnType = comptedField.returnType.replace(regExpSchema, "");
        const field = `${capitalize(schema)}${capitalize(returnType)}Type`;
        const type = ``;

        return { field, type };
    } else {
        throw new Error(`Unable to handle computed field return type: ${comptedField.returnType}`);
    }
}

function buildTypeDefs(dataBaseInfo: DataBaseInfo) {
    let typeDefs = `
scalar JSON
scalar NULL

input OnConflictType {
\tconstraint: String!
\tcolumns: [String]!
}

input ComparisonExp {
\t_eq: JSON
\t_neq: JSON
\t_gt: JSON
\t_gte: JSON
\t_lt: JSON
\t_lte: JSON
\t_in: [JSON!]
\t_nin: [JSON!]
\t_hasKey: String
\t_contains: JSON
}

enum OrderDirection {
\tASC
\tDESC
}
    `;

    const queryTypes: string[] = [];
    const mutationTypes: string[] = [];

    const schemaInfos = dataBaseInfo.schemas;

    for (const schemaInfo of schemaInfos) {
        const schema = schemaInfo.name;
        const tableInfos = schemaInfo.tables;
 
        for (const tableInfo of tableInfos) {
            const table = tableInfo.name;
            const columnInfos = tableInfo.columns;
            const computedFields = tableInfo.computedFields;

            const schemaTableName = capitalize(schema) + capitalize(table);
            const fkTables = columnInfos
            .filter(_columnInfo => 
                _columnInfo.foreignKey && ! _columnInfo.foreignKey.endsWith("Enum")
            );
            const pkTables = tableInfos
            .filter(_tableInfo =>
                _tableInfo.columns.some(
                _columnInfo => _columnInfo.foreignKey === table
                ) && ! _tableInfo.isEnum
            );

            if (!tableInfo.isEnum) {
                const tableType = `

type ${schemaTableName}Type {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: ${PostgresYogaTypesMap[_columnInfo.dataType as PostgresType]}${_columnInfo.isNullable ? "" : "!"}`).join("\n")}
${fkTables.map(_table => `\t${_table.name}ByReference: ${capitalize(schema) + capitalize(_table.foreignKey!)}Type`).join("\n")}
${pkTables.map(_table => `\t${plural(_table.name)}: [${capitalize(schema) + capitalize(_table.name)}Type!]!`).join("\n")}
${computedFields.map(_computedField => `\t${_computedField.name}: ${computedFieldReturnType(schema, _computedField).field}`)}
}

                `;

                const computedFieldTypes = `

${computedFields.map(_computedField => computedFieldReturnType(schema, _computedField).type).join("")}

                `;

                const getType = `

input ${schemaTableName}GetType {
\twhere: ${schemaTableName}WhereType
\torderBy: ${schemaTableName}OrderByType
\tlimit: Int
\toffset: Int 
}
            
                `;

                const getWhereType = `

input ${schemaTableName}WhereType {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: ComparisonExp`).join("\n")}
${fkTables.map(_table => `\t${_table.name}ByReference: ${capitalize(schema) + capitalize(_table.foreignKey!)}GetType`).join("\n")}
\t_and: [${schemaTableName}WhereType!]
\t_or: [${schemaTableName}WhereType!]
\t_not: [${schemaTableName}WhereType!]
}

                `;

                const getOrderType = `

input ${schemaTableName}OrderByType {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: OrderDirection`).join("\n")}
}

                `;

                const tableMutationType = `

input ${schemaTableName}MutationType {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: ${PostgresYogaTypesMap[_columnInfo.dataType as PostgresType]}${_columnInfo.isNullable || _columnInfo.hasDefault || _columnInfo.isPrimaryKey || _columnInfo.handleAutomaticUpdate ? "" : "!"}`).join("\n")}
${fkTables.map(_table => `\t${_table.name}ByReference: ${schemaTableName}${capitalize(_table.foreignKey!)}MutationType`).join("\n")}
}

                `;

                const pkTableMutationType = pkTables.map(_table => {
                    return `

input ${capitalize(schema) + capitalize(_table.name) + capitalize(table)}MutationType {
\tdata: ${schemaTableName}MutationType!
\tonConflict: OnConflictType
}

                `
                }).join("");

                typeDefs = typeDefs.concat(tableType, computedFieldTypes, getType, getWhereType, getOrderType, tableMutationType, pkTableMutationType);

                const getByReferenceQuery = `get${schemaTableName}ByReference(reference: ID!): ${schemaTableName}Type`;
                const getBulkQuery = `get${plural(schemaTableName)}(where: ${schemaTableName}WhereType, orderBy: [${schemaTableName}OrderByType!], limit: Int, offset: Int): [${schemaTableName}Type!]!`;
                queryTypes.push(getByReferenceQuery, getBulkQuery);

                const singleInsertQuery = `insert${schemaTableName}(data: ${schemaTableName}MutationType!, onConflict: OnConflictType): ${schemaTableName}Type!`;
                const bulkInsertQuery = `insert${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!, onConflict: OnConflictType): [${schemaTableName}Type!]!`;
                const singleUpdateQuery = `update${schemaTableName}(data: ${schemaTableName}MutationType!): ${schemaTableName}Type!`;
                const bulkUpdateQuery = `update${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!): [${schemaTableName}Type!]!`;
                const singleDeleteQuery = `delete${schemaTableName}(data: ${schemaTableName}MutationType!): ${schemaTableName}Type!`;
                const bulkDeleteQuery = `delete${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!): [${schemaTableName}Type!]!`;
                mutationTypes.push(singleInsertQuery, bulkInsertQuery, singleUpdateQuery, bulkUpdateQuery, singleDeleteQuery, bulkDeleteQuery);


            } else {
                const tableType = `

type ${schemaTableName}Type {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: ${PostgresYogaTypesMap[_columnInfo.dataType as PostgresType]}${_columnInfo.isNullable ? "" : "!"}`).join("\n")}
${fkTables.map(_table => `\t${_table.name}ByReference: ${capitalize(schema) + capitalize(_table.foreignKey!)}Type`).join("\n")}
}

                `;

                const tableMutationType = `

input ${schemaTableName}MutationType {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: ${PostgresYogaTypesMap[_columnInfo.dataType as PostgresType]}${_columnInfo.isNullable || _columnInfo.hasDefault || _columnInfo.isPrimaryKey || _columnInfo.handleAutomaticUpdate ? "" : "!"}`).join("\n")}
${fkTables.map(_table => `\t${_table.name}ByReference: ${schemaTableName}${capitalize(_table.foreignKey!)}MutationType`).join("\n")}
}

                `;

                typeDefs = typeDefs.concat(tableType, tableMutationType);

                const getQuery = `get${plural(schemaTableName)}: [${schemaTableName}Type!]!`;
                queryTypes.push(getQuery);

                const insertQuery = `insert${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!): [${schemaTableName}Type!]!`;
                const deleteQuery = `delete${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!): [${schemaTableName}Type!]!`;
                mutationTypes.push(insertQuery, deleteQuery);
            }
        }
    }

    const queryTypesString = `

type Query {
${queryTypes.map(line => `\t${line}`).join("\n")}
}

    `;
    const mutationTypesString = `

type Mutation {
${mutationTypes.map(line => `\t${line}`).join("\n")}
}

    `;

    typeDefs = typeDefs.concat(queryTypesString, mutationTypesString);

    return typeDefs;
}

type ResolverFn = (...args: any[]) => any;

function buildResolvers(dataBaseInfo: DataBaseInfo) {

    const schemaInfos = dataBaseInfo.schemas;

    let resolvers: Record<string, Record<string, ResolverFn>> = { Query: {}, Mutation: {} };

    for (const schemaInfo of schemaInfos) {
        const schema = schemaInfo.name;
        const tableInfos = schemaInfo.tables;

        for (const tableInfo of tableInfos) {
            const table = tableInfo.name;
            const columnInfos = tableInfo.columns;
            const computedFields = tableInfo.computedFields;

            const schemaTableName = capitalize(schema) + capitalize(table);
            const pkTables = tableInfos
            .filter(_tableInfo =>
                _tableInfo.columns.some(
                _columnInfo => _columnInfo.foreignKey === table
                ) && ! _tableInfo.isEnum
            );
            const fkTables = columnInfos
            .filter(_columnInfo => 
                _columnInfo.foreignKey && ! _columnInfo.foreignKey.endsWith("Enum")
            );

            if (!tableInfo.isEnum) {
                resolvers["Query"][`get${schemaTableName}ByReference`] = async (_, { reference }) => {
                    const query = constructors.constructGetOnColumnQuery(schema, table, "reference", reference);
                    const res = await psqlClient!.query(query);
                    return res.rows[0];
                } ;
                resolvers["Query"][`get${plural(schemaTableName)}`] = async (_, { where, orderBy, limit, offset }) => {
                    const query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
                    const res = await psqlClient!.query(query);
                    return res.rows;
                } ;
                
                resolvers["Mutation"][`insert${schemaTableName}`] = async (_, {data, onConflict}) => {
                    const query = await constructors.constructSingleInsertQuery(schema, table, { data, onConflict });
                    const res = await psqlClient!.query(query);
                    return res.rows[0];
                } ;
                resolvers["Mutation"][`insert${plural(schemaTableName)}`] = async (_, {data, onConflict}) => {
                    const query = await constructors.constructBulkInsertQuery(schema, table, { data, onConflict });
                    const res = await psqlClient!.query(query);
                    return res.rows;
                } ;
                resolvers["Mutation"][`update${schemaTableName}`] = async (_, { data }) => {
                    const query = await constructors.constructSingleUpdateQuery(schema, table, { data });
                    const res = await psqlClient!.query(query);
                    return res.rows[0];
                } ;
                resolvers["Mutation"][`update${plural(schemaTableName)}`] = async (_, { data }) => {
                    const query = await constructors.constructBulkUpdateQuery(schema, table, { data });
                    const res = await psqlClient!.query(query);
                    return res.rows;
                } ;
                resolvers["Mutation"][`delete${schemaTableName}`] = async (__dirname, { data }) => {
                    const query = await constructors.constructSingleDeleteQuery(schema, table, { data });
                    const res = await psqlClient!.query(query);
                    return res.rows[0];
                } ;
                resolvers["Mutation"][`delete${plural(schemaTableName)}`] = async (__dirname, { data }) => {
                    const query = await constructors.constructBulkDeleteQuery(schema, table, { data });
                    const res = await psqlClient!.query(query);
                    return res.rows;
                } ;

                resolvers[`${schemaTableName}Type`] = {};

                pkTables.forEach(_table => resolvers[`${schemaTableName}Type`][plural(_table.name)] = async (parent) => {
                    const query = constructors.constructGetOnColumnQuery(schema, _table.name, table, parent.reference);
                    const res = await psqlClient!.query(query)
                    return res.rows;
                });

                fkTables.forEach(_table => resolvers[`${schemaTableName}Type`][`${_table.name}ByReference`] = async (parent) => {
                    const query = constructors.constructGetOnColumnQuery(schema, _table.name, "reference", parent.user);
                    const res = await psqlClient!.query(query);
                    return res.rows[0];
                });

                computedFields.forEach(_computedField => resolvers[`${schemaTableName}Type`][_computedField.name] = async (parent) => {
                    const query = constructors.constructGetComputationalFieldQuery(schema, table, _computedField.name, parent.reference);
                    const res = await psqlClient!.query(query);
                    console.log(res.rows);
                    console.log(_computedField.returnCardinality);
                    return _computedField.returnCardinality === "SINGLE" ? res.rows[0] : res.rows;
                });
            } else {
                resolvers["Query"][`get${plural(schemaTableName)}`] = async (_) => {
                    const query = constructors.constructGetQuery(schema, table); 
                    const res = await psqlClient!.query(query);
                    return res.rows;
                };

                resolvers["Mutation"][`insert${plural(schemaTableName)}`] = async (__dirname, { data }) => {
                    const query = await constructors.constructBulkInsertQuery(schema, table, { data });
                    const res = await psqlClient!.query(query);
                    return res.rows;
                };
                resolvers["Mutation"][`delete${plural(schemaTableName)}`] = async (__dirname, { data }) => {
                    const query = await constructors.constructBulkDeleteQuery(schema, table, { data }, columnInfos[0].name);
                    const res = await psqlClient!.query(query);
                    return res.rows;
                };
            }
        }
    }

    return resolvers;
}

function buildTransformerClasses() {}

export async function buildSchemaOptions() {
    // >>> Configurables <<<
    schemaToFilter = ["shop"];
    // >>> Configurables <<<

    await loadStage();

    psqlClient = await getPgClient();

    await buildDataBaseInfo();

    const typeDefs = buildTypeDefs(dataBaseInfo!);
    const resolvers = buildResolvers(dataBaseInfo!);

    return { typeDefs, resolvers };
}
