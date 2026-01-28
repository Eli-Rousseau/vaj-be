import path from "path";

import express from "express";
import { Express } from "express";

import { loadStage } from "../utils/stage";
import { rateLimiter, unhandeledRoutes } from "./middlewares";
import { logger } from "../utils/logger";
import * as routers from "./routes/index";
import { setupShutdownHooks } from "../utils/shutdown";

const LOGGER = logger.get({
    source: "src",
    service: "api",
    module: path.basename(__filename)
})

let app: Express | null = null;

// Setting up the server process
async function startServer() {
  await loadStage();

  setupShutdownHooks();

  const host = process.env.APPLICATION_HOST;
  const port = process.env.APPLICATION_PORT;

  if (!host || ! port) {
    LOGGER.error("Missing required environment variables: APPLICATION_HOST or APPLICATION_PORT.");
    process.exit(1);
  }

  app = express();

  app.use(rateLimiter);
  app.use(express.json());

  // Adding the routers
  app.use("/api/graphql", await routers.getGraphQlRouter());

  app.use(unhandeledRoutes);

  app.listen(port, () => {
    LOGGER.info(`Server listening at http://${host}:${port}`);
  });
}

startServer().catch(err => {
  LOGGER.error(err);
  process.exit(1);
});
