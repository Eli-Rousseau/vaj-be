import path from "path";

import express from "express";
import { Express } from "express";

import { loadStage } from "../utils/stage";
import { rateLimiter, unhandeledRoutes } from "./middlewares";
import getLogger from "../utils/logger";
import * as routers from "./routes/index";

const logger = getLogger({
    source: "src",
    service: "api",
    module: path.basename(__filename)
})

let app: Express | null = null;

// Setting up the server process
async function startServer() {
  await loadStage();

  const host = process.env.APPLICATION_HOST;
  const port = process.env.APPLICATION_PORT;

  if (!host || ! port) {
    logger.error("Missing required environment variables: APPLICATION_HOST or APPLICATION_PORT.");
    process.exit(1);
  }

  // Setup a database healthcheck on defined intervals
  // setInterval(() => checkDatabaseHealth(pgClient), 3600_000); // 1 hour

  app = express();

  app.use(rateLimiter);
  app.use(express.json());

  // Adding the routers
  app.use("/api/graphql", await routers.getGraphQlRouter());

  app.use(unhandeledRoutes);

  app.listen(port, () => {
    logger.info(`Server listening at http://${host}:${port}`);
  });
}

startServer().catch(err => {
  logger.error(err);
  process.exit(1);
});

