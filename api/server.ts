import express from "express";
import { Express } from "express";
import { Client } from "pg";

import { loadStage } from "../scripts/utils/stage";
import usersRouter from "./routes/users";

// Loading the stage variable
loadStage();

// Import the environment variables
const database: string = process.env.DATABASE_NAME || "vintage_archive_jungle";
const host: string = process.env.DATABASE_HOST || "localhost";
const port: number = !isNaN(Number(process.env.DATABASE_PORT))
  ? Number(process.env.DATABASE_PORT)
  : 5432;
const user: string = process.env.DATABASE_USER || "administrator";
const password: string = process.env.DATABASE_PASSWORD || "my_password";

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

// Adding the routers
app.use("/users", usersRouter);

// Start the listen process
app.listen(PORT);

export { pgClient };
