import { getPgClient } from "../utils/database";
import { createSchema } from "graphql-yoga";
import * as constructors from "./schema/constructors";

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

function cleanSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
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
                user: ID
                userByReference: ShopAddressUserMutationInput
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
          
          const query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);

          const res = await pgClient.query(query);
          return res.rows;
        },

        getShopAddresses: async (_, { where, orderBy, limit, offset }) => {
          const schema = "shop";
          const table = "address";

          const query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);

          const res = await pgClient.query(query);
          return res.rows;
        },
        getShopArticleBrandEnum: async (_) => {
          const schema = "shop";
          const table = "articleBrandEnum";

          const query = constructors.constructGetQuery(schema, table);
          
          const res = await pgClient.query(query);
          return res.rows;
        },
        getShopUserByReference: async (_, { reference }) => {
          const schema = "shop";
          const table = "user";
          const column = "reference";

          const query = constructors.constructGetOnColumnQuery(schema, table, column, reference);

          const res = await pgClient.query(query);
          return res.rows[0];
        },

        getShopAddressByReference: async (_, { reference }) => {
          const schema = "shop";
          const table = "address"
          const column = "reference";

          const query = constructors.constructGetOnColumnQuery(schema, table, column, reference);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
      },

      Mutation: {
        insertShopUser: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "user";
            const inputs = { data, onConflict };

            const query = constructors.constructSingleInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows[0];
        },
        insertShopUsers: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "user";
            const inputs = { data, onConflict };

            const query = constructors.constructBulkInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows;
        },
        insertShopAddress: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "address";
            const inputs = {data, onConflict}

            const query = constructors.constructSingleInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows[0];
        },
        insertShopAddresses: async (_, {data, onConflict}) => {
            const schema = "shop";
            const table = "address";
            const inputs = {data, onConflict}

            const query = constructors.constructBulkInsertQuery(schema, table, inputs);

            const res = await pgClient.query(query);
            return res.rows;
        },
        insertShopArticleBrandEnum: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "articleBrandEnum";
          const inputs = {data};

          const query = constructors.constructBulkInsertQuery(schema, table, inputs);

          const res = await pgClient.query(query);
          return res.rows;
        },
        updateShopUser: async (_, { data }) => {
          const schema = "shop";
          const table = "user";
          const updates = { data };

          const query = constructors.constructSingleUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        updateShopUsers: async (_, { data }) => {
          const schema = "shop";
          const table = "user";
          const updates = { data };

          const query = constructors.constructBulkUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows;
        },
        updateShopAddress: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const updates = { data };

          const query = constructors.constructSingleUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        updateShopAddresses: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const updates = { data };

          const query = constructors.constructBulkUpdateQuery(schema, table, updates);

          const res = await pgClient.query(query);
          return res.rows;
        },
        deleteShopUser: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "user";
          const deletes = { data };

          const query = constructors.constructSingleDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        deleteShopUsers: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "user";
          const deletes = { data };
          
          const query = constructors.constructBulkDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows;
        },
        deleteShopAddress: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const deletes = { data };

          const query = constructors.constructSingleDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows[0];
        },
        deleteShopAddresses: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "address";
          const deletes = { data };

          const query = constructors.constructBulkDeleteQuery(schema, table, deletes);

          const res = await pgClient.query(query);
          return res.rows;
        },
        deleteShopArticleBrandEnum: async (__dirname, { data }) => {
          const schema = "shop";
          const table = "articleBrandEnum";
          const deletes = {data};
          const referenceColumn = "articleBrand"

          const query = constructors.constructBulkDeleteQuery(schema, table, deletes, referenceColumn);

          const res = await pgClient.query(query);
          return res.rows;
        },
      },

      ShopUser: {
        addresses: async (parent) => {
          const schema = "shop";
          const table = "address";
          const column = "user";

          const query = constructors.constructGetOnColumnQuery(schema, table, column, parent.reference);

          const res = await pgClient.query(query)
          return res.rows[0] ?? null;
        },
        billingAddress: async (parent) => {
          const schema = "shop";
          const table = "user";
          const fn = "userBillingAddress";

          const query = constructors.constructGetComputationalFieldQuery(schema, table, fn, parent.reference);

          const res = await pgClient.query(query);
          return res.rows[0] ?? null;
        },
        shippingAddress: async (parent) => {
          const schema = "shop";
          const table = "user";
          const fn = "userShippingAddress"

          const query = constructors.constructGetComputationalFieldQuery(schema, table, fn, parent.reference);

          const res = await pgClient.query(query);
          return res.rows[0] ?? null;
        }
      },

      ShopAddress: {
        userByReference: async (parent) => {
          const schema = "shop";
          const table = "user";
          const column = "reference";

          const query = constructors.constructGetOnColumnQuery(schema, table, column, parent.user);

          const res = await pgClient.query(query);
          return res.rows[0] || null;
        },
      },
    },
  });

  return schema;
}
