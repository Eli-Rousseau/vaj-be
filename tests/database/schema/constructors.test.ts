// import { describe, it, expect } from "vitest";
// import * as constructors from "../../../src/database/schema/constructors";

// function cleanSpaces(text: string): string {
//   return text.replace(/\s+/g, " ").trim();
// }

// describe("construct get SQL query", () => {
//   it("with equal comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { name: { _eq: "Eli" } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."name" = 'Eli' ;`;

//     expect(query).toBe(expected);
//   });

//   it("with non equal comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { name: { _neq: "Eli" } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."name" <> 'Eli' ;`;

//     expect(query).toBe(expected);
//   });

//   it("with greater than comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { age: { _gt: 10 } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."age" > 10 ;`;

//     expect(query).toBe(expected);
//   });

//   it("with greater than or equal comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { age: { _gte: 10 } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."age" >= 10 ;`;

//     expect(query).toBe(expected);
//   });

//   it("with smaller than comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { age: { _lt: 10 } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."age" < 10 ;`;

//     expect(query).toBe(expected);
//   });

//   it("with smaller than or equal comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { age: { _lte: 10 } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."age" <= 10 ;`;

//     expect(query).toBe(expected);
//   });

//   it("with in comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { age: { _in: [10, 20, 30] } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."age" IN (10, 20, 30) ;`;

//     expect(query).toBe(expected);
//   });

//   it("with not in comparison", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { age: { _nin: [10, 20, 30] } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE "user"."age" NOT IN (10, 20, 30) ;`;

//     expect(query).toBe(expected);
//   });

//   it("with has key comparison", () => {
//     const schema = "shop";
//     const table = "article";
//     const where = { media: { _hasKey: "pictures[*].name" } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."article" WHERE jsonb_path_exists("article"."media", '$.pictures[*].name') ;`;

//     expect(query).toBe(expected);
//   });

//   it("with contains comparison", () => {
//     const schema = "shop";
//     const table = "article";
//     const where = { media: { _contains: { "pictures": { "name": "myName" } } } };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."article" WHERE "article"."media" -> 'pictures' ->> 'name' = 'myName' ;`;

//     expect(query).toBe(expected);
//   });

//   it("with and logical AND operator", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { _and: [
//         { name: { _eq: "Eli" } },
//         { age: { _in: [10, 20, 30] } }
//     ] };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE ("user"."name" = 'Eli' AND "user"."age" IN (10, 20, 30)) ;`;

//     expect(query).toBe(expected);
//   });

//   it("with and logical OR operator", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { _or: [
//         { name: { _eq: "Eli" } },
//         { age: { _in: [10, 20, 30] } }
//     ] };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE ("user"."name" = 'Eli' OR "user"."age" IN (10, 20, 30)) ;`;

//     expect(query).toBe(expected);
//   });

//   it("with and logical NOT operator", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = { _not: [
//         { name: { _eq: "Eli" } }
//     ] };
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" WHERE NOT ("user"."name" = 'Eli') ;`;

//     expect(query).toBe(expected);
//   });

//   it("with order by clause", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = undefined;
//     const orderBy = [{ name: "ASC" }, { age: "DESC" }] as Record<string, string>[];
//     const limit = undefined;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" ORDER BY "user"."name" ASC, "user"."age" DESC ;`;

//     expect(query).toBe(expected);
//   });

//   it("with limit clause", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = undefined;
//     const orderBy = undefined;
//     const limit = 10;
//     const offset = undefined;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" LIMIT 10 ;`;

//     expect(query).toBe(expected);
//   });

//   it("with offset clause", () => {
//     const schema = "shop";
//     const table = "user";
//     const where = undefined;
//     const orderBy = undefined;
//     const limit = undefined;
//     const offset = 10;

//     let query = constructors.constructGetQuery(schema, table, where, orderBy, limit, offset);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."user" OFFSET 10 ;`;

//     expect(query).toBe(expected);
//   });

//   it("on column", () => {
//     const schema = "shop";
//     const table = "address";
//     const column = "reference";
//     const reference = "1";

