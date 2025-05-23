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

// Define the app variable
let app: Express;

// Setting up the server process
async function setupServer() {
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
  app = express();

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
}

// Starting up the server process
async function startServer() {
  // Start the listen process
  app.listen(PORT, () => {
    // Load the host and the port
    const host: string | undefined = process.env.DATABASE_HOST;
    if (!host) {
      Logger.error(
        "Unable to retrieve the database host from the environmental variables."
      );
      process.exit(1);
    }
    Logger.info(`Server listening at http://${host}:${PORT}`);
  });
}

// On terminating the server process
function terminateServer() {
  process.on("SIGINT", async () => {
    Logger.info(
      "Received SIGINT. Terminating the server process. Cleaning up..."
    );
    const disconnected: boolean = await terminateDatabaseConnection();
    process.exit(disconnected ? 0 : 1);
  });

  process.on("SIGTERM", async () => {
    Logger.info(
      "Received SIGTERM. Terminating the server process. Cleaning up..."
    );
    const disconnected: boolean = await terminateDatabaseConnection();
    process.exit(disconnected ? 0 : 1);
  });
}

// Orchestrate the server creation process
(async () => {
  await setupServer(); // Wait until setup is done
  startServer(); // Then start the listener
  terminateServer(); // Setup graceful shutdown
})();

export { ExpectedRequest, ExpectedResponse };
