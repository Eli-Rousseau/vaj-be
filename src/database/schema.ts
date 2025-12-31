import { getPgClient } from "../utils/database";
import { createSchema } from "graphql-yoga";

// let psqlClient: pgClient | null = null;

// type ColumnInfo = {
//     column_name: string,
//     data_type: string,
//     is_nullable: string
// }

// type TableInfo = {
//     table: string,
//     columns: ColumnInfo[],
//     primaryKey: string | null
// }

// type GeneratedResolvers = {
//     Query: Record<string, (parent: unknown, args: { reference: string }) => unknown>,
//     Mutation: Record<string, (parent: unknown, args: { data: Object, reference?: string }) => unknown>
// }

// const pgToGraphQL: Record<string, string> = {
//   "integer": "Int",
//   "bigint": "Int",
//   "smallint": "Int",
//   "text": "String",
//   "varchar": "String",
//   "character varying": "String",
//   "timestamp": "String",
//   "boolean": "Boolean",
//   default: "String"
// };

// const logger = getLogger({
//     source: "database",
//     module: path.basename(__filename),
//     service: "database"
// });

// async function getTables(): Promise<string[]> {
//   const res = await psqlClient!.query(`
//     SELECT table_name
//     FROM information_schema.tables
//     WHERE table_schema = 'shop';
//   `);
//   return res.rows.map(r => r.table_name);
// }

// async function getColumns(table: string): Promise<ColumnInfo[]> {
//   const res = await psqlClient!.query(`
//     SELECT column_name, data_type, is_nullable
//     FROM information_schema.columns
//     WHERE table_schema = 'shop' AND table_name = $1;
//   `, [table]);
//   return res.rows;
// }

// async function getPrimaryKey(table: string): Promise<string | null> {
//   const res = await psqlClient!.query(`
//     SELECT kcu.column_name
//     FROM information_schema.table_constraints tc
//     JOIN information_schema.key_column_usage kcu
//       ON tc.constraint_name = kcu.constraint_name
//     WHERE tc.table_schema = 'shop'
//       AND tc.table_name = $1
//       AND tc.constraint_type = 'PRIMARY KEY';
//   `, [table]);
//   return res.rows[0]?.column_name || null;
// }

// function toGqlType(column: ColumnInfo) {
//   return pgToGraphQL[column.data_type] || pgToGraphQL.default;
// }

// function buildTypeSDL(table: string, columns: ColumnInfo[]): string {
//   const fields = columns.map(col => {
//     const gqlType = toGqlType(col);
//     const required = col.is_nullable === "NO" ? "!" : "";
//     return `  ${col.column_name}: ${gqlType}${required}`;
//   });

//   return `
// type ${capitalize(table)} {
// ${fields.join("\n")}
// }
// `;
// }

// function buildInputSDL(table: string, columns: ColumnInfo[], primaryKey: string): string {
//   const fields = columns
//     .filter(col => col.column_name !== primaryKey)
//     .map(col => `  ${col.column_name}: ${toGqlType(col)}`);

//   return `
// input ${capitalize(table)}Input {
// ${fields.join("\n")}
// }
// `;
// }

// function buildQuerySDL(tables: string[]): string {
//   let sdl = "type Query {\n";
//   for (const table of tables) {
//     sdl += `  get${capitalize(table)}(reference: UUID!): ${capitalize(table)}\n`;
//     sdl += `  list${capitalize(table)}: [${capitalize(table)}!]\n`;
//   }
//   sdl += "}\n";
//   return sdl;
// }

// function buildMutationSDL(tables: string[]): string {
//   let sdl = "type Mutation {\n";
//   for (const table of tables) {
//     sdl += `  insert${capitalize(table)}(data: ${capitalize(table)}Input!): ${capitalize(table)}\n`;
//     sdl += `  update${capitalize(table)}(reference: UUID!, data: ${capitalize(table)}Input!): ${capitalize(table)}\n`;
//     sdl += `  delete${capitalize(table)}(reference: UUID!): Boolean\n`;
//   }
//   sdl += "}\n";
//   return sdl;
// }

// function capitalize(s: string): string {
//   return s.charAt(0).toUpperCase() + s.slice(1);
// }

// async function buildResolvers(tablesInfo: TableInfo[]) {
//   const resolvers: GeneratedResolvers = { Query: {}, Mutation: {} };

//   for (const { table, columns, primaryKey } of tablesInfo) {
//     const cap = capitalize(table);

//     // QUERIES
//     resolvers.Query[`get${cap}`] = async (_, { reference }) => {
//       const res = await psqlClient!.query(
//         `SELECT * FROM ${table} WHERE ${primaryKey} = $1`,
//         [reference]
//       );
//       return res.rows[0] || null;
//     };