//     let query = constructors.constructGetOnColumnQuery(schema, table, column, reference);
//     query = cleanSpaces(query);

//     const expected = `SELECT * FROM "shop"."address" WHERE "reference" = '1' ;`;

//     expect(query).toBe(expected);
//   });

//   it("for computational field", () => {
//     const schema = "shop";
//     const table = "user";
//     const fn = "userBillingAddress";
//     const reference = "1";

//     let query = constructors.constructGetComputationalFieldQuery(schema, table, fn, reference);
//     query = cleanSpaces(query);

//     const expected = `SELECT ("shop"."userBillingAddress"("user")).* FROM "shop"."user" WHERE "user"."reference" = '1' ;`;

//     expect(query).toBe(expected);
//   });
// });

// describe("construct insert SQL query", () => {
//     it("for single record", () => {
//         const schema = "shop";
//         const table = "address";
//         const inserts = {
//             data: {
//                 country: "Belgium",
//                 stateOrProvince: "Antwerpen",
//                 city: "Turnhout",
//                 zipCode: "6690",
//                 street: "Nagelstraat",
//                 streetNumber: "12",
//                 box: "H",
//                 shipping: true,
//                 billing: false,
//                 userByReference: {
//                     data: {
//                         name: "Eli",
//                         email: "eli@vaj.com",
//                         birthday: "2000-01-01",
//                         phoneNumber: "0937393719",
//                         systemRole: "ADMINISTRATOR",
//                         systemAuthentication: "INTERN"
//                     },
//                     onConflict:  {
//                         constraint: "userEmailKey",
//                         columns: ["name", "birthday", "phoneNumber"]
//                     }
//                 }
//             }
//         };

//         let query = constructors.constructSingleInsertQuery(schema, table, inserts);
//         query = cleanSpaces(query);

//         const expected = `WITH "newUser001" AS (INSERT INTO "shop"."user" ("name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") VALUES ('Eli', '2000-01-01', 'eli@vaj.com', '0937393719', NULL, NULL, 'INTERN', 'ADMINISTRATOR') ON CONFLICT ON CONSTRAINT "userEmailKey" DO UPDATE SET "name" = EXCLUDED."name", "birthday" = EXCLUDED."birthday", "phoneNumber" = EXCLUDED."phoneNumber" RETURNING *) INSERT INTO "shop"."address" ("user", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing") VALUES ((SELECT "reference" FROM "newUser001"), 'Belgium', 'Antwerpen', 'Turnhout', '6690', 'Nagelstraat', '12', 'H', true, false) RETURNING * ;`;
        
//         expect(query).toBe(expected);
//     });

//     it("for bulk records", () => {
//         const schema = "shop";
//         const table = "address";
//         const inserts = {
//             data: [
//                 {
//                     country: "Belgium",
//                     stateOrProvince: "Antwerpen",
//                     city: "Turnhout",
//                     zipCode: "2300",
//                     street: "Nagelstraat",
//                     streetNumber: "12",
//                     box: "H",
//                     shipping: true,
//                     billing: false,
//                     userByReference: {
//                     data: {
//                         name: "Eli",
//                         email: "eli@vaj.com",
//                         birthday: "2000-01-01",
//                         phoneNumber: "0937393719",
//                         systemRole: "ADMINISTRATOR",
//                         systemAuthentication: "INTERN"
//                     },
//                     onConflict: {
//                         constraint: "userEmailKey",
//                         columns: ["name", "birthday", "phoneNumber"]
//                     }
//                     }
//                 },
//                 {
//                     country: "Belgium",
//                     stateOrProvince: "Vlaams-Brabant",
//                     city: "Leuven",
//                     zipCode: "3000",
//                     street: "Bondgenotenlaan",
//                     streetNumber: "45",
//                     box: null,
//                     shipping: false,
//                     billing: true,
//                     userByReference: {
//                     data: {
//                         name: "Suzan",
//                         email: "suzan@vaj.com",
//                         birthday: "1985-09-12",
//                         phoneNumber: "0478123456",
//                         systemRole: "USER",
//                         systemAuthentication: "GOOGLE"
//                     },
//                     onConflict: {
//                         constraint: "userEmailKey",
//                         columns: ["name", "birthday", "phoneNumber"]
//                     }
//                     }
//                 },
//                 {
//                     country: "Belgium",
//                     stateOrProvince: "Oost-Vlaanderen",
//                     city: "Gent",
//                     zipCode: "9000",
//                     street: "Veldstraat",
//                     streetNumber: "101",
//                     box: "3B",
//                     shipping: true,
//                     billing: true,
//                     user: "178aca1d-ff58-4abe-845b-0a971095b005"
//                 }
//             ]
//         };

