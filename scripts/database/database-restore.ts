import path from "path";
import { cwd } from "process";
import { rm, writeFile } from "fs/promises";

import { loadStage } from "../../src/utils/stage";
import { runCommand } from "../../src/utils/process";
import { downloadFile, findBucket, listFiles } from "../../src/utils/storage";
import { logger } from "../../src/utils/logger";

const LOGGER = logger.get({
  source: "scripts",
  module: path.basename(__filename)
});

const tmp = `${cwd()}/src/database/.backup.tar`;
const directory = "database/backups/";

async function dropDatabase(args: {
    database: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
    const {database, defaultUserName, defaultUserPassword, host, port} = args;
    const dropCommand = `export PGPASSWORD='${defaultUserPassword}'; dropdb -h ${host} -p ${port} -U ${defaultUserName} -f ${database}; unset PGPASSWORD`;
    await runCommand(dropCommand, "Database drop");
}

async function retrieveBackup() {

  const bucket = findBucket("private");
  let backups = await listFiles(bucket, directory);
  if (backups.length === 0) {
    LOGGER.error("No backup file retrieved.");
    process.exit(1);
  }

  backups = backups.sort((fileA, fileB) => {
    const timeStampA = Number(fileA.name.replace(".tar", ""));
    const timeStampB = Number(fileB.name.replace(".tar", ""));
    return timeStampB - timeStampA;
  });
  const file = backups[0];

  await downloadFile(file);

  try {
    await writeFile(tmp, file.content as Buffer);
  } catch (error) {
    LOGGER.error(`Unable to write backup file: ${error}`);
    process.exit(1);
  }
}

async function restoreDatabase(args: {
    defaultDatabase: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
  const {defaultDatabase, defaultUserName, defaultUserPassword, host, port} = args;
  const restoreCommand: string = `export PGPASSWORD='${defaultUserPassword}'; pg_restore -h ${host} -p ${port} -U ${defaultUserName} -C -c --if-exists -d ${defaultDatabase} ${tmp}; unset PGPASSWORD`;
  await runCommand(restoreCommand, "Database backup");

  try {
    await rm(tmp);
  } catch (error) {
    LOGGER.error(`Failed to remove backup: ${error}`);
    process.exit(1);
  }
}

async function main() {
  await loadStage();

  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  const defaultDatabase = process.env.DATABASE_DEFAULT;
  const defaultUserName = process.env.DATABASE_DEFAULT_USER_NAME;
  const defaultUserPassword = process.env.DATABASE_DEFAULT_USER_PASSWORD;

  const database = process.env.DATABASE_VAJ;

  if (!host || !port || !defaultUserPassword || !defaultUserName || !defaultDatabase || !database) {
      LOGGER.error("Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_DEFAULT_USER_NAME, DATABASE_DEFAULT, DATABASE_HOST, DATBASE_PORT, or DATABASE_VAJ.");
      process.exit(1);
  }

  await dropDatabase({ database, defaultUserName, defaultUserPassword, host, port });
  await retrieveBackup();
  await restoreDatabase({ defaultDatabase, defaultUserName, defaultUserPassword, host, port });
}

main();