//     resolvers.Query[`list${cap}`] = async () => {
//       const res = await psqlClient!.query(`SELECT * FROM ${table}`);
//       return res.rows;
//     };

//     // MUTATIONS
//     resolvers.Mutation[`insert${cap}`] = async (_, { data }) => {
//       const keys = Object.keys(data);
//       const values = Object.values(data);

//       const columnsSQL = keys.join(", ");
//       const paramsSQL = keys.map((_, i) => `$${i + 1}`).join(", ");

//       const res = await psqlClient!.query(
//         `INSERT INTO ${table} (${columnsSQL}) VALUES (${paramsSQL}) RETURNING *`,
//         values
//       );

//       return res.rows[0];
//     };

//     resolvers.Mutation[`update${cap}`] = async (_, { reference, data }) => {
//       const keys = Object.keys(data);
//       const values = Object.values(data);

//       const setSQL = keys
//         .map((k, i) => `${k} = $${i + 1}`)
//         .join(", ");

//       const res = await psqlClient!.query(
//         `UPDATE ${table} SET ${setSQL} WHERE ${primaryKey} = $${keys.length + 1} RETURNING *`,
//         [...values, reference]
//       );

//       return res.rows[0];
//     };

//     resolvers.Mutation[`delete${cap}`] = async (_, { reference }) => {
//       await psqlClient!.query(
//         `DELETE FROM ${table} WHERE ${primaryKey} = $1`,
//         [reference]
//       );
//       return true;
//     };
//   }

//   return resolvers;
// }

// export async function buildSchemaFromDatabase() {
//   const database = process.env.DATABASE_VAJ;
//   const host = process.env.DATABASE_HOST;
//   const port = process.env.DATABASE_PORT;
//   const user = process.env.DATABASE_DEFAULT_USER_NAME;
//   const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;

//   if (!database || !host || !port || !user || !password) {
//     throw Error("Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_DEFAULT_USER_NAME, or DATABASE_DEFAULT_USER_PASSWORD.");
//   }

//   psqlClient = await getPgClient({
//     database,
//     host,
//     port: Number(port),
//     user,
//     password
//   })

//   const tables = await getTables();

//   const tablesInfo: TableInfo[] = [];
//   let typeDefs = "";

//   for (const table of tables) {
//     const columns = await getColumns(table);
//     const primaryKey = await getPrimaryKey(table);

//     if (!primaryKey) {
//         logger.warn(`Table ${table} is missing a primary key. Skipping the creation of the table in the database schema.`);
//         continue;
//     }

//     tablesInfo.push({ table, columns, primaryKey });

//     typeDefs += buildTypeSDL(table, columns);
//     typeDefs += buildInputSDL(table, columns, primaryKey);
//   }

//   typeDefs += buildQuerySDL(tables);
//   typeDefs += buildMutationSDL(tables);

//   const resolvers = await buildResolvers(tablesInfo);

//   return { typeDefs, resolvers };
// }

function constructLimitClause(limit?: number) {
  let limitClause = "";
  if (Number.isInteger(limit) && limit! > 0) {
    limitClause = `LIMIT ${limit}`;
  }

  return limitClause;
}

function constructOffsetClause(offset?: number) {
  let offsetClause = "";
  if (Number.isInteger(offset) && offset! > 0) {
    offsetClause = `OFFSET ${offset}`;
  }

  return offsetClause;
}

function constructOrderByClause(
  table: string,
  orderBy?: Record<string, "ASC" | "DESC">[]
): string {
  if (!orderBy || !Array.isArray(orderBy) || orderBy.length === 0) {
    return "";
  }

  const clauses: string[] = [];

  for (const record of orderBy) {
    const entries = Object.entries(record);

    if (entries.length !== 1) continue;

    const [field, direction] = entries[0];
    const upperDirection = direction.toUpperCase();

    if (!["ASC", "DESC"].includes(upperDirection)) continue;

    clauses.push(`"${table}"."${field}" ${upperDirection}`);
  }

  if (clauses.length === 0) return "";

  return `ORDER BY ${clauses.join(", ")}`;
}

type Operator =
  | "_eq"
  | "_neq"
  | "_gt"
  | "_gte"
  | "_lt"
  | "_lte"
  | "_in"
  | "_nin"
  | "_parse"
  | "_hasKey"
  | "_contains"
  | "_and"
  | "_or"
  | "_not"
  | "where";