//         let query = constructors.constructSingleInsertQuery(schema, table, inserts);
//         query = cleanSpaces(query);

//         const expected = `WITH "newUser001" AS (INSERT INTO "shop"."user" ("name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") VALUES ('Eli', '2000-01-01', 'eli@vaj.com', '0937393719', NULL, NULL, 'INTERN', 'ADMINISTRATOR') ON CONFLICT ON CONSTRAINT "userEmailKey" DO UPDATE SET "name" = EXCLUDED."name", "birthday" = EXCLUDED."birthday", "phoneNumber" = EXCLUDED."phoneNumber" RETURNING *), "newUser011" AS (INSERT INTO "shop"."user" ("name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") VALUES ('Suzan', '1985-09-12', 'suzan@vaj.com', '0478123456', NULL, NULL, 'GOOGLE', 'USER') ON CONFLICT ON CONSTRAINT "userEmailKey" DO UPDATE SET "name" = EXCLUDED."name", "birthday" = EXCLUDED."birthday", "phoneNumber" = EXCLUDED."phoneNumber" RETURNING *) INSERT INTO "shop"."address" ("user", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing") VALUES ((SELECT "reference" FROM "newUser001"), 'Belgium', 'Antwerpen', 'Turnhout', '2300', 'Nagelstraat', '12', 'H', true, false), ((SELECT "reference" FROM "newUser011"), 'Belgium', 'Vlaams-Brabant', 'Leuven', '3000', 'Bondgenotenlaan', '45', NULL, false, true), ('178aca1d-ff58-4abe-845b-0a971095b005'::uuid, 'Belgium', 'Oost-Vlaanderen', 'Gent', '9000', 'Veldstraat', '101', '3B', true, true) RETURNING * ;`;
        
//         expect(query).toBe(expected);
//     });
// });

// describe("construct update SQL query", () => {
//     it("for single record", () => {
//         const schema = "shop";
//         const table = "address";
//         const updates = {
//             data: {
//                 reference: "85f3434c-8606-4a60-b9e4-6a262d0541ef",
//                 country: "Belgium",
//                 stateOrProvince: "Antwerpen",
//                 city: "Turnhout",
//                 zipCode: "2300",
//                 street: "Nagelstraat",
//                 streetNumber: "12",
//                 box: "H",
//                 shipping: true,
//                 billing: false,
//                 userByReference: {
//                     data: {
//                         reference: "4815943a-4ff9-44ab-b4b3-89ef57df7d6f",
//                         name: "Eli",
//                         email: "eli@vaj.com",
//                         birthday: "2000-01-01",
//                         phoneNumber: "0937393719",
//                         systemRole: "ADMINISTRATOR",
//                         systemAuthentication: "INTERN"
//                     }
//                 }
//             }
//         };

//         let query = constructors.constructSingleUpdateQuery(schema, table, updates);
//         query = cleanSpaces(query);

