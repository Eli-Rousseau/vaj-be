import express, { Router } from "express";
import { instanceToPlain, plainToInstance } from "class-transformer";

import { getPgClient } from "../../../utils/database";
import {
  ExpectedRequest,
  ExpectedResponse,
  GLOBAL_AUTOGENERATED_FIELDS,
} from "../../server";
import { User } from "../../../classes/transformer-classes";
import { QueryResult } from "pg";

const databaseUserRoute: Router = express.Router();

// Handeling the route parameters
databaseUserRoute.param(
  "id",
  (req: ExpectedRequest, res: ExpectedResponse, next, value) => {
    req.id = value;
    next();
  }
);

// Handle the retrieval of the pgClient
databaseUserRoute.use((req: ExpectedRequest, res: ExpectedResponse, next) => {
  try {
    req.pgClient = getPgClient();
  } catch (error) {
    res
      .status(500)
      .json({
        error: `Encountered an error when getting the postgresql client: ${error}`,
      })
      .end();
    return;
  }
  next();
});

// Handle request on the param route
databaseUserRoute
  .route("/:id")
  .get(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the record reference
    const reference: string = req.id as string;

    // Format the database query
    const querySelectRecord: string = `
SELECT *
FROM shop.user
WHERE reference = '${reference}';    
    `;

    // Run the query on the database
    let row: any;
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        querySelectRecord
      );
      row = queryResult.rows[0];
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: querySelectRecord,
        })
        .end();
      return;
    }

    // Verify whether a record could be returned
    if (!row) {
      res
        .status(400)
        .json({
          error: `No record found for identifier: ${reference}`,
          query: querySelectRecord,
        })
        .end();
      return;
    }

    // Convert record into instance
    const record: User = plainToInstance(User, row);

    // Reconvert the instance to output
    const output: any = instanceToPlain(record);

    // Finish the response
    res.status(200).json(output).end();
    return;
  })
  .post((req: ExpectedRequest, res: ExpectedResponse) => {
    res
      .status(400)
      .json({
        error: "Invalid request: unable to insert based on identifier.",
      })
      .end();
    return;
  })
  .put(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the record reference
    const reference: string = req.id as string;

    // Retrieve the request body
    const body: any = req.body;

    // Verify whether the inputs is an object
    if (typeof body !== "object") {
      res
        .status(400)
        .json({
          error: `Expected body with a single object. Received: ${body}`,
        })
        .end();
    }

    // Convert plain objects into instances
    let instance: User;
    try {
      instance = plainToInstance(User, body);
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to tranform the plain object into an User instance: ${error}`,
          record: body,
        })
        .end();
      return;
    }

    // Filter out the autogenerated fields to exclude
    let fields: string[] = Object.keys(instance);
    fields = fields.filter(
      (field) =>
        !GLOBAL_AUTOGENERATED_FIELDS.includes(field) &&
        !["reference"].includes(field)
    );

    // Reconvert the instances to plain
    const plain: Record<string, any> = instanceToPlain(instance);

    // Retrieve all the record values
    const recordValues: string[] = fields.map((field) => {
      return `${field} = ${
        plain[field] === null
          ? "NULL"
          : typeof plain[field] === "string"
          ? `'${plain[field]}'`
          : plain[field]
      }`;
    });

    // Format the database query
    const queryUpdateRecord: string = `
UPDATE shop.user
SET ${recordValues.join(",\n")}
WHERE reference = ${reference}
RETURNING *;    
    `;

    // Run the query on the database
    let row: any;
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        queryUpdateRecord
      );
      row = queryResult.rows[0];
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryUpdateRecord,
        })
        .end();
      return;
    }

    // Verify whether a record could be returned
    if (!row) {
      res
        .status(400)
        .json({
          error: `No record found for identifier: ${reference}`,
          query: queryUpdateRecord,
        })
        .end();
      return;
    }

    // Convert record into instance
    const record: User = plainToInstance(User, row);

    // Reconvert the instance to output
    const output: any = instanceToPlain(record);

    // Finish the response
    res.status(200).json(output).end();
    return;
  })
  .delete(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the record reference
    const reference: string = req.id as string;

    // Format the database query
    const queryDeleteInstance: string = `
DELETE FROM shop.user
WHERE reference = '${reference}'
RETURNING *;    
    `;

    // Run the query on the database
    let row: any;
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        queryDeleteInstance
      );
      row = queryResult.rows[0];
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryDeleteInstance,
        })
        .end();
      return;
    }

    // Verify whether a record could be returned
    if (!row) {
      res
        .status(400)
        .json({
          error: `No record found for identifier: ${reference}`,
          query: queryDeleteInstance,
        })
        .end();
      return;
    }

    // Convert record into instance
    const record: User = plainToInstance(User, row);

    // Reconvert the instance to output
    const output: any = instanceToPlain(record);

    // Finish the response
    res.status(200).json(output).end();
    return;
  });

// Handle request on the main route
databaseUserRoute
  .route("/")
  .get(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the query params
    const limit: string | undefined = req.limit;
    const offset: string | undefined = req.offset;

    // Format the database query
    const querySelectRecords: string = `
SELECT *
FROM shop.user
ORDER BY updated_at DESC
${limit ? "LIMIT " + limit + (offset ? " OFFSET " + offset : "") : ""};
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        querySelectRecords
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: querySelectRecords,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: querySelectRecords,
        })
        .end();
      return;
    }

    // Convert records into instances
    let records: User[] = [];
    for (let i: number = 0; i < rows.length; i++) {
      const row: any = rows[i];
      const record: User = plainToInstance(User, row);
      records.push(record);
    }

    // Reconvert the instances to outputs
    let outputs: any[] = [];
    for (let i: number = 0; i < records.length; i++) {
      const record: User = records[i];
      const output: Record<string, any> = instanceToPlain(record);
      outputs.push(output);
    }

    // Finish the response
    res.status(200).json(outputs).end();
    return;
  })
  .post(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the request body
    let body: any = req.body;

    // Verify whether the inputs is an array
    const inputIsArray: boolean = Array.isArray(body);
    const inputIsObject: boolean = typeof body === "object";
    if (!inputIsArray && !inputIsObject) {
      res
        .status(400)
        .json({
          error: `Expected body with a single instance or an array of users. Received: ${body}`,
        })
        .end();
      return;
    }

    // Transform object into a list of objects
    if (!inputIsArray) {
      body = [body];
    }

    // Convert plain objects into instances
    let instances: User[] = [];
    for (let i: number = 0; i < body.length; i++) {
      const plain: any = body[i];
      try {
        const instance: User = plainToInstance(User, plain);
        instances.push(instance);
      } catch (error) {
        res
          .status(400)
          .json({
            error: `Failed to tranform the plain object into an User instance: ${error}`,
            record: plain,
          })
          .end();
        return;
      }
    }

    // Filter out the autogenerated fields to exclude
    let fields: string[] = Object.keys(instances[0]);
    fields = fields.filter(
      (field) => !GLOBAL_AUTOGENERATED_FIELDS.includes(field)
    );

    // Reconvert the instances to plain
    let plains: Record<string, any>[] = [];
    for (let i: number = 0; i < instances.length; i++) {
      const instance: User = instances[i];
      const plain: Record<string, any> = instanceToPlain(instance);
      plains.push(plain);
    }

    // Retrieve all the record values
    let valuesRecords: string[] = [];
    for (let i: number = 0; i < plains.length; i++) {
      const plain: Record<string, any> = plains[i];
      const valuesRecord: string[] = fields.map((field) =>
        plain[field] === undefined
          ? "DEFAULT"
          : plain[field] === null
          ? "NULL"
          : typeof plain[field] === "string"
          ? `'${plain[field]}'`
          : plain[field]
      );
      valuesRecords.push(`(${valuesRecord.join(", ")})`);
    }

    // Format the database query
    const queryInsertInstances: string = `
INSERT INTO shop.user (${fields.join(", ")})
VALUES
${valuesRecords.join(",\n")}
RETURNING *;
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        queryInsertInstances
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryInsertInstances,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: queryInsertInstances,
        })
        .end();
      return;
    }

    // Convert records into instances
    let records: User[] = [];
    for (let i: number = 0; i < rows.length; i++) {
      const row: any = rows[i];
      const record: User = plainToInstance(User, row);
      records.push(record);
    }

    // Reconvert the instances to outputs
    let outputs: any[] = [];
    for (let i: number = 0; i < records.length; i++) {
      const record: User = records[i];
      const output: Record<string, any> = instanceToPlain(record);
      outputs.push(output);
    }

    // Retransform list of objects into an single object
    if (!inputIsArray) {
      outputs = outputs[0];
    }

    // Finish the response
    res.status(200).json(outputs).end();
    return;
  })
  .put(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the request body
    let body: any = req.body;

    // Verify whether the inputs is an array
    const inputIsArray: boolean = Array.isArray(body);
    const inputIsObject: boolean = typeof body === "object";
    if (!inputIsArray && !inputIsObject) {
      res
        .status(400)
        .json({
          error: `Expected body with a single instance or an array of users. Received: ${body}`,
        })
        .end();
      return;
    }

    // Transform object into a list of objects
    if (!inputIsArray) {
      body = [body];
    }

    // Convert plain objects into instances
    let instances: User[] = [];
    for (let i: number = 0; i < body.length; i++) {
      const plain: any = body[i];
      try {
        const instance: User = plainToInstance(User, plain);
        instances.push(instance);
      } catch (error) {
        res
          .status(400)
          .json({
            error: `Failed to tranform the plain object into an User instance: ${error}`,
            record: plain,
          })
          .end();
        return;
      }
    }

    // Filter out the autogenerated fields to exclude
    let fields: string[] = Object.keys(instances[0]);
    fields = fields.filter(
      (field) => !GLOBAL_AUTOGENERATED_FIELDS.includes(field)
    );

    // Reconvert the instances to plain
    let plains: Record<string, any>[] = [];
    for (let i: number = 0; i < instances.length; i++) {
      const instance: User = instances[i];
      const plain: Record<string, any> = instanceToPlain(instance);
      plains.push(plain);
    }

    // Retrieve all the record values
    let valuesRecords: string[] = [];
    for (let i: number = 0; i < plains.length; i++) {
      const plain: Record<string, any> = plains[i];
      const valuesRecord: string[] = fields.map((field) =>
        plain[field] === null
          ? "NULL"
          : typeof plain[field] === "string"
          ? `'${plain[field]}'`
          : plain[field]
      );
      valuesRecords.push(`(${valuesRecord.join(", ")})`);
    }

    // Retrieve all the fields to update
    const updateFields: string[] = [];
    for (let i: number = 0; i < fields.length; i++) {
      const field: string = fields[i];
      if (field === "reference") {
        continue;
      }

      updateFields.push(`${field} = temp_updates.${field}`);
    }

    // Format the database queries
    const queryDropTemporaryTable: string = `
DROP TABLE IF EXISTS temp_updates;
    `;
    const queryCreateTemporaryTable: string = `
CREATE TEMP TABLE temp_updates 
(LIKE shop."user" INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
    `;
    const queryInsertinstances: string = `
INSERT INTO temp_updates (${fields.join(", ")})
VALUES
${valuesRecords.join(",\n")};    
    `;
    const queryUpdateInstances: string = `
UPDATE shop."user"
SET
${updateFields.join(",\n")}
FROM temp_updates
WHERE "user".reference = temp_updates.reference
RETURNING "user".*;
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      await req.pgClient!.query(queryDropTemporaryTable);
      await req.pgClient!.query(queryCreateTemporaryTable);
      await req.pgClient!.query(queryInsertinstances);
      const queryResult: QueryResult = await req.pgClient!.query(
        queryUpdateInstances
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryUpdateInstances,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: queryUpdateInstances,
        })
        .end();
      return;
    }

    // Convert records into instances
    let records: User[] = [];
    for (let i: number = 0; i < rows.length; i++) {
      const row: any = rows[i];
      const record: User = plainToInstance(User, row);
      records.push(record);
    }

    // Reconvert the instances to outputs
    let outputs: any[] = [];
    for (let i: number = 0; i < records.length; i++) {
      const record: User = records[i];
      const output: Record<string, any> = instanceToPlain(record);
      outputs.push(output);
    }

    // Retransform list of objects into an single object
    if (!inputIsArray) {
      outputs = outputs[0];
    }

    // Finish the response
    res.status(200).json(outputs).end();
    return;
  })
  .delete(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the request body
    let body: any = req.body;

    // Verify whether the inputs is an array
    const inputIsArray: boolean = Array.isArray(body);
    const inputIsObject: boolean = typeof body === "object";
    if (!inputIsArray && !inputIsObject) {
      res
        .status(400)
        .json({
          error: `Expected body with a single instance or an array of users. Received: ${body}`,
        })
        .end();
      return;
    }

    // Transform object into a list of objects
    if (!inputIsArray) {
      body = [body];
    }

    // Convert plain objects into instances
    let instances: User[] = [];
    for (let i: number = 0; i < body.length; i++) {
      const plain: any = body[i];
      try {
        const instance: User = plainToInstance(User, plain);
        instances.push(instance);
      } catch (error) {
        res
          .status(400)
          .json({
            error: `Failed to tranform the plain object into an User instance: ${error}`,
            record: plain,
          })
          .end();
        return;
      }
    }

    // Filter out the autogenerated fields to exclude
    let fields: string[] = Object.keys(instances[0]);
    fields = fields.filter(
      (field) => !GLOBAL_AUTOGENERATED_FIELDS.includes(field)
    );

    // Reconvert the instances to plain
    let plains: Record<string, any>[] = [];
    for (let i: number = 0; i < instances.length; i++) {
      const instance: User = instances[i];
      const plain: Record<string, any> = instanceToPlain(instance);
      plains.push(plain);
    }

    // Retrieve all the record references
    let referencesRecords: string[] = [];
    for (let i: number = 0; i < plains.length; i++) {
      const plain: Record<string, any> = plains[i];
      const referenceRecord: string = plain["reference"];
      referencesRecords.push(referenceRecord);
    }

    // Format the database query
    const queryDeleteInstances: string = `
DELETE FROM shop.user
WHERE reference IN (${referencesRecords.join(", ")})
RETURNING *;    
    `;

    // Run the query on the database
    let rows: any[] = [];
    try {
      const queryResult: QueryResult = await req.pgClient!.query(
        queryDeleteInstances
      );
      rows = queryResult.rows;
    } catch (error) {
      res
        .status(400)
        .json({
          error: `Failed to execute the query on the database: ${error}`,
          query: queryDeleteInstances,
        })
        .end();
      return;
    }

    // Verify whether one or more records could be returned
    if (!rows) {
      res
        .status(400)
        .json({
          error:
            "No records could be retrieved upon execution of the database query.",
          query: queryDeleteInstances,
        })
        .end();
      return;
    }

    // Convert records into instances
    let records: User[] = [];
    for (let i: number = 0; i < rows.length; i++) {
      const row: any = rows[i];
      const record: User = plainToInstance(User, row);
      records.push(record);
    }

    // Reconvert the instances to outputs
    let outputs: any[] = [];
    for (let i: number = 0; i < records.length; i++) {
      const record: User = records[i];
      const output: Record<string, any> = instanceToPlain(record);
      outputs.push(output);
    }

    // Retransform list of objects into an single object
    if (!inputIsArray) {
      outputs = outputs[0];
    }

    // Finish the response
    res.status(200).json(outputs).end();
    return;
  });

export default databaseUserRoute;