type WhereInput = Record<string, Partial<Record<Operator | string, any>>>;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function escapeLiteral(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  const str = String(value);

  if (UUID_REGEX.test(str)) {
    return `'${str}'::uuid`;
  }

  return `'${str.replace(/'/g, "''")}'`;
}


function jsonPathFromDot(path: string): string {
  return "$." + path.split(".").join(".");
}

type NestedWhereResult = {
  nestedJoins: string;
  nestedWheres: string;
};

function constructJSONPath(contains: object, path: string) {
  const entries = Object.entries(contains);
  if (entries.length !== 1) return "";

  const [key, value] = entries[0];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === undefined || value === null) {
    path = path + ` ->> '${key}' = ${escapeLiteral(value)}`
    return path;
  } else if (typeof value === "object") {
    path = path + ` ${key} ->`;
    return constructJSONPath(value, path);
  } else {
    return "";
  }
}

function constructNestedWhereClause(
  schema: string,
  table: string,
  where: WhereInput
): NestedWhereResult {
  let joins: string[] = [];
  let wheres: string[] = [];

  for (const [column, expression] of Object.entries(where)) {
    if (!expression) continue;

    if (/ByReference/.test(column)) {
      const relation = column.replace("ByReference", "");
      if (
        !(
          typeof expression === "object" &&
          Object.keys(expression).includes("where")
        )
      ) {
        continue;
      }
      const nestedWhere = expression["where"];
      joins.push(
        `JOIN "${schema}".${relation} ON "${relation}".reference = "${table}"."${relation}"`
      );

      const { nestedJoins, nestedWheres } = constructNestedWhereClause(schema, relation, nestedWhere);
      joins = joins.concat(nestedJoins);
      wheres = wheres.concat(nestedWheres);
    } else if (column === "_and") {
      const conditionalWheres: string[] = [];
      if (Array.isArray(expression)) {
        for (const nestedWhere of expression) {
          const nestedWhereResult = constructNestedWhereClause(schema, table, nestedWhere);
          conditionalWheres.push(nestedWhereResult["nestedWheres"]);
          joins.push(nestedWhereResult["nestedJoins"]);
        }
      }
      wheres.push(`(${conditionalWheres.join(" AND ")})`);
    } else if (column === "_or") {
      const conditionalWheres: string[] = [];
      if (Array.isArray(expression)) {
        for (const nestedWhere of expression) {
          const nestedWhereResult = constructNestedWhereClause(schema, table, nestedWhere);
          conditionalWheres.push(nestedWhereResult["nestedWheres"]);
          joins.push(nestedWhereResult["nestedJoins"]);
        }
      }
      wheres.push(`(${conditionalWheres.join(" OR ")})`);
    } else if (column === "_not") {
      const conditionalWheres: string[] = [];
      if (Array.isArray(expression)) {
        for (const nestedWhere of expression) {
          const nestedWhereResult = constructNestedWhereClause(schema, table, nestedWhere);
          conditionalWheres.push(nestedWhereResult["nestedWheres"]);
          joins.push(nestedWhereResult["nestedJoins"]);
        }
      }
      wheres.push(`NOT (${conditionalWheres.join(" AND ")})`);
    } else {
      for (const [operator, value] of Object.entries(expression)) {
        const col = `"${table}"."${column}"`;

        if (operator === "_eq") {
          wheres.push(
            value == null
              ? `${col} IS NULL`
              : `${col} = ${escapeLiteral(value)}`
          );
        } else if (operator === "_neq") {
          wheres.push(
            value == null
              ? `${col} IS NOT NULL`
              : `${col} <> ${escapeLiteral(value)}`
          );
        } else if (operator === "_gt") {
          wheres.push(`${col} > ${escapeLiteral(value)}`);
        } else if (operator === "_gte") {
          wheres.push(`${col} >= ${escapeLiteral(value)}`);
        } else if (operator === "_lt") {
          wheres.push(`${col} < ${escapeLiteral(value)}`);
        } else if (operator === "_lte") {
          wheres.push(`${col} <= ${escapeLiteral(value)}`);
        } else if (operator === "_in") {
          if (Array.isArray(value) && value.length) {
            wheres.push(`${col} IN (${value.map(v => escapeLiteral(v)).join(", ")})`);
          }
        } else if (operator === "_nin") {
          if (Array.isArray(value) && value.length) {
            wheres.push(
              `${col} NOT IN (${value.map(v => escapeLiteral(v)).join(", ")})`
            );
          }
        } else if (operator === "_hasKey") {
          if (typeof value === "string") {
            wheres.push(
              `jsonb_path_exists(${col}, '${jsonPathFromDot(value)}')`
            );
          }
        } else if(operator === "_contains") {
          if (typeof value === "object") {
            const path = constructJSONPath(value, "");
            if (path) wheres.push(`${col}${path}`);
          }
        }
      }
    }
  }

  return {
    nestedJoins: joins.join(" "),
    nestedWheres: wheres.join(" AND "),
  };
}

