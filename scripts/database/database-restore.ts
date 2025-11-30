import path from "path";
import { cwd } from "process";
import { rm, writeFile } from "fs/promises";

import { loadStage } from "../../src/utils/stage";
import { runCommand } from "../../src/utils/process";
import { downloadFile, File, findBucket, listFileNames, S3ContentType } from "../../src/utils/storage";
import getLogger from "../../src/utils/logger";

const logger = getLogger({
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

async function createDatabase(args: {
    defaultDatabase: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
    const {defaultDatabase, defaultUserName, defaultUserPassword, host, port} = args;
    const dbScript = `${cwd()}/src/database/setup/add_database.sql`;
    const dbCommand = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${defaultDatabase} -f "${dbScript}"; unset PGPASSWORD`;
    await runCommand(dbCommand, "Database creation");
}

async function retrieveBackup() {

  const bucket = findBucket("private");
  let backups = await listFileNames(bucket, directory);
  if (backups.length === 0) {
    logger.error("No backup file retrived.");
    process.exit(1);
  }

  backups = backups.sort((fileA, fileB) => {
    const timeStampA = Number(fileA.replace(".tar", ""));
    const timeStampB = Number(fileB.replace(".tar", ""));
    return timeStampB - timeStampA;
  });
  const backup = backups[0];

  const file = new File({
    key: `${directory}${backup}`,
    bucket: bucket,
    contentType: S3ContentType.TAR
  });
  await downloadFile(file);

  try {
    await writeFile(tmp, file.content as Buffer);
  } catch (error) {
    logger.error(`Unable to write backup file: ${error}`);
    process.exit(1);
  }
}

async function restoreDatabase(args: {
    database: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
  const {database, defaultUserName, defaultUserPassword, host, port} = args;
  const restoreCommand: string = `export PGPASSWORD='${defaultUserPassword}'; pg_restore -h ${host} -p ${port} -U ${defaultUserName} -C -c --if-exists -d ${database} ${tmp}; unset PGPASSWORD`;
  await runCommand(restoreCommand, "Database backup");

  try {
    await rm(tmp);
  } catch (error) {
    logger.error(`Failed to remove backup: ${error}`);
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
      logger.error("Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_DEFAULT_USER_NAME, DATABASE_DEFAULT, DATABASE_HOST, DATBASE_PORT, or DATABASE_VAJ.");
      process.exit(1);
  }

  await dropDatabase({ database, defaultUserName, defaultUserPassword, host, port });
  await createDatabase({ defaultDatabase, defaultUserName, defaultUserPassword, host, port });
  await retrieveBackup();
  await restoreDatabase({ database, defaultUserName, defaultUserPassword, host, port });
}

main();
