import express from "express";
import { Router } from "express";
import { instanceToPlain, plainToInstance } from "class-transformer";

import { getPgClient, SQLClauseFormatter } from "../../utils/database";
import { ExpectedRequest, ExpectedResponse } from "../server";
import { User } from "../classes/transformer-classes";
import { QueryResult } from "pg";

const userRouter: Router = express.Router();

// Handeling the route parameters
userRouter.param(
  "id",
  (req: ExpectedRequest, res: ExpectedResponse, next, value) => {
    req.id = value;
    next();
  }
);

// Handeling the retrieval of the pgClient
userRouter.use((req: ExpectedRequest, res: ExpectedResponse, next) => {
  try {
    req.pgClient = getPgClient();
  } catch (error) {
    res.status(500).json({
      error: `Encountered an error when getting the postgresql client: ${error}`,
    });
    res.end();
  }
  next();
});

// Handle request on the param route
userRouter
  .route("/:id")
  .get((req: ExpectedRequest, res: ExpectedResponse) => {})
  .post((req: ExpectedRequest, res: ExpectedResponse) => {})
  .put((req: ExpectedRequest, res: ExpectedResponse) => {})
  .delete((req: ExpectedRequest, res: ExpectedResponse) => {});

// Handle request on the main route
userRouter
  .route("/")
  .get(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Format the database query
    const query: string = `
SELECT *
FROM shop.user
ORDER BY updated_at DESC
${SQLClauseFormatter.generateLimitOffsetClause(req.limit, req.offset)};
    `;

    // Run the query on the database
    try {
      const queryResult: QueryResult = await req.pgClient!.query(query);
      res.status(200).json({
        users: queryResult.rows,
      });
      res.end();
    } catch (error) {
      res.status(400).json({
        error: `Failed to execute the query on the database: ${error}`,
        query: query,
      });
      res.end();
    }
  })

  .post(async (req: ExpectedRequest, res: ExpectedResponse) => {
    // Retrieve the request body
    const body: any = req.body;

    // Verify whether the inputs is in array
    if (!Array.isArray(body)) {
      res.status(400).json({ error: "Expected an array of users" });
      res.end();
    }

    // Convert plain objects into instances
    let users: User[] = [];
    for (let i: number = 0; i < body.length; i++) {
      const plain: any = body[i];
      try {
        const user: User = plainToInstance(User, plain);
        users.push(user);
      } catch (error) {
        res.status(400).json({
          error: `Failed to tranform the plain object into an User instance: ${error}`,
          record: plain,
        });
        res.end();
      }
    }

    // Retrieve the expected fields to insert
    const fields: string[] = Object.keys(users[0]);

    // Reconvert the instances to plain
    let plains: Record<string, any>[] = [];
    for (let i: number = 0; i < users.length - 1; i++) {
      const user: User = users[i];
      const plain: Record<string, any> = instanceToPlain(user);
      plains.push(plain);
    }

    // Retrieve all the record values
    let valuesRecords: string[] = [];
    for (let i: number = 0; i < plains.length - 1; i++) {
      const plain: Record<string, any> = plains[i];
      const valuesRecord: string[] = fields.map((field) =>
        plain[field] === "undefined"
          ? "DEFAULT"
          : typeof plain[field] === "string"
          ? `'${plain[field]}'`
          : plain[field]
      );
      valuesRecords.push(`(${valuesRecord.join(", ")})`);
    }

    // Format the database query
    const query: string = `
INSERT INTO shop.user (${fields.join(", ")})
VALUES
${valuesRecords.join(",\n")}\n
RETURNING *;
    `;

    // Run the query on the database
    try {
      const queryResult: QueryResult = await req.pgClient!.query(query);
      res.status(200).json({
        users: queryResult.rows,
      });
      res.end();
    } catch (error) {
      res.status(400).json({
        error: `Failed to execute the query on the database: ${error}`,
        query: query,
      });
      res.end();
    }
  })
  .put((req: ExpectedRequest, res: ExpectedResponse) => {})
  .delete((req: ExpectedRequest, res: ExpectedResponse) => {});

export default userRouter;