export function constructWhereClause(
  schema: string,
  table: string,
  where?: WhereInput
): string {
  if (!where || Object.keys(where).length === 0) return "";

  const { nestedJoins: joins, nestedWheres: wheres } = constructNestedWhereClause(schema, table, where);

  if (!wheres) return "";
  return `${joins} WHERE ${wheres}`;
}

export function constructGetQuery(
  schema: string, 
  table: string, 
  where?: WhereInput, 
  orderBy?: Record<string, "ASC" | "DESC">[],
  limit?: number,
  offset?: number
): string {
  const whereClause = constructWhereClause(schema, table, where);
  const orderByClause = constructOrderByClause(table, orderBy);
  const limitClause = constructLimitClause(limit);
  const offsetClause = constructOffsetClause(offset);

  const query = `SELECT * FROM "${schema}"."${table}" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause};`;
  return query;
}

export function constructGetByReferenceQuery(
  schema: string, 
  table: string,
  reference: string
): string {
  const query = `SELECT * FROM "${schema}"."${table}" WHERE reference = ${escapeLiteral(reference)};`
  return query;
}

export function constructGetRelationalQuery(
  schema: string, 
  table: string,
  column: string,
  reference: string
): string {
  const query = `SELECT * FROM "${schema}"."${table}" WHERE "${column}" = ${escapeLiteral(reference)}`
  return query;
}

export function constructGetComputationalFieldQuery(
  schema: string, 
  table: string,
  fn: string,
  reference: string
): string {
  const query = `SELECT ("${schema}"."${fn}"("${table}")).* FROM "${schema}"."${table}" WHERE "${table}"."reference" = ${escapeLiteral(reference)};`
  return query;
}

function plural(name: string): string {
  return !name.endsWith("s") ? name + "s" : name + "es";
}

