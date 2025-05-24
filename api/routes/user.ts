import express from "express";
import { Router } from "express";

import { getPgClient, SQLClauseFormatter } from "../../utils/database";
import { ExpectedRequest, ExpectedResponse } from "../server";
import { User, Address } from "../types/types";
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
        query: query,
      });
      res.end();
    } catch (error) {
      res.status(500).json({
        error: `Failed to execute the query on the database: ${error}`,
        query: query,
      });
      res.end();
    }
  })

  .post((req: ExpectedRequest, res: ExpectedResponse) => {})
  .put((req: ExpectedRequest, res: ExpectedResponse) => {})
  .delete((req: ExpectedRequest, res: ExpectedResponse) => {});

export default userRouter;
