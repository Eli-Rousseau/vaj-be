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
    let offsetClause = ""
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
  alias: string,
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

    clauses.push(
      `${alias}.${toSnakeCase(field)} ${upperDirection}`
    );
  }

  if (clauses.length === 0) return "";

  return `ORDER BY ${clauses.join(", ")}`;
}


function constructWhereClause() {

}

export async function buildSchema() {
    const database = process.env.DATABASE_VAJ;
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT;
    const user = process.env.DATABASE_DEFAULT_USER_NAME;
    const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;

    if (!database || !host || !port || !user || !password) {
        throw Error("Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_DEFAULT_USER_NAME, or DATABASE_DEFAULT_USER_PASSWORD.");
    }

    const pgClient = await getPgClient({
        database,
        host,
        port: Number(port),
        user,
        password
    })

    const schema = createSchema({
        typeDefs: `
            type User {
                reference: ID!
                name: String!
                birthday: String!
                email: String!
                phone_number: String!
                system_authentication: String!
                system_role: String!
                addresses: [Address!]!
            }

            type Address {
                reference: ID!
                user: User
                country: String!
                state_or_province: String
                city: String!
                zip_code: String!
                street: String!
                street_number: String!
                box: String
                shipping: Boolean!
                billing: Boolean!
                created_at: String!
                updated_at: String!
            }
            
            enum OrderDirection {
                ASC
                DESC
            }

            input UserOrderBy {
                reference: OrderDirection
                name: OrderDirection
                birthday: OrderDirection
                email: OrderDirection
                phone_number: OrderDirection
                system_authentication: OrderDirection
                system_role: OrderDirection
            }

            type Query {
                getUsers(orderBy: [UserOrderBy!], limit: Int, offset: Int): [User!]!
                getAddresses: [Address!]!
                getUserByReference(reference: ID!): User
                getAddressByReference(reference: ID!): Address
            }
        `,

        resolvers: {
            Query: {
            getUsers: async (_, { orderBy, limit, offset }) => {
                const alias = "_user";
                const orderByClause = constructOrderByClause(alias, orderBy);
                const limitClause = constructLimitClause(limit);
                const offsetClause = constructOffsetClause(offset);

                const res = await pgClient.query(
                `
                SELECT * 
                FROM shop.user AS ${alias}
                ${orderByClause}
                ${limitClause}
                ${offsetClause}
                ;`
                );
                return res.rows;
            },

            getAddresses: async (limit?: number) => {
                const res = await pgClient.query(
                `
                SELECT * FROM 
                shop.address
                ORDER BY ad.created_at DESC
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
            }
            },

            User: {
            addresses: async (parent) => {
                const res = await pgClient.query(
                `SELECT * FROM shop.address WHERE "user" = $1;`,
                [parent.reference]
                );
                return res.rows;
            }
            },

            Address: {
            user: async (parent) => {
                if (!parent.user) return null;
                const res = await pgClient.query(
                `SELECT * FROM shop.user WHERE reference = $1;`,
                [parent.user]
                );
                return res.rows[0] || null;
            }
            }
        }
        }
    );

    return schema;
}