//         const expected = `WITH "newUser002" AS (UPDATE "shop"."user" SET "reference" = "002"."reference", "name" = "002"."name", "birthday" = "002"."birthday", "email" = "002"."email", "phoneNumber" = "002"."phoneNumber", "password" = "002"."password", "salt" = "002"."salt", "systemAuthentication" = "002"."systemAuthentication", "systemRole" = "002"."systemRole" FROM (VALUES ('4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Eli', '2000-01-01', 'eli@vaj.com', '0937393719', NULL, NULL, 'INTERN', 'ADMINISTRATOR')) AS "002"("reference", "name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") WHERE "user".reference = "002".reference RETURNING *) UPDATE "shop"."address" SET "reference" = "0"."reference", "user" = "0"."user", "country" = "0"."country", "stateOrProvince" = "0"."stateOrProvince", "city" = "0"."city", "zipCode" = "0"."zipCode", "street" = "0"."street", "streetNumber" = "0"."streetNumber", "box" = "0"."box", "shipping" = "0"."shipping", "billing" = "0"."billing" FROM (VALUES ('85f3434c-8606-4a60-b9e4-6a262d0541ef'::uuid, '4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Belgium', 'Antwerpen', 'Turnhout', '2300', 'Nagelstraat', '12', 'H', true, false)) AS "0"("reference", "user", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing") WHERE "address".reference = "0".reference RETURNING * ;`;
        
//         expect(query).toBe(expected);
//     });

//     it("for bulk records", () => {
//         const schema = "shop";
//         const table = "address";
//         const updates = {
//             data: [
//                 {
//                     reference: "2603fef5-e6ef-41e0-b269-821437163dab",
//                     country: "Belgium",
//                     stateOrProvince: "Antwerpen",
//                     city: "Turnhout",
//                     zipCode: "2300",
//                     street: "Nagelstraat",
//                     streetNumber: "12",
//                     box: "H",
//                     shipping: true,
//                     billing: false,
//                     userByReference: {
//                     data: {
//                         reference: "4815943a-4ff9-44ab-b4b3-89ef57df7d6f",
//                         name: "Eli",
//                         email: "eli@vaj.com",
//                         birthday: "2000-01-01",
//                         phoneNumber: "0937393719",
//                         systemRole: "ADMINISTRATOR",
//                         systemAuthentication: "INTERN"
//                     }
//                     }
//                 },
//                 {
//                     reference: "73d4233a-8f05-48c4-a2e5-03990d0a6cdd",
//                     country: "Belgium",
//                     stateOrProvince: "Vlaams-Brabant",
//                     city: "Leuven",
//                     zipCode: "3000",
//                     street: "Bondgenotenlaan",
//                     streetNumber: "45",
//                     box: null,
//                     shipping: false,
//                     billing: true,
//                     userByReference: {
//                     data: {
//                         reference: "a6c4efd0-68c8-4011-91f3-438dc12636cc",
//                         name: "Suzan",
//                         email: "suzan@vaj.com",
//                         birthday: "1985-09-12",
//                         phoneNumber: "0478123456",
//                         systemRole: "USER",
//                         systemAuthentication: "GOOGLE"
//                     },
//                     }
//                 },
//                 {
//                     reference: "f294bd16-c0fe-4344-a7c7-9b60a722c8b2", 
//                     country: "Belgium",
//                     stateOrProvince: "Oost-Vlaanderen",
//                     city: "Gent",
//                     zipCode: "9000",
//                     street: "Veldstraat",
//                     streetNumber: "101",
//                     box: "3B",
//                     shipping: true,
//                     billing: true,
//                     user: "178aca1d-ff58-4abe-845b-0a971095b005"
//                 }
//             ]
//         };

//         let query = constructors.constructBulkUpdateQuery(schema, table, updates);
//         query = cleanSpaces(query);

