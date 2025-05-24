import express from "express";
import { Express } from "express";

import Logger from "../utils/logger";
import { loadStage } from "../utils/stage";
import {
  createPgClient,
  initializeDatabaseConnection,
  terminateDatabaseConnection,
} from "../utils/database";
import userRouter from "./routes/user";
import { Client } from "pg";

// Extend the request and reponse interfaces
interface ExpectedRequest extends express.Request {
  id?: string;
  limit?: string;
  offset?: string;
  pgClient?: Client | null;
}
interface ExpectedResponse extends express.Response {}

// Initialize the global variables
const PORT: number = 1111;

// Create a function for starting up the server
async function startServer() {
  // Loading the stage variable
  await loadStage();

  // Creating a postgresql client
  const pgClient: Client = createPgClient();

  // Initiating a connection with the pgClient
  const connected: boolean = await initializeDatabaseConnection(pgClient);

  // Skip server listening
  if (!connected) {
    Logger.info("Skipping the server listening.");
    process.exit(1);
  }

  // Initiate the api server
  const app: Express = express();

  // Handeling the query parameters
  app.use((req: ExpectedRequest, res: ExpectedResponse, next) => {
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

  // Disconnect from the database
  const disconnected: boolean = await terminateDatabaseConnection();
}

// Start up the server
startServer();

export { ExpectedRequest, ExpectedResponse };
