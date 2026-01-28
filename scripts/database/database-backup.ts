import path from "path";
import { cwd } from "process";
import { readFile, rm } from "fs/promises";

import { loadStage } from "../../src/utils/stage";
import { logger } from "../../src/utils/logger";
import { runCommand } from "../../src/utils/process";
import { File, storage, S3ContentType } from "../../src/utils/storage";

const LOGGER = logger.get({
  source: "scripts",
  module: path.basename(__filename),
});

const tmp = `${cwd()}/src/database/.backup.tar`;
const directory = "database/backups/";

async function makeDatabaseBackup(args: {
  database: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
}) {
  const { database, defaultUserName, defaultUserPassword, host, port } = args;
  const backupCommand = `export PGPASSWORD='${defaultUserPassword}'; pg_dump -d ${database} -h ${host} -p ${port} -U ${defaultUserName} -F tar -f ${tmp}; unset PGPASSWORD`;
  await runCommand(backupCommand, "Database backup");
}

async function storeBackup() {
  let content;
  try {
    content = await readFile(tmp);
  } catch (error) {
    LOGGER.error(`Unable to read the database backup: ${error}`);
    process.exit(1);
  }

  const bucket = storage.findBucket("private");
  const key = `${directory}${Date.now().toString()}.tar`;
  const file = File.fromPlain({
    key,
    bucket,
    content,
    contentType: S3ContentType.TAR,
  });

  await storage.uploadFile(file);
  try {
    await rm(tmp);
  } catch (error) {
    LOGGER.error(`Unable to remove temporary backup: ${error}`);
    process.exit(1);
  }
}

async function main() {
  await loadStage();

  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  const database = process.env.DATABASE_VAJ;
  const defaultUserName = process.env.DATABASE_DEFAULT_USER_NAME;
  const defaultUserPassword = process.env.DATABASE_DEFAULT_USER_PASSWORD;

  if (!host || !port || !defaultUserPassword || !defaultUserName || !database) {
    LOGGER.error(
      "Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_DEFAULT_USER_NAME, DATABASE_HOST, DATBASE_PORT, or DATABASE_VAJ.",
    );
    process.exit(1);
  }

  await makeDatabaseBackup({
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
  });
  await storeBackup();

  LOGGER.info("Finished the database backup.");
}

main();