//         const expected = `WITH "newUser002" AS (UPDATE "shop"."user" SET "reference" = "002"."reference", "name" = "002"."name", "birthday" = "002"."birthday", "email" = "002"."email", "phoneNumber" = "002"."phoneNumber", "password" = "002"."password", "salt" = "002"."salt", "systemAuthentication" = "002"."systemAuthentication", "systemRole" = "002"."systemRole" FROM (VALUES ('4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Eli', '2000-01-01', 'eli@vaj.com', '0937393719', NULL, NULL, 'INTERN', 'ADMINISTRATOR')) AS "002"("reference", "name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") WHERE "user".reference = "002".reference RETURNING *), "newUser012" AS (UPDATE "shop"."user" SET "reference" = "012"."reference", "name" = "012"."name", "birthday" = "012"."birthday", "email" = "012"."email", "phoneNumber" = "012"."phoneNumber", "password" = "012"."password", "salt" = "012"."salt", "systemAuthentication" = "012"."systemAuthentication", "systemRole" = "012"."systemRole" FROM (VALUES ('a6c4efd0-68c8-4011-91f3-438dc12636cc'::uuid, 'Suzan', '1985-09-12', 'suzan@vaj.com', '0478123456', NULL, NULL, 'GOOGLE', 'USER')) AS "012"("reference", "name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") WHERE "user".reference = "012".reference RETURNING *) UPDATE "shop"."address" SET "reference" = "0"."reference", "user" = "0"."user", "country" = "0"."country", "stateOrProvince" = "0"."stateOrProvince", "city" = "0"."city", "zipCode" = "0"."zipCode", "street" = "0"."street", "streetNumber" = "0"."streetNumber", "box" = "0"."box", "shipping" = "0"."shipping", "billing" = "0"."billing" FROM (VALUES ('2603fef5-e6ef-41e0-b269-821437163dab'::uuid, '4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Belgium', 'Antwerpen', 'Turnhout', '2300', 'Nagelstraat', '12', 'H', true, false), ('73d4233a-8f05-48c4-a2e5-03990d0a6cdd'::uuid, 'a6c4efd0-68c8-4011-91f3-438dc12636cc'::uuid, 'Belgium', 'Vlaams-Brabant', 'Leuven', '3000', 'Bondgenotenlaan', '45', NULL, false, true), ('f294bd16-c0fe-4344-a7c7-9b60a722c8b2'::uuid, '178aca1d-ff58-4abe-845b-0a971095b005'::uuid, 'Belgium', 'Oost-Vlaanderen', 'Gent', '9000', 'Veldstraat', '101', '3B', true, true)) AS "0"("reference", "user", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing") WHERE "address".reference = "0".reference RETURNING * ;`;
        
//         expect(query).toBe(expected);
//     });
// });

// describe("construct delete SQL query", () => {
//     it("for single record", () => {
//         const schema = "shop";
//         const table = "address";
//         const deletes = {
//             data: {
//                 reference: "85f3434c-8606-4a60-b9e4-6a262d0541ef",
//                 country: "Belgium",
//                 stateOrProvince: "Antwerpen",
//                 city: "Turnhout",
//                 zipCode: "2300",
//                 street: "Nagelstraat",
//                 streetNumber: "12",
//                 box: "H",
//                 shipping: true,
//                 billing: false,
//                 userByReference: {
//                     data: {
//                     reference: "4815943a-4ff9-44ab-b4b3-89ef57df7d6f",
//                     name: "Eli",
//                     email: "eli@vaj.com",
//                     birthday: "2000-01-01",
//                     phoneNumber: "0937393719",
//                     systemRole: "ADMINISTRATOR",
//                     systemAuthentication: "INTERN"
//                     }
//                 }
//             }
//         };

//         let query = constructors.constructSingleDeleteQuery(schema, table, deletes);
//         query = cleanSpaces(query);

//         const expected = `WITH "newUser002" AS (DELETE FROM "shop"."user" USING (VALUES ('4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Eli', '2000-01-01', 'eli@vaj.com', '0937393719', NULL, NULL, 'INTERN', 'ADMINISTRATOR')) "002"("reference", "name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") WHERE "user"."reference" = "002"."reference" RETURNING *) DELETE FROM "shop"."address" USING (VALUES ('85f3434c-8606-4a60-b9e4-6a262d0541ef'::uuid, '4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Belgium', 'Antwerpen', 'Turnhout', '2300', 'Nagelstraat', '12', 'H', true, false)) "0"("reference", "user", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing") WHERE "address"."reference" = "0"."reference" RETURNING * ;`;
        
//         expect(query).toBe(expected);
//     });

