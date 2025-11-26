import path from "path";

import { loadStage } from "../../src/utils/stage";
import getLogger from "../../src/utils/logger";
import * as docker from "../../src/utils/docker";

const logger = getLogger({
  source: "scripts",
  module: path.basename(__filename),
});

const runDatabaseContainer = function () {
  const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  if (!password || !host || !port) {
    logger.error(
      "Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_HOST, or DATABASE_PORT."
    );
    process.exit(-1);
  }

  const containerName = "vaj-postgres";
  docker.ensureDockerRunning();
  docker.pullDockerImage("postgres:14.19-trixie");
  docker.runDockerContainer({
    "--name": containerName,
    args: [{ "-e": `POSTGRES_PASSWORD=${password}` }, "postgres"],
  });
  logger.info(
    `PostgreSQL container "${containerName}" is running. Connect via ${host}:${port}.`
  );
};

const main = async function () {
  await loadStage();

  runDatabaseContainer();
};

main();
