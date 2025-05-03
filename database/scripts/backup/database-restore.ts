import { fileExistsSync } from "tsconfig-paths/lib/filesystem";

import Logger from "../../../scripts/utils/logger";
import { askQuestion, rl } from "../../../scripts/utils/prompt";
import { loadStage } from "../../../scripts/utils/stage";
import { runSqlScript } from "../../../scripts/utils/sql";

async function main() {
  // Loading the stage variable
  await loadStage();

  // Import environmental variables
  const DATABASE: string =
    process.env.DATABASE_NAME || "vintage_archive_jungle";
  const USER: string = process.env.DATABASE_USER || "administrator";
  const HOST: string = process.env.DATABASE_HOST || "host";
  const PORT: string = process.env.DATABASE_PORT || "5432";
  const STAGE: string = process.env.STAGE || "dev";

  // Define the default database and user
  const defaultDatabase: string = "template1";
  const defaultUser: string = "postgres";

  // Path to database backups
  const fullDbBackup: string =
    process.cwd() +
    `/database/backups/full/database_backup_${
      STAGE === "dev" ? "dev" : "prod"
    }.tar`;
  const schemaOnlyDbBackup: string =
    process.cwd() +
    `/database/backups/schema-only/database_backup_${
      STAGE === "dev" ? "dev" : "prod"
    }.tar`;

  // Readin user input
  const database: string =
    (await askQuestion(`Database name (default: ${DATABASE}): `)) || DATABASE;
  const host: string =
    (await askQuestion(`Host name (default: ${HOST}): `)) || HOST;
  const port: string = (await askQuestion(`Port (default: ${PORT}): `)) || PORT;
  const user: string = (await askQuestion(`User (default: ${USER}): `)) || USER;

  // Determine whether to restore the entire or schema database
  let schemaOnly: boolean;
  if (fileExistsSync(fullDbBackup) && fileExistsSync(schemaOnlyDbBackup)) {
    schemaOnly =
      /y/i.test(
        await askQuestion("Schema-only backup [yes/no] (default: no): ")
      ) || false;
  } else if (
    !fileExistsSync(fullDbBackup) &&
    fileExistsSync(schemaOnlyDbBackup)
  ) {
    schemaOnly = true;
  } else if (
    fileExistsSync(fullDbBackup) &&
    !fileExistsSync(schemaOnlyDbBackup)
  ) {
    schemaOnly = false;
  } else {
    Logger.error("No database backup file could be retrieved.");
    return;
  }

  // Determine the backup file to restore the database from
  let path: string;
  if (!schemaOnly) {
    path =
      (await askQuestion(
        `Enter path to database backup (default: ${fullDbBackup}): `
      )) || fullDbBackup;
  } else {
    path =
      (await askQuestion(
        `Enter path to database backup (default: ${schemaOnlyDbBackup}): `
      )) || schemaOnlyDbBackup;
  }

  // Close the input stream
  rl.close();

  // Format the database restore command
  const restoreCommand: string = `pg_restore -h ${host} -p ${port} -U ${defaultUser} -C -c --if-exists -d ${defaultDatabase} ${path}`;

  // Start the database restore process
  await runSqlScript(restoreCommand, "Database restore");
}

main();
