import { loadStage } from "@/src/core/stage";
import { docker } from "@/src/core/docker";
import { setupShutdownHooks } from "@/src/core/shutdown";
import { logger } from "@/src/core/logger";

const LOGGER = logger.get();

const CONTAINER_NAME = "vaj-postgres";

const runDatabaseContainer = function () {
  const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  if (!password || !host || !port) {
    LOGGER.error(
      "Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_HOST, or DATABASE_PORT.",
    );
    process.exit(1);
  }

  try {
    docker.activate();
    docker.pullImage("postgres:14.19-trixie");
    docker.runContainer({
      "--name": CONTAINER_NAME,
      args: [
        { "-e": `POSTGRES_PASSWORD=${password}` },
        { "-p": `${port}:${port}` },
        "postgres",
      ],
    });

    LOGGER.info(
      `PostgreSQL container "${CONTAINER_NAME}" is running on ${host}:${port}.`,
    );
  } catch (error) {
    LOGGER.error("Failed to start up the postgres container.", error);
    process.exit(1);
  }
};

const main = async function () {
  await loadStage();

  setupShutdownHooks();

  runDatabaseContainer();

  LOGGER.info("Database running.");
  process.stdin.resume();
};

main();
