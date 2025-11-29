import path from "path";

import { loadStage } from "../../src/utils/stage";
import getLogger from "../../src/utils/logger";
import { captureCtrlC } from "../../src/utils/prompt";
import * as docker from "../../src/utils/docker";

const logger = getLogger({
  source: "scripts",
  module: path.basename(__filename),
});

const STATUS = { value: false };
const CONTAINER_NAME = "vaj-postgres";

const runDatabaseContainer = function () {
  const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  if (!password || !host || !port) {
    logger.error("Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_HOST, or DATABASE_PORT.");
    process.exit(-1);
  }

  docker.ensureDockerRunning();
  docker.pullDockerImage("postgres:14.19-trixie");

  docker.runDockerContainer({
    "--name": CONTAINER_NAME,
    args: [
      { "-e": `POSTGRES_PASSWORD=${password}` }, 
      { "-p": `${port}:${port}` },
      "postgres"
    ]
  });

  logger.info(`PostgreSQL container "${CONTAINER_NAME}" is running on ${host}:${port}.`);

  STATUS.value = true;
};

const main = async function () {
  await loadStage();

  captureCtrlC();
  docker.terminateDocker(CONTAINER_NAME, STATUS); 

  runDatabaseContainer();

  logger.info("Database running. Ctrl+C to stop.");
  process.stdin.resume();
};

main();

