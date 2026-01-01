import { TableValuesMap } from "./definitions";

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
  orderBy?: Record<string, string>[]
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

type NestedWhereResult = {
  nestedJoins: string;
  nestedWheres: string;
};

function jsonPathFromDot(path: string): string {
  return "$." + path.split(".").join(".");
}

function constructJSONPath(contains: object, path: string) {
  const entries = Object.entries(contains);
  if (entries.length !== 1) return "";

  const [key, value] = entries[0];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === undefined || value === null) {
    path = path + ` ->> '${key}' = ${escapeLiteral(value)}`
    return path;
  } else if (typeof value === "object") {
    path = path + ` -> '${key}'`;
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

function constructWhereClause(
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
  orderBy?: Record<string, string>[],
  limit?: number,
  offset?: number
): string {
  const whereClause = constructWhereClause(schema, table, where);
  const orderByClause = constructOrderByClause(table, orderBy);
  const limitClause = constructLimitClause(limit);
  const offsetClause = constructOffsetClause(offset);

  const query = `SELECT * FROM "${schema}"."${table}" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause} ;`;
  return query;
}

export function constructGetOnColumnQuery(
  schema: string, 
  table: string,
  column: string,
  reference: string
): string {
  const query = `SELECT * FROM "${schema}"."${table}" WHERE "${column}" = ${escapeLiteral(reference)} ;`
  return query;
}

export function constructGetComputationalFieldQuery(
  schema: string, 
  table: string,
  fn: string,
  reference: string
): string {
  const query = `SELECT ("${schema}"."${fn}"("${table}")).* FROM "${schema}"."${table}" WHERE "${table}"."reference" = ${escapeLiteral(reference)} ;`
  return query;
}

type nestedResult = {
  last: string,
  nesteds: string[]
}

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

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const record: string[] = [];

    for (let j = 0; j < tableValues.length; j++) {
      const tableValue = tableValues[j];

      if (tableValue in input) {
        const value = input[tableValue];

        if (/ByReference/.test(tableValue) && value !== null && typeof value === "object") {
          const id = parentId.toString() + i.toString() + j.toString();
          const relation = tableValue.replace("ByReference", "");
          const alias = "new" + relation.charAt(0).toUpperCase() + relation.slice(1) + id;

          let { last, nesteds } = constructNestedInsertClause(schema, relation, value, id);
          last = `"${alias}" AS (${last})`;
          nestedInserts.concat(nesteds);
          nestedInserts.push(last);

          record.push(`(SELECT "reference" FROM "${alias}")`);

        } else if (!/ByReference/.test(tableValue)) {
          record.push(escapeLiteral(value));
        }
      
      } else if (!/ByReference/.test(tableValue) && !Object.keys(input).includes((tableValue + `ByReference`))) {
        record.push(escapeLiteral(null));
      }
    }

    records.push(`(${record.join(", ")})`);
  }

  const keys = `(${tableValues.filter(value => !/ByReference/.test(value)).map(value => `"${value}"`).join(", ")})`;
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

  return `${nestedInserts} ${last} ;`;
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

  return `${nestedInserts} ${last} ;`;
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

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    const record: string[] = [];

    for (let j = 0; j < tableValues.length; j++) {
      const tableValue = tableValues[j];

      if (tableValue in update) {
        const value = update[tableValue];

        if (/ByReference/.test(tableValue) && value !== null && typeof value === "object") {
          const id = parentId.toString() + i.toString() + j.toString();
          const relation = tableValue.replace("ByReference", "");
          const alias = "new" + relation.charAt(0).toUpperCase() + relation.slice(1) + id;

          let { last, nesteds } = constructNestedUpdateClause(schema, relation, value, id);
          last = `"${alias}" AS (${last})`;
          nestedUpdates.concat(nesteds);
          nestedUpdates.push(last);

          record.push(escapeLiteral(value["data"]["reference"]));

        } else if (!/ByReference/.test(tableValue)) {
          record.push(escapeLiteral(value));
        }
      
      } else if (!/ByReference/.test(tableValue) && !Object.keys(update).includes((tableValue + `ByReference`))) {
        record.push(escapeLiteral(null));
      }
    }

    records.push(`(${record.join(", ")})`);
  }

  const values = `(VALUES ${records.join(", ")})`;
  const tableValuesWithNoByReference = tableValues.filter(value => !/ByReference/.test(value));
  const keys = `(${tableValuesWithNoByReference.map(value => `"${value}"`).join(", ")})`;
  const definitions = tableValuesWithNoByReference.map(value => `"${value}" = "${parentId}"."${value}"`).join(", ");

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

  return `${nestedInserts} ${last} ;`;
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

  return `${nestedInserts} ${last} ;`;
}

function constructNestedDeleteClause(
  schema: string,
  table: string, 
  deletes: Record<string, any>,
  parentId: string,
  referenceColumn: string = "reference"
): nestedResult {
  let tableValues = TableValuesMap.get(table);
  if (!tableValues) {
    throw new Error(`No table values found for table: ${table}`);
  }
  tableValues = [...tableValues];
  tableValues.unshift("reference");
  
  deletes = deletes["data"];

  if (!Array.isArray(deletes)) {
    deletes = [deletes];
  }

  const records: string[] = [];
  const nestedDeletes: string[] = [];

  for (let i = 0; i < deletes.length; i++) {
    const _delete = deletes[i];
    const record: string[] = [];

    for (let j = 0; j < tableValues.length; j++) {
      const tableValue = tableValues[j];

      if (tableValue in _delete) {
        const value = _delete[tableValue];

        if (/ByReference/.test(tableValue) && value !== null && typeof value === "object") {
          const id = parentId.toString() + i.toString() + j.toString();
          const relation = tableValue.replace("ByReference", "");
          const alias = "new" + relation.charAt(0).toUpperCase() + relation.slice(1) + id;

          let { last, nesteds } = constructNestedDeleteClause(schema, relation, value, id);
          last = `"${alias}" AS (${last})`;
          nestedDeletes.concat(nesteds);
          nestedDeletes.push(last);

          record.push(escapeLiteral(value["data"]["reference"]));

        } else if (!/ByReference/.test(tableValue)) {
          record.push(escapeLiteral(value));
        }
      
      } else if (!/ByReference/.test(tableValue) && !Object.keys(_delete).includes((tableValue + `ByReference`))) {
        record.push(escapeLiteral(null));
      }
    }

    records.push(`(${record.join(", ")})`);
  }

  const values = `(VALUES ${records.join(", ")})`;
  const keys = `(${tableValues.filter(value => !/ByReference/.test(value)).map(value => `"${value}"`).join(", ")})`;

  const last = `DELETE FROM "${schema}"."${table}" USING ${values} "${parentId}"${keys} WHERE "${table}"."${referenceColumn}" = "${parentId}"."${referenceColumn}" RETURNING *`

  return { last, nesteds: nestedDeletes };
}

export function constructSingleDeleteQuery(
  schema: string,
  table: string,
  deletes: Record<string, any>
): string {
  if (typeof deletes !== "object" || !("data" in deletes) || typeof deletes["data"] !== "object" ) {
    throw new Error(`Record deletion expects data of type record, instead it received:\n${deletes}`);
  }

  const {last, nesteds} = constructNestedDeleteClause(schema, table, deletes, "0");
  const nestedInserts = nesteds.length !== 0 ? `WITH ${nesteds.join(", ")}` : "";

  return `${nestedInserts} ${last} ;`;
}

export function constructBulkDeleteQuery(
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

  return `${nestedInserts} ${last} ;`;
}
