import path from "path";
import express, { Express } from "express";

import { loadStage } from "@/src/utils/stage";
import { logger } from "@/src/utils/logger";
import * as routers from "@/src/api/routes/index";
import { setupShutdownHooks } from "@/src/utils/shutdown";
import * as middleware from "@/src/middleware/handlers";

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

  app.use(middleware.handleSetupRequestContext);
  app.use(middleware.handleValidateAccessToken);

  app.use(express.json());

  // Adding the routers
  app.use("/api/graphql", await routers.getGraphQlRouter());
  app.use("/api/authentication", routers.authentication.default);

  app.use(middleware.unhandeledRoutes);

  app.listen(port, () => {
    LOGGER.info(`Server listening at http://${host}:${port}`);
  });
}

startServer().catch(err => {
  LOGGER.error(err);
  process.exit(1);
});
