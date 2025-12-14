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

function toSnakeCase(name: string): string {
  if (!name) return "";

  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
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

    clauses.push(`"${table}".${field} ${upperDirection}`);
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

type WhereInput = Record<string, Partial<Record<Operator, any>>>;

function escapeLiteral(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "boolean")
    return value.toString();
  return `'${String(value).replace(/'/g, "''")}'`;
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
        `JOIN shop.${relation} ON "${relation}".reference = "${table}".${relation}`
      );

      const { nestedJoins, nestedWheres } = constructNestedWhereClause(
        relation,
        nestedWhere
      );
      joins = joins.concat(nestedJoins);
      wheres = wheres.concat(nestedWheres);
      continue;
    } else if (column === "_and") {
      const conditionalWheres: string[] = [];
      if (Array.isArray(expression)) {
        for (const nestedWhere of expression) {
          const nestedWhereResult = constructNestedWhereClause(
            table,
            nestedWhere
          );
          conditionalWheres.push(nestedWhereResult["nestedWheres"]);
          joins.push(nestedWhereResult["nestedJoins"]);
        }
      }
      wheres.push(`(${conditionalWheres.join(" AND ")})`);
    } else if (column === "_or") {
      const conditionalWheres: string[] = [];
      if (Array.isArray(expression)) {
        for (const nestedWhere of expression) {
          const nestedWhereResult = constructNestedWhereClause(
            table,
            nestedWhere
          );
          conditionalWheres.push(nestedWhereResult["nestedWheres"]);
          joins.push(nestedWhereResult["nestedJoins"]);
        }
      }
      wheres.push(`(${conditionalWheres.join(" OR ")})`);
    } else if (column === "_not") {
      const conditionalWheres: string[] = [];
      if (Array.isArray(expression)) {
        for (const nestedWhere of expression) {
          const nestedWhereResult = constructNestedWhereClause(
            table,
            nestedWhere
          );
          conditionalWheres.push(nestedWhereResult["nestedWheres"]);
          joins.push(nestedWhereResult["nestedJoins"]);
        }
      }
      wheres.push(`NOT (${conditionalWheres.join(" AND ")})`);
    } else {
      for (const [operator, value] of Object.entries(expression)) {
        const col = `"${table}".${column}`;

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
            wheres.push(`${col} IN (${value.map(escapeLiteral).join(", ")})`);
          }
        } else if (operator === "_nin") {
          if (Array.isArray(value) && value.length) {
            wheres.push(
              `${col} NOT IN (${value.map(escapeLiteral).join(", ")})`
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
  table: string,
  where?: WhereInput
): string {
  if (!where || Object.keys(where).length === 0) return "";

  const { nestedJoins: joins, nestedWheres: wheres } =
    constructNestedWhereClause(table, where);

  if (!wheres) return "";
  return `${joins} WHERE ${wheres}`;
}

export async function buildSchema() {
  const database = process.env.DATABASE_VAJ;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;
  const user = process.env.DATABASE_DEFAULT_USER_NAME;
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

            type User {
                reference: ID!
                name: String!
                birthday: String!
                email: String!
                phoneNumber: String!
                systemAuthentication: String!
                systemRole: String!
                addresses: [Address!]!
                createdAt: String!
                updatedAt: String!
            }

            type Address {
                reference: ID!
                user: User
                country: String!
                stateOrProvince: String
                city: String!
                zipCode: String!
                street: String!
                streetNumber: String!
                box: String
                shipping: Boolean!
                billing: Boolean!
                createdAt: String!
                updatedAt: String!
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

            input UserWhere {
                reference: ComparisonExp
                name: ComparisonExp
                birthday: ComparisonExp
                email: ComparisonExp
                phoneNumber: ComparisonExp
                systemAuthentication: ComparisonExp
                systemRole: ComparisonExp
                createdAt: ComparisonExp
                updatedAt: ComparisonExp
                _and: [UserWhere!]
                _or: [UserWhere!]
                _not: [UserWhere!]
            }

            input UserInput {
                where: UserWhere
                orderBy: UserOrderBy
                limit: Int
                offset: Int
            }

            input AddressWhere {
                reference: ComparisonExp
                user: ComparisonExp
                userByReference: UserInput
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
                _and: [AddressWhere!]
                _or: [AddressWhere!]
                _not: [AddressWhere!]
            }

            input UserOrderBy {
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

            input AddressOrderBy {
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

            type Query {
                getUsers(where: UserWhere, orderBy: [UserOrderBy!], limit: Int, offset: Int): [User!]!
                getAddresses(where: AddressWhere, orderBy: [AddressOrderBy!], limit: Int, offset: Int): [Address!]!
                getUserByReference(reference: ID!): User
                getAddressByReference(reference: ID!): Address
            }
        `,

    resolvers: {
      Query: {
        getUsers: async (_, { where, orderBy, limit, offset }) => {
          const table = "user";
          const whereClause = constructWhereClause(table, where);
          const orderByClause = constructOrderByClause(table, orderBy);
          const limitClause = constructLimitClause(limit);
          const offsetClause = constructOffsetClause(offset);

          const query = `
                SELECT *
                FROM shop.${table}
                ${whereClause}
                ${orderByClause}
                ${limitClause}
                ${offsetClause}
                ;
            `
          console.log(query);

          const res = await pgClient.query(
            `
                SELECT *
                FROM shop.${table}
                ${whereClause}
                ${orderByClause}
                ${limitClause}
                ${offsetClause}
                ;
            `
          );
          return res.rows;
        },

        getAddresses: async (_, { where, orderBy, limit, offset }) => {
          const table = "address";
          const whereClause = constructWhereClause(table, where);
          const orderByClause = constructOrderByClause(table, orderBy);
          const limitClause = constructLimitClause(limit);
          const offsetClause = constructOffsetClause(offset);
          
          const res = await pgClient.query(
            `
                SELECT * 
                FROM shop.${table}
                ${whereClause}
                ${orderByClause}
                ${limitClause}
                ${offsetClause}
                ;
            `
          );
          return res.rows;
        },

        getUserByReference: async (_, { reference }) => {
          const res = await pgClient.query(
            `SELECT * FROM shop.user WHERE reference = $1;`,
            [reference]
          );
          return res.rows[0] || null;
        },

        getAddressByReference: async (_, { reference }) => {
          const res = await pgClient.query(
            `SELECT * FROM shop.address WHERE reference = $1;`,
            [reference]
          );
          return res.rows[0] || null;
        },
      },

      User: {
        addresses: async (parent) => {
          const res = await pgClient.query(
            `SELECT * FROM shop.address WHERE "user" = $1;`,
            [parent.reference]
          );
          return res.rows;
        },
      },

      Address: {
        user: async (parent) => {
          if (!parent.user) return null;
          const res = await pgClient.query(
            `SELECT * FROM shop.user WHERE reference = $1;`,
            [parent.user]
          );
          return res.rows[0] || null;
        },
      },
    },
  });

  return schema;
}
