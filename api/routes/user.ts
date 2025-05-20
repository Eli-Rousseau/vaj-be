import express from "express";
import { Router } from "express";

import { pgClient, ExpectedRequest } from "../server";
import { User, Address } from "../types/types";
import { error } from "console";
import { off } from "process";

const userRouter: Router = express.Router();

// Handeling the route parameters
userRouter.param(
  "id",
  (req: ExpectedRequest, res: express.Response, next, value) => {
    req.id = value;
    next();
  }
);

userRouter
  .route("/:id")
  .get((req: ExpectedRequest, res: express.Response) => {})
  .post((req: ExpectedRequest, res: express.Response) => {})
  .put((req: ExpectedRequest, res: express.Response) => {})
  .delete((req: ExpectedRequest, res: express.Response) => {});

// Handle request on the main route
userRouter
  .route("/")
  .get(async (req: ExpectedRequest, res: express.Response) => {
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

  .post((req: ExpectedRequest, res: express.Response) => {})
  .put((req: ExpectedRequest, res: express.Response) => {})
  .delete((req: ExpectedRequest, res: express.Response) => {});

export default userRouter;