const TableValuesMap = new Map([
  ["user", ["name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole"]],
  ["address", ["user", "userByReference", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing"]],
  ["articleBrandEnum", ["articleBrand"]]
]);

function constructConflictClause(
  onConflict: Record<string, any> | null
): string {
  if (!onConflict) return "";

  let conflictClause = "";

  const constraint = Object.keys(onConflict).includes("constraint") && typeof onConflict["constraint"] == "string" ? onConflict["constraint"] : null;
  const updateColumns = Object.keys(onConflict).includes("columns") && Array.isArray(onConflict["columns"]) ? onConflict["columns"] : null;
  if (constraint && updateColumns) {
    const updates = updateColumns.map(column => `"${column}" = EXCLUDED."${column}"`);
    conflictClause = `ON CONFLICT ON CONSTRAINT "${constraint}" ${updates ? "DO UPDATE SET " + updates.join(", ") : "DO NOTHING"}`;
  }

  return conflictClause;
}

type nestedResult = {
  last: string,
  nesteds: string[]
}

function constructNestedInsertClause(
  schema: string,
  table: string, 
  inputs: Record<string, any>,
  parentId: string
): nestedResult {
  const tableValues = TableValuesMap.get(table);
  if (!tableValues) {
    throw new Error(`No table values found for table: ${table}`);
  }

  const onConflict = Object.keys(inputs).includes("onConflict") ? inputs["onConflict"] : null;
  const conflictClause = constructConflictClause(onConflict);

  inputs = inputs["data"];

  if (!Array.isArray(inputs)) {
    inputs = [inputs];
  }

  const records: string[] = [];
  const nestedInserts: string[] = [];

  for (const input of inputs as Array<Record<string, any>>) {
    const record: string[] = [];

    for (let i = 0; i < tableValues.length; i++) {
      const tableValue = tableValues[i];

      if (tableValue in input) {
        const value = input[tableValue];

        if (/ByReference/.test(tableValue) && value !== null && typeof value === "object") {
          const id = parentId.toString() + i.toString();
          const relation = tableValue.replace("ByReference", "");
          const alias = "new" + relation.charAt(0).toUpperCase() + relation.slice(1) + id;

          let { last, nesteds } = constructNestedInsertClause(schema, relation, value, id);
          last = `"${alias}" AS (${last})`;
          nestedInserts.concat(nesteds);
          nestedInserts.push(last);

          record.push(`(SELECT reference FROM "${alias}")`);

        } else if (/ByReference/.test(tableValue)) {
          continue;

        } else {
          record.push(escapeLiteral(value));

        }
      } else {
        record.push(escapeLiteral(null));
      }
    }

    records.push(`(${record.join(", ")})`);
  }

  const keys = `(${tableValues.map(value => `"${value}"`).join(", ")})`;
  const values = records.join(", ");
  const last = `INSERT INTO "${schema}"."${table}" ${keys} VALUES ${values} ${conflictClause} RETURNING *`

  return { last, nesteds: nestedInserts };
}

export function constructSingleInsertQuery(
  schema: string,
  table: string, 
  inputs: Record<string, any>
): string {
  if (typeof inputs !== "object" || !("data" in inputs) || typeof inputs["data"] !== "object" ) {
    throw new Error(`Record insertion expects data of type record, instead it received:\n${inputs}`);
  }

  const {last, nesteds} = constructNestedInsertClause(schema, table, inputs, "0");
  const nestedInserts = nesteds ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last};`;
}

export function constructBulkInsertQuery(
  schema: string,
  table: string, 
  inputs: Record<string, any>
): string {
  if (typeof inputs !== "object" || !("data" in inputs) || !Array.isArray(inputs["data"]) ) {
    throw new Error(`Bulk insertion expects data of type array of records, instead it received:\n${inputs}`);
  }

  const {last, nesteds} = constructNestedInsertClause(schema, table, inputs, "0");
  const nestedInserts = nesteds.length !== 0 ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last};`;
}

function constructNestedUpdateClause(
  schema: string,
  table: string, 
  updates: Record<string, any>,
  parentId: string
): nestedResult {
  let tableValues = TableValuesMap.get(table);
  if (!tableValues) {
    throw new Error(`No table values found for table: ${table}`);
  }
  tableValues = [...tableValues];
  tableValues.unshift("reference");
  
  updates = updates["data"];

  if (!Array.isArray(updates)) {
    updates = [updates];
  }

  const records: string[] = [];
  const nestedUpdates: string[] = [];

  for (const update of updates as Array<Record<string, any>>) {
    const record: string[] = [];

    for (let i = 0; i < tableValues.length; i++) {
      const tableValue = tableValues[i];

      if (tableValue in update) {
        const value = update[tableValue];

        if (/ByReference/.test(tableValue) && value !== null && typeof value === "object") {
          const id = parentId.toString() + i.toString();
          const relation = tableValue.replace("ByReference", "");
          const alias = "new" + relation.charAt(0).toUpperCase() + relation.slice(1) + id;

          let { last, nesteds } = constructNestedUpdateClause(schema, relation, value, id);
          last = `"${alias}" AS (${last})`;
          nestedUpdates.concat(nesteds);
          nestedUpdates.push(last);

          record.push(escapeLiteral(value["data"]["reference"]));

        } else if (/ByReference/.test(tableValue)) {
          continue;

        } else {
          record.push(escapeLiteral(value));
          
        }
      } else {
        record.push(escapeLiteral(null));
      }
    }

    records.push(`(${record.join(", ")})`);
  }

  const values = `(VALUES ${records.join(", ")})`;
  const keys = `(${tableValues.map(value => `"${value}"`).join(", ")})`;
  const definitions = tableValues.map(value => `"${value}" = "${parentId}"."${value}"`).join(", ");

  const last = `UPDATE "${schema}"."${table}" SET ${definitions} FROM ${values} AS "${parentId}"${keys} WHERE "${table}".reference = "${parentId}".reference RETURNING *`

  return { last, nesteds: nestedUpdates };
}

export function constructSingleUpdateQuery(
  schema: string,
  table: string,
  updates: Record<string, any>
): string {
  if (typeof updates !== "object" || !("data" in updates) || typeof updates["data"] !== "object" ) {
    throw new Error(`Record update expects data of type record, instead it received:\n${updates}`);
  }

  const {last, nesteds} = constructNestedUpdateClause(schema, table, updates, "0");
  const nestedInserts = nesteds.length !== 0 ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last};`;
}

export function constructBulkUpdateQuery(
  schema: string,
  table: string,
  updates: Record<string, any>
): string {
  if (typeof updates !== "object" || !("data" in updates) || !Array.isArray(updates["data"])) {
    throw new Error(`Bulk update expects data of type array of records, instead it received:\n${updates}`);
  }

  const {last, nesteds} = constructNestedUpdateClause(schema, table, updates, "0");
  const nestedInserts = nesteds.length !== 0 ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last};`;
}

