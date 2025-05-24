import express from "express";
import { Router } from "express";

import { getPgClient } from "../../utils/database";
import { ExpectedRequest, ExpectedResponse } from "../server";
import { User, Address } from "../types/types";
import { Client } from "pg";

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
    const limit: string | undefined = req.limit;
    const offset: string | undefined = req.offset;
    const query: string = `
SELECT *
FROM shop.user
ORDER BY updated_at DESC
${limit ? "LIMIT " + limit + (offset ? "OFFSET " + offset : "") : ""}
    `;

    // Make connection to the database
    try {
      await pgClient.connect();
    } catch (error) {
      res.status(500).json({
        // TO DO: check the status to return
        error: `Failed to establish connection to database: ${error}`,
      });
    }

    // Run the query on the database
    try {
      const result = await pgClient.query(query);
    } catch (error) {
      res.status(500).json({
        // TO DO: check the status to return
        error: `Failed to execute the query on the database: ${error}`,
        query: query,
      });
    }
  })

  // TO DO: disconnect from database

  .post((req: ExpectedRequest, res: ExpectedResponse) => {})
  .put((req: ExpectedRequest, res: ExpectedResponse) => {})
  .delete((req: ExpectedRequest, res: ExpectedResponse) => {});

export default userRouter;
