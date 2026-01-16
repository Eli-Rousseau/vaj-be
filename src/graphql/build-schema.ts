import path from "path";
import { createSchema } from "graphql-yoga";

import { getPgClient, pgClient } from "../utils/database";
import getLogger from "../utils/logger";
import * as constructors from "./query-constructors";
import { getDataBaseInfo, DataBaseInfo, ComputedFieldInfo } from "../database/database-info";

const logger = getLogger({
    source: "src",
    service: "graphql",
    module: path.basename(__filename)
});

let psqlClient: pgClient | null = null;

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

function computedField(schema: string, comptedField: ComputedFieldInfo) {
    const regExpSchema = new RegExp(`^${schema}\.`);
    const returnType = comptedField.returnType.replace(regExpSchema, "");

    if (comptedField.returnTypeKind === "TABLE" && comptedField.returnCardinality === "SINGLE") {
        return `${capitalize(schema)}${capitalize(returnType)}Type`;

    } else if (comptedField.returnTypeKind === "TABLE" && comptedField.returnCardinality === "ARRAY") {
        return `[${capitalize(schema)}${capitalize(returnType)}Type]!`;

    } else if (comptedField.returnTypeKind === "REFERENCE" && comptedField.returnCardinality === "SINGLE") {
        return `${PostgresYogaTypesMap[returnType as PostgresType]}`;

    } else if (comptedField.returnTypeKind === "REFERENCE" && comptedField.returnCardinality === "ARRAY") {
        return `[${PostgresYogaTypesMap[returnType as PostgresType]}]!`;

    } else if (comptedField.returnTypeKind === "COMPOSITE" && comptedField.returnCardinality === "SINGLE") {
        return `${capitalize(schema) + capitalize(returnType)}Type`;
        
    } else if (comptedField.returnTypeKind === "COMPOSITE" && comptedField.returnCardinality === "ARRAY") {
        return `[${capitalize(schema) + capitalize(returnType)}Type]!`;   
    }
    else {
        throw new Error(`Unable to handle computed field return type: ${comptedField.returnType}`);
    }
}

function buildTypeDefs(dataBaseInfo: DataBaseInfo) {
    let typeDefs = `
scalar JSON

input OnConflictType {
\tconstraint: String!
\tcolumns: [String]!
}

input ComparisonExp {
\teq: JSON
\tneq: JSON
\tgt: JSON
\tgte: JSON
\tlt: JSON
\tlte: JSON
\tin: [JSON!]
\tnin: [JSON!]
\thasKey: String
\tcontains: JSON
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

        const schemaCompositeTypes = schemaInfo.compsiteTypes;

        for (const schemaCompositeType of schemaCompositeTypes) {
            const compositeType = `
            
type ${capitalize(schema) + capitalize(schemaCompositeType.name)}Type {
${schemaCompositeType.columns.map(_columnInfo => `\t${_columnInfo.name}: ${PostgresYogaTypesMap[_columnInfo.dataType as PostgresType]}${_columnInfo.isNullable ? "" : "!"}`).join("\n")}
}
            
            `;

            typeDefs = typeDefs.concat(compositeType);
        }
 
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
${computedFields.map(_computedField => `\t${_computedField.name}: ${computedField(schema, _computedField)}`).join("\n")}
}

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
\tand: [${schemaTableName}WhereType!]
\tor: [${schemaTableName}WhereType!]
\tnot: [${schemaTableName}WhereType!]
}

                `;

                const getOrderType = `

input ${schemaTableName}OrderByType {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: OrderDirection`).join("\n")}
}

                `;

                const tableMutationType = `

input ${schemaTableName}MutationType {
${columnInfos.map(_columnInfo => `\t${_columnInfo.name}: ${PostgresYogaTypesMap[_columnInfo.dataType as PostgresType]}`).join("\n")}
${fkTables.map(_table => `\t${_table.name}ByReference: ${schemaTableName}${capitalize(_table.foreignKey!)}MutationType`).join("\n")}
}

                `;

                const pkTableMutationType = pkTables.map(_table => {
                    return `

input ${capitalize(schema) + capitalize(_table.name) + capitalize(table)}MutationType {
\tdata: ${schemaTableName}MutationType!
\tonConflict: OnConflictType
\tset: [String]
}

                `
                }).join("");

                typeDefs = typeDefs.concat(tableType, getType, getWhereType, getOrderType, tableMutationType, pkTableMutationType);

                const getByReferenceQuery = `get${schemaTableName}ByReference(reference: ID!): ${schemaTableName}Type`;
                const getBulkQuery = `get${plural(schemaTableName)}(where: ${schemaTableName}WhereType, orderBy: [${schemaTableName}OrderByType!], limit: Int, offset: Int): [${schemaTableName}Type!]!`;
                queryTypes.push(getByReferenceQuery, getBulkQuery);

                const singleInsertQuery = `insert${schemaTableName}(data: ${schemaTableName}MutationType!, onConflict: OnConflictType): ${schemaTableName}Type!`;
                const bulkInsertQuery = `insert${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!, onConflict: OnConflictType): [${schemaTableName}Type!]!`;
                const singleUpdateQuery = `update${schemaTableName}(data: ${schemaTableName}MutationType!, set: [String]): ${schemaTableName}Type!`;
                const bulkUpdateQuery = `update${plural(schemaTableName)}(data: [${schemaTableName}MutationType!]!, set: [String]): [${schemaTableName}Type!]!`;
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
                resolvers["Mutation"][`update${schemaTableName}`] = async (_, { data, set }) => {
                    const query = await constructors.constructSingleUpdateQuery(schema, table, { data, set });
                    const res = await psqlClient!.query(query);
                    return res.rows[0];
                } ;
                resolvers["Mutation"][`update${plural(schemaTableName)}`] = async (_, { data, set }) => {
                    const query = await constructors.constructBulkUpdateQuery(schema, table, { data, set });
                    console.log(query);
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
                    const query = constructors.constructGetComputationalFieldQuery(schema, table, _computedField.name, _computedField.returnTypeKind, parent.reference);
                    const res = await psqlClient!.query(query);
                    
                    if (_computedField.returnCardinality === "ARRAY") {
                        return res.rows.map(_row => _computedField.returnTypeKind === "REFERENCE" ? _row[_computedField.name] : _row) ?? [];
                    } else {
                    const row = res.rows?.[0];

                    if (!row) {
                        return null;
                    }

                    const allValuesNull = Object.values(row).every(
                        value => value === null
                    );

                    return allValuesNull ? null : (_computedField.returnTypeKind === "REFERENCE" ? row[_computedField.name] : row);
                    }

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

export async function buildGraphQLSchema(forceBuild: boolean = false) {
    psqlClient = await getPgClient();
    
    const dataBaseInfo = await getDataBaseInfo(forceBuild);

    const typeDefs = buildTypeDefs(dataBaseInfo!);
    const resolvers = buildResolvers(dataBaseInfo!);

    const schema = createSchema({ typeDefs, resolvers })

    return schema;
}
