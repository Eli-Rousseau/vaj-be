import express from "express";
import { Express } from "express";
import { Client } from "pg";

import { loadStage } from "../utils/stage";
import userRouter from "./routes/user";
import { off } from "process";

// Extend the request interface
interface ExpectedRequest extends express.Request {
  id?: string;
  limit?: string;
  offset?: string;
}

// Loading the stage variable
loadStage();

// Import the environment variables
const database: string = process.env.DATABASE_VAJ || "";
const host: string = process.env.DATABASE_HOST || "";
const port: number = !isNaN(Number(process.env.DATABASE_PORT))
  ? Number(process.env.DATABASE_PORT)
  : 0;
const user: string = process.env.DATABASE_ADMINISTRATOR_USER_NAME || "";
const password: string = process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD || "";

// Initiate the pg client
const pgClient: Client = new Client({
  user: user,
  database: database,
  port: port,
  host: host,
  password: password,
});

// Initiate the api server
const app: Express = express();
const PORT: number = 1111;

// Handeling the query parameters
app.use((req: ExpectedRequest, res: express.Response, next) => {
  // Handeling the limit query parameter
  let limit: string | undefined = undefined;
  if (typeof req.query.limit === "string") {
    limit = req.query.limit;
  }
  req.limit = limit;

  // Handeling the offset query parameter
  let offset: string | undefined = undefined;
  if (typeof req.query.offset === "string") {
    offset = req.query.offset;
  }
  req.offset = offset;

  next();
});

// Adding the routers
app.use("/user", userRouter);

// Start the listen process
app.listen(PORT);

export { pgClient, ExpectedRequest };
