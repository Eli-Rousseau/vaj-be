import express, { Express } from "express";

import { logger } from "@/core/logger";
import * as routers from "@/be/api/routes/index";
// import { setupShutdownHooks } from "@/be/utils/shutdown";
import * as middleware from "@/be/api/middleware/handlers";

const LOGGER = logger.get();

let app: Express | null = null;

// Setting up the server process
export async function startServer() {
  // setupShutdownHooks();

  const host = process.env.VAJ_APPLICATION_HOST;
  const port = process.env.VAJ_APPLICATION_PORT;

  if (!host || !port) {
    LOGGER.error(
      "Missing required environment variables: VAJ_APPLICATION_HOST or VAJ_APPLICATION_PORT.",
    );
    process.exit(1);
  }

  app = express();

  app.use(middleware.handleCors);
  app.use(middleware.handleSetupRequestContext);
  app.use(middleware.handleValidateAccessToken);
  app.use(middleware.handleRateLimit);

  app.use(express.json());

  // Adding the routers
  app.use("/api/v1/graphql", await routers.getGraphQlRouter());
  app.use("/api/v1/authentication", routers.authentication.default);
  app.use("/api/v1/file", routers.file.default);

  app.use(middleware.unhandeledRoutes);

  app.listen(port, () => {
    LOGGER.info(`Server listening at http://${host}:${port}`);
  });
}

if (require.main === module) {
  (async () => {
    await startServer();
  })();
}