//     it("for bulk records", () => {
//         const schema = "shop";
//         const table = "address";
//         const deletes = {
//             data: [
//                 {
//                     reference: "2603fef5-e6ef-41e0-b269-821437163dab",
//                     country: "Belgium",
//                     stateOrProvince: "Antwerpen",
//                     city: "Turnhout",
//                     zipCode: "2300",
//                     street: "Nagelstraat",
//                     streetNumber: "12",
//                     box: "H",
//                     shipping: true,
//                     billing: false,
//                     userByReference: {
//                     data: {
//                         reference: "4815943a-4ff9-44ab-b4b3-89ef57df7d6f",
//                         name: "Eli",
//                         email: "eli@vaj.com",
//                         birthday: "2000-01-01",
//                         phoneNumber: "0937393719",
//                         systemRole: "ADMINISTRATOR",
//                         systemAuthentication: "INTERN"
//                     }
//                     }
//                 },
//                 {
//                     reference: "73d4233a-8f05-48c4-a2e5-03990d0a6cdd",
//                     country: "Belgium",
//                     stateOrProvince: "Vlaams-Brabant",
//                     city: "Leuven",
//                     zipCode: "3000",
//                     street: "Bondgenotenlaan",
//                     streetNumber: "45",
//                     box: null,
//                     shipping: false,
//                     billing: true,
//                     userByReference: {
//                     data: {
//                         reference: "a6c4efd0-68c8-4011-91f3-438dc12636cc",
//                         name: "Suzan",
//                         email: "suzan@vaj.com",
//                         birthday: "1985-09-12",
//                         phoneNumber: "0478123456",
//                         systemRole: "USER",
//                         systemAuthentication: "GOOGLE"
//                     },
//                     }
//                 },
//                 {
//                     reference: "f294bd16-c0fe-4344-a7c7-9b60a722c8b2", 
//                     country: "Belgium",
//                     stateOrProvince: "Oost-Vlaanderen",
//                     city: "Gent",
//                     zipCode: "9000",
//                     street: "Veldstraat",
//                     streetNumber: "101",
//                     box: "3B",
//                     shipping: true,
//                     billing: true,
//                     user: "178aca1d-ff58-4abe-845b-0a971095b005"
//                 }
//             ]
//         };

//         let query = constructors.constructBulkDeleteQuery(schema, table, deletes);
//         query = cleanSpaces(query);

//         const expected = `WITH "newUser002" AS (DELETE FROM "shop"."user" USING (VALUES ('4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Eli', '2000-01-01', 'eli@vaj.com', '0937393719', NULL, NULL, 'INTERN', 'ADMINISTRATOR')) "002"("reference", "name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") WHERE "user"."reference" = "002"."reference" RETURNING *), "newUser012" AS (DELETE FROM "shop"."user" USING (VALUES ('a6c4efd0-68c8-4011-91f3-438dc12636cc'::uuid, 'Suzan', '1985-09-12', 'suzan@vaj.com', '0478123456', NULL, NULL, 'GOOGLE', 'USER')) "012"("reference", "name", "birthday", "email", "phoneNumber", "password", "salt", "systemAuthentication", "systemRole") WHERE "user"."reference" = "012"."reference" RETURNING *) DELETE FROM "shop"."address" USING (VALUES ('2603fef5-e6ef-41e0-b269-821437163dab'::uuid, '4815943a-4ff9-44ab-b4b3-89ef57df7d6f'::uuid, 'Belgium', 'Antwerpen', 'Turnhout', '2300', 'Nagelstraat', '12', 'H', true, false), ('73d4233a-8f05-48c4-a2e5-03990d0a6cdd'::uuid, 'a6c4efd0-68c8-4011-91f3-438dc12636cc'::uuid, 'Belgium', 'Vlaams-Brabant', 'Leuven', '3000', 'Bondgenotenlaan', '45', NULL, false, true), ('f294bd16-c0fe-4344-a7c7-9b60a722c8b2'::uuid, '178aca1d-ff58-4abe-845b-0a971095b005'::uuid, 'Belgium', 'Oost-Vlaanderen', 'Gent', '9000', 'Veldstraat', '101', '3B', true, true)) "0"("reference", "user", "country", "stateOrProvince", "city", "zipCode", "street", "streetNumber", "box", "shipping", "billing") WHERE "address"."reference" = "0"."reference" RETURNING * ;`;
        
//         expect(query).toBe(expected);
//     });
// });