function constructNestedDeleteClause(
  schema: string,
  table: string, 
  updates: Record<string, any>,
  parentId: string,
  referenceColumn: string = "reference"
): nestedResult {
  let tableValues = TableValuesMap.get(table);
  if (!tableValues) {
    throw new Error(`No table values found for table: ${table}`);
  }
  tableValues = [...tableValues];
  tableValues.unshift("reference");
  
  updates = updates["data"];

  if (!Array.isArray(updates)) {
    updates = [updates];
  }

  const records: string[] = [];
  const nestedDeletes: string[] = [];

  for (const update of updates as Array<Record<string, any>>) {
    const record: string[] = [];

    for (let i = 0; i < tableValues.length; i++) {
      const tableValue = tableValues[i];

      if (tableValue in update) {
        const value = update[tableValue];

        if (/ByReference/.test(tableValue) && value !== null && typeof value === "object") {
          const id = parentId.toString() + i.toString();
          const relation = tableValue.replace("ByReference", "");
          const alias = "new" + relation.charAt(0).toUpperCase() + relation.slice(1) + id;

          let { last, nesteds } = constructNestedUpdateClause(schema, relation, value, id);
          last = `"${alias}" AS (${last})`;
          nestedDeletes.concat(nesteds);
          nestedDeletes.push(last);

          record.push(escapeLiteral(value["data"]["reference"]));

        } else if (/ByReference/.test(tableValue)) {
          continue;

        } else {
          record.push(escapeLiteral(value));
          
        }
      } else {
        record.push(escapeLiteral(null));
      }
    }

    records.push(`(${record.join(", ")})`);
  }

  const values = `(VALUES ${records.join(", ")})`;
  const keys = `(${tableValues.map(value => `"${value}"`).join(", ")})`;

  const last = `DELETE FROM "${schema}"."${table}" USING ${values} "${parentId}"${keys} WHERE "${table}"."${referenceColumn}" = "${parentId}"."${referenceColumn}" RETURNING *`

  return { last, nesteds: nestedDeletes };
}

function constructSingleDeleteQuery(
  schema: string,
  table: string,
  deletes: Record<string, any>
): string {
  if (typeof deletes !== "object" || !("data" in deletes) || typeof deletes["data"] !== "object" ) {
    throw new Error(`Record deletion expects data of type record, instead it received:\n${deletes}`);
  }

  const {last, nesteds} = constructNestedDeleteClause(schema, table, deletes, "0");
  const nestedInserts = nesteds.length !== 0 ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last};`;
}

function constructBulkDeleteQuery(
  schema: string,
  table: string,
  deletes: Record<string, any>,
  referenceColumn: string = "reference"
): string {
  if (typeof deletes !== "object" || !("data" in deletes) || !Array.isArray(deletes["data"])) {
    throw new Error(`Bulk deletion expects data of type array of records, instead it received:\n${deletes}`);
  }

  const {last, nesteds} = constructNestedDeleteClause(schema, table, deletes, "0", referenceColumn);
  const nestedInserts = nesteds.length !== 0 ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last};`;
}

