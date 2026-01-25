import path from "path";

import { logger } from "../utils/logger";
import { PostgresType } from "../graphql/build-schema";
import { DataBaseInfo, SchemaInfo, TableInfo, ColumnInfo, ComputedFieldInfo, CompositeTypeInfo, CompositeTypeColumnInfo, SCHEMAS_TO_FILTER } from "../database/database-info";

const LOGGER = logger.get({
    source: "src",
    service: "classes",
    module: path.basename(__filename)
});

const INDENT = " ".repeat(2);

type TypeScriptType = "number" | "boolean" | "string" | "any";

const TYPE_MAPPER: Record<PostgresType, TypeScriptType> = {
  bigint: "number",
  boolean: "boolean",
  character: "string",
  "character varying": "string",
  date: "string",
  "double precision": "number",
  integer: "number",
  json: "any",
  jsonb: "any",
  numeric: "number",
  smallint: "number",
  text: "string",
  time: "string",
  timestamp: "string",
  "timestamp without time zone": "string",
  "timestamp with time zone": "string",
  "USER-DEFINED": "string",
  uuid: "string",
};

const TRANSFORMER_MAPPER: Record<
  PostgresType,
  { to: string; from: string } | null
> = {
  bigint: null,
  boolean: null,
  character: null,
  "character varying": null,
  date: { to: "toDay", from: "fromDay" },
  "double precision": null,
  integer: null,
  json: { to: "toJSON", from: "fromJSON" },
  jsonb: { to: "toJSON", from: "fromJSON" },
  numeric: null,
  smallint: null,
  text: null,
  time: { to: "toDatetime", from: "to Datetime" },
  timestamp: { to: "toDatetime", from: "fromDatetime" },
  "timestamp without time zone": { to: "toDatetime", from: "fromDatetime" },
  "timestamp with time zone": { to: "toDatetime", from: "fromDatetime" },
  "USER-DEFINED": null,
  uuid: null,
};

let SCHEMA_REGEXP: RegExp = new RegExp("");

let TRANSFORMER_CLASSES = "";