export async function buildSchema() {
  const database = process.env.DATABASE_VAJ;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;
  const user = process.env.DATABASE_ADMINISTRATOR_USER_NAME;
  const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;

  if (!database || !host || !port || !user || !password) {
    throw Error(
      "Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_DEFAULT_USER_NAME, or DATABASE_DEFAULT_USER_PASSWORD."
    );
  }

  const pgClient = await getPgClient({
    database,
    host,
    port: Number(port),
    user,
    password,
  });

  const schema = createSchema({
    typeDefs: `
            scalar JSON

            type ShopUser {
                reference: ID!
                name: String!
                birthday: String!
                email: String!
                phoneNumber: String!
                systemAuthentication: String!
                systemRole: String!
                addresses: [ShopAddress!]!
                createdAt: String!
                updatedAt: String!
                billingAddress: JSON
                shippingAddress: JSON
            }

            input ShopUserMutationInput {
                reference: ID
                name: String!
                birthday: String!
                email: String!
                phoneNumber: String!
                systemAuthentication: String!
                systemRole: String!
                createdAt: String
                updatedAt: String
                billingAddress: JSON
                shippingAddress: JSON
            }

            type ShopAddress {
                reference: ID!
                user: ID
                userByReference: ShopUser
                country: String!
                stateOrProvince: String
                city: String!
                zipCode: String!
                street: String!
                streetNumber: String!
                box: String
                shipping: Boolean!
                billing: Boolean!
                createdAt: String
                updatedAt: String
            }

            input ShopAddressMutationInput {
                reference: ID
                user: ID!
                userByReference: ShopAddressUserMutationInput!
                country: String!
                stateOrProvince: String
                city: String!
                zipCode: String!
                street: String!
                streetNumber: String!
                box: String
                shipping: Boolean!
                billing: Boolean!
                createdAt: String
                updatedAt: String
            }

            input ShopAddressUserMutationInput {
                data: ShopUserMutationInput!
                onConflict: OnConflictMutationInput
            }
            
            enum OrderDirection {
                ASC
                DESC
            }

            input ComparisonExp {
                _eq: JSON
                _neq: JSON
                _gt: JSON
                _gte: JSON
                _lt: JSON
                _lte: JSON
                _in: [JSON!]
                _nin: [JSON!]
                _hasKey: String
                _contains: JSON
            }

            input ShopUserGetWhereClause {
                reference: ComparisonExp
                name: ComparisonExp
                birthday: ComparisonExp
                email: ComparisonExp
                phoneNumber: ComparisonExp
                systemAuthentication: ComparisonExp
                systemRole: ComparisonExp
                createdAt: ComparisonExp
                updatedAt: ComparisonExp
                _and: [ShopUserGetWhereClause!]
                _or: [ShopUserGetWhereClause!]
                _not: [ShopUserGetWhereClause!]
            }

            input ShopUserGetInput {
                where: ShopUserGetWhereClause
                orderBy: ShopUserGetOrderByClause
                limit: Int
                offset: Int
            }

            input ShopAddressGetWhereClause {
                reference: ComparisonExp
                user: ComparisonExp
                userByReference: ShopUserGetInput
                country: ComparisonExp
                stateOrProvince: ComparisonExp
                city: ComparisonExp
                zipCode: ComparisonExp
                street: ComparisonExp
                streetNumber: ComparisonExp
                box: ComparisonExp
                shipping: ComparisonExp
                billing: ComparisonExp
                createdAt: ComparisonExp
                updatedAt: ComparisonExp
                _and: [ShopAddressGetWhereClause!]
                _or: [ShopAddressGetWhereClause!]
                _not: [ShopAddressGetWhereClause!]
            }

            input ShopUserGetOrderByClause {
                reference: OrderDirection
                name: OrderDirection
                birthday: OrderDirection
                email: OrderDirection
                phoneNumber: OrderDirection
                systemAuthentication: OrderDirection
                systemRole: OrderDirection
                createdAt: OrderDirection
                updatedAt: OrderDirection
            }

            input ShopAddressGetOrderByClause {
                reference: OrderDirection
                user: OrderDirection
                country: OrderDirection
                stateOrProvince: OrderDirection
                city: OrderDirection
                zipCode: OrderDirection
                street: OrderDirection
                streetNumber: OrderDirection
                box: OrderDirection
                shipping: OrderDirection
                billing: OrderDirection
                createdAt: OrderDirection
                updatedAt: OrderDirection
            }

            input OnConflictMutationInput {
                constraint: String!
                columns: [String]!
            }
            
            type ShopArticleBrandEnum {
                articleBrand: String
            }

            input ShopArticleBrandEnumMutationInput {
                articleBrand: String
            }

            type Query {
                getShopUserByReference(reference: ID!): ShopUser
                getShopAddressByReference(reference: ID!): ShopAddress
                getShopUsers(where: ShopUserGetWhereClause, orderBy: [ShopUserGetOrderByClause!], limit: Int, offset: Int): [ShopUser!]!
                getShopAddresses(where: ShopAddressGetWhereClause, orderBy: [ShopAddressGetOrderByClause!], limit: Int, offset: Int): [ShopAddress!]!
                getShopArticleBrandEnum: [ShopArticleBrandEnum!]!
            }

            type Mutation {
                insertShopUser(data: ShopUserMutationInput!, onConflict: OnConflictMutationInput): ShopUser!
                insertShopUsers(data: [ShopUserMutationInput!]!, onConflict: OnConflictMutationInput): [ShopUser!]!
                insertShopAddress(data: ShopAddressMutationInput!, onConflict: OnConflictMutationInput): ShopAddress!
                insertShopAddresses(data: [ShopAddressMutationInput!]!, onConflict: OnConflictMutationInput): [ShopAddress!]!
                insertShopArticleBrandEnum(data: [ShopArticleBrandEnumMutationInput!]!): [ShopArticleBrandEnum!]!
                updateShopUser(data: ShopUserMutationInput!): ShopUser!
                updateShopUsers(data: [ShopUserMutationInput!]!): [ShopUser!]!
                updateShopAddress(data: ShopAddressMutationInput!): ShopAddress!
                updateShopAddresses(data: [ShopAddressMutationInput!]!): [ShopAddress!]!
                deleteShopUser(data: ShopUserMutationInput!): ShopUser!
                deleteShopUsers(data: [ShopUserMutationInput!]!): [ShopUser!]!
                deleteShopAddress(data: ShopAddressMutationInput!): ShopAddress!
                deleteShopAddresses(data: [ShopAddressMutationInput!]!): [ShopAddress!]!
                deleteShopArticleBrandEnum(data: [ShopArticleBrandEnumMutationInput!]!): [ShopArticleBrandEnum!]!
            }
        `,

    resolvers: {
      Query: {
        getShopUsers: async (_, { where, orderBy, limit, offset }) => {
          const schema = "shop";
          const table = "user";
          
          const query = constructGetQuery(schema, table, where, orderBy, limit, offset);

          const res = await pgClient.query(query);
          return res.rows;
        },

        getShopAddresses: async (_, { where, orderBy, limit, offset }) => {
          const schema = "shop";
          const table = "address";

          const query = constructGetQuery(schema, table, where, orderBy, limit, offset);

          const res = await pgClient.query(query);
          return res.rows;
        },
        getShopArticleBrandEnum: async (_) => {
          const schema = "shop";
          const table = "articleBrandEnum";

          const query = constructGetQuery(schema, table);
          
          const res = await pgClient.query(query);
          return res.rows;
        },
        getShopUserByReference: async (_, { reference }) => {
          const schema = "shop";
          const table = "user"

          const query = constructGetByReferenceQuery(schema, table, reference);

          const res = await pgClient.query(query);
          return res.rows[0];
        },

        getShopAddressByReference: async (_, { reference }) => {
          const schema = "shop";
          const table = "address"

          const query = constructGetByReferenceQuery(schema, table, reference);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
      },

      Mutation: {
        insertShopUser: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "user";
            const inputs = { data, onConflict };

            const query = constructSingleInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows[0];
        },
        insertShopUsers: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "user";
            const inputs = { data, onConflict };

            const query = constructBulkInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows;
        },
        insertShopAddress: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "address";
            const inputs = {data, onConflict}

            const query = constructSingleInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows[0];
        },
        insertShopAddresses: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "address";
            const inputs = {data, onConflict}

            const query = constructBulkInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows;
        },
        insertShopArticleBrandEnum: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "articleBrandEnum";
          const inputs = {data};

          const query = constructBulkInsertQuery(schema, table, inputs);

          const res = await pgClient.query(query);
          return res.rows;
        },
        updateShopUser: async (_, { data }) => {
          const schema = "shop";
          const table = "user";
          const updates = { data };

          const query = constructSingleUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        updateShopUsers: async (_, { data }) => {
          const schema = "shop";
          const table = "user";
          const updates = { data };

          const query = constructBulkUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows;
        },
        updateShopAddress: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const updates = { data };

          const query = constructSingleUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        updateShopAddresses: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const updates = { data };

          const query = constructBulkUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows;
        },
        deleteShopUser: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "user";
          const deletes = { data };

          const query = constructSingleDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        deleteShopUsers: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "user";
          const deletes = { data };
          
          const query = constructBulkDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows;
        },
        deleteShopAddress: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const deletes = { data };

          const query = constructSingleDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        deleteShopAddresses: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const deletes = { data };

          const query = constructBulkDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows;
        },
        deleteShopArticleBrandEnum: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "articleBrandEnum";
          const deletes = {data};
          const referenceColumn = "articleBrand"

          const query = constructBulkDeleteQuery(schema, table, deletes, referenceColumn);

          const res = await pgClient.query(query);
          return res.rows;
        },
      },

      ShopUser: {
        addresses: async (parent) => {
          const schema = "shop";
          const table = "address";
          const column = "user";

          const query = constructGetRelationalQuery(schema, table, column, parent.reference);

          const res = await pgClient.query(query)
          return res.rows[0] ?? null;
        },
        billingAddress: async (parent) => {
          const schema = "shop";
          const table = "user";
          const fn = "userBillingAddress";

          const query = constructGetComputationalFieldQuery(schema, table, fn, parent.reference);

          const res = await pgClient.query(query);
          return res.rows[0] ?? null;
        },
        shippingAddress: async (parent) => {
          const schema = "shop";
          const table = "user";
          const fn = "userShippingAddress"

          const query = constructGetComputationalFieldQuery(schema, table, fn, parent.reference);

          const res = await pgClient.query(query);
          return res.rows[0] ?? null;
        }
      },

      ShopAddress: {
        userByReference: async (parent) => {
          const schema = "shop";
          const table = "user";
          const column = "reference";

          const query = constructGetRelationalQuery(schema, table, column, parent.user);

          const res = await pgClient.query(query);
          return res.rows[0] || null;
        },
      },
    },
  });

  return schema;
}