function plural(text: string) {
    return text.endsWith("s") ? text + "es" : text + "s";
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function buildCompositeTypeTransformerClasses(
    schemaInfo: SchemaInfo,
    compositeTypeInfo: CompositeTypeInfo
) {
    const className = `${capitalize(schemaInfo.name)}${capitalize(compositeTypeInfo.name)}`;

    const body = [
        buildCompositeTypeColumnFields(schemaInfo, compositeTypeInfo)
    ]
        .filter(Boolean)
        .join("\n\n");

    const transformerClass = `

export class ${className} extends transformers.TransformerClass {
${body}
}

`;
    TRANSFORMER_CLASSES += transformerClass;
}

function buildCompositeTypeColumnFields(
  schema: SchemaInfo,
  compositeTypeInfo: CompositeTypeInfo
): string {
  return compositeTypeInfo.columns
    .map(column => buildCompositeTypeColumnField(schema, column))
    .join("\n\n");
}

function buildCompositeTypeColumnField(
  schema: SchemaInfo,
  column: CompositeTypeColumnInfo
): string {
  return [
    buildTransformDecorators(column),
    `${INDENT}@Expose()`,
    buildPropertyDeclaration(schema, column),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildTableTransformerClasses(
  schemaInfo: SchemaInfo,
  tableInfo: TableInfo
) {
  const className = `${capitalize(schemaInfo.name)}${capitalize(tableInfo.name)}`;

  const body = [
    buildColumnFields(schemaInfo, tableInfo),
    buildForeignKeyCollections(schemaInfo, tableInfo),
    buildComputedFields(schemaInfo, tableInfo),
  ]
    .filter(Boolean)
    .join("\n\n");

  const transformerClass = `

export class ${className} extends transformers.TransformerClass {
${body}
}

`;

  TRANSFORMER_CLASSES += transformerClass;
}

function buildColumnFields(
  schema: SchemaInfo,
  tableInfo: TableInfo
): string {
  return tableInfo.columns
    .flatMap(column => buildColumnVariants(schema, column))
    .join("\n\n");
}


function buildColumnVariants(
  schema: SchemaInfo,
  column: ColumnInfo
): string[] {
  if (!column.foreignKey || column.foreignKey.endsWith("Enum")) {
    return [buildColumnField(schema, column)];
  }

  const referenceColumn: ColumnInfo = {
    ...column,
    name: `${column.name}ByReference`,
  };

  const baseColumn: ColumnInfo = {
    ...column,
    foreignKey: null,
    isNullable: false
  };

  return [
    buildColumnField(schema, referenceColumn),
    buildColumnField(schema, baseColumn),
  ];
}


function buildColumnField(
  schema: SchemaInfo,
  column: ColumnInfo
): string {
  return [
    buildForeignKeyDecorator(schema, column),
    buildTransformDecorators(column),
    `${INDENT}@Expose()`,
    buildPropertyDeclaration(schema, column),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildForeignKeyDecorator(
  schema: SchemaInfo,
  column: ColumnInfo
): string | null {
  if (!column.foreignKey) return null;

  return `${INDENT}@Type(() => ${capitalize(schema.name)}${capitalize(column.foreignKey)})`;
}

function buildTransformDecorators(
    column: ColumnInfo | CompositeTypeColumnInfo
): string | null {
  const transformer = TRANSFORMER_MAPPER[column.dataType as PostgresType];
  if (!transformer) return null;

  const nullable = column.isNullable ? ", { isNullable: true }" : "";

  return `
${INDENT}@Transform(({ value }) => transformers.${transformer.to}(value${nullable}), { toClassOnly: true })
${INDENT}@Transform(({ value }) => transformers.${transformer.from}(value${nullable}), { toPlainOnly: true })`;
}

function buildPropertyDeclaration(
  schema: SchemaInfo,
  column: ColumnInfo | CompositeTypeColumnInfo
): string {
  const type = column.hasOwnProperty("foreignKey") && (column as ColumnInfo).foreignKey
    ? `${capitalize(schema.name)}${capitalize((column as ColumnInfo).foreignKey!)}`
    : TYPE_MAPPER[column.dataType as PostgresType];

  const optional = column.isNullable ? "?" : "!";
  const nullable = column.isNullable ? " | null = null" : "";

  return `${INDENT}${column.name}${optional}: ${type}${nullable};`;
}

function buildForeignKeyCollections(
  schema: SchemaInfo,
  tableInfo: TableInfo
): string {
  const fkTables = tableInfo.columns
    .map(c => c.foreignKey)
    .filter(Boolean) as string[];

  return fkTables
    .map(table => {
      const type = `${capitalize(schema.name)}${capitalize(table)}`;

      return `
${INDENT}@Type(() => ${type})
${INDENT}@Expose()
${INDENT}${plural(type)}?: ${type}[] | null = null;`;
    })
    .join("\n\n");
}

function buildComputedFields(
  schema: SchemaInfo,
  tableInfo: TableInfo
): string {
  return tableInfo.computedFields
    .map(field => buildComputedField(schema, field))
    .join("\n\n");
}

function buildComputedField(
  schema: SchemaInfo,
  field: ComputedFieldInfo
): string {
  const returnType = field.returnType.replace(SCHEMA_REGEXP, "");
  const typeName = `${capitalize(schema.name)}${capitalize(returnType)}`;
  const isTable =
    field.returnTypeKind === "TABLE" ||
    field.returnTypeKind === "COMPOSITE";

  const decorators = isTable
    ? `${INDENT}@Type(() => ${typeName})`
    : buildComputedTransformDecorators(field);

  const array = field.returnCardinality === "ARRAY" ? "[]" : "";

  return `
${decorators}
${INDENT}${field.name}?: ${typeName}${array} | null = null;`;
}

function buildComputedTransformDecorators(
  field: ComputedFieldInfo
): string {
  const transformer =
    TRANSFORMER_MAPPER[field.returnType as PostgresType];

  if (!transformer) return "";

  return `
${INDENT}@Transform(({ value }) => transformers.${transformer.to}(value, { isNullable: true }), { toClassOnly: true })
${INDENT}@Transform(({ value }) => transformers.${transformer.from}(value, { isNullable: true }), { toPlainOnly: true })`.trim();
}

function buildSchemaTransformerClasses(schemaInfo: SchemaInfo) {
    const buildClasses = new Set<string>();
    for (const tableInfo of schemaInfo.tables) {
        const fkTables: string[] = tableInfo.columns
            .filter(_column => _column.foreignKey)
            .map(_column => _column.foreignKey) as string[];

        for (const fkTable of fkTables) {
            const fkTableInfo = schemaInfo.tables.filter(_table => _table.name === fkTable)[0];
            if (!buildClasses.has(fkTableInfo.name)) buildTableTransformerClasses(schemaInfo, fkTableInfo);
            buildClasses.add(fkTableInfo.name);
        }

        for (const computedFieldInfo of tableInfo.computedFields) {
            
            if (computedFieldInfo.returnTypeKind === "TABLE") {
                const returnType = computedFieldInfo.returnType.replace(SCHEMA_REGEXP, "");
                const cfTableInfo = schemaInfo.tables.filter(_table => _table.name === returnType)[0];
                if (!buildClasses.has(cfTableInfo.name)) buildTableTransformerClasses(schemaInfo, cfTableInfo);
                buildClasses.add(cfTableInfo.name);
            }

            else if (computedFieldInfo.returnTypeKind === "COMPOSITE") {
                const returnType = computedFieldInfo.returnType.replace(SCHEMA_REGEXP, "");
                const compositeTypeInfo = schemaInfo.compsiteTypes.filter(_type => _type.name === returnType)[0];
                if (!buildClasses.has(compositeTypeInfo.name)) buildCompositeTypeTransformerClasses(schemaInfo, compositeTypeInfo);
                buildClasses.add(compositeTypeInfo.name);
            }

        }

        if (!buildClasses.has(tableInfo.name)) buildTableTransformerClasses(schemaInfo, tableInfo);
    }
}

export function buildTransformerClasses(databaseInfo: DataBaseInfo) {
    const plate = `
import { Transform, Expose, Type } from "class-transformer";

import * as transformers from "./transformers";
    `

    TRANSFORMER_CLASSES += plate;

    for (const schemaInfo of databaseInfo.schemas) {
        if (SCHEMAS_TO_FILTER.includes(schemaInfo.name)) {
            SCHEMA_REGEXP = new RegExp(`^${schemaInfo.name}.`);
            buildSchemaTransformerClasses(schemaInfo);
        }
    }

    LOGGER.info(`Successfull build database transformer classes.`);

    return TRANSFORMER_CLASSES;
}