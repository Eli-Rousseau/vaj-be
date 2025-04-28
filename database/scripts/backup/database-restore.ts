import { exec } from "child_process";
import { fileExistsSync } from "tsconfig-paths/lib/filesystem";

import { askQuestion, rl } from "../../../scripts/utils/prompt";
import { loadStage } from "../../../scripts/utils/stage";
import Logger from "../../../scripts/utils/logger";

async function main() {
  // Loading the stage variable
  await loadStage();

  // Import environmental variables
  const DATABASE: string =
    process.env.DATABASE_NAME || "vintage_archive_jungle";
  const USER: string = process.env.DATABASE_USER || "administrator";

  // Path to database backups
  const entireDatabasePath: string =
    process.cwd() + "/database/backups/full/database_backup.tar";
  const schemaOnlyDatabasePath: string =
    process.cwd() + "/database/backups/schema-only/database_backup.tar";

  // Readin user input
  const database: string =
    (await askQuestion(`Database name (default: ${DATABASE}): `)) || DATABASE;
  const user: string = (await askQuestion(`User (default: ${USER}): `)) || USER;

  // Determine whether to restore the entire or schema database
  let schemaOnly: boolean;
  if (
    fileExistsSync(entireDatabasePath) &&
    fileExistsSync(schemaOnlyDatabasePath)
  ) {
    schemaOnly =
      /y/i.test(
        await askQuestion("Schema-only backup [yes/no] (default: no): ")
      ) || false;
  } else if (
    !fileExistsSync(entireDatabasePath) &&
    fileExistsSync(schemaOnlyDatabasePath)
  ) {
    schemaOnly = true;
  } else if (
    fileExistsSync(entireDatabasePath) &&
    !fileExistsSync(schemaOnlyDatabasePath)
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
        `Enter path to database backup (default: ${entireDatabasePath}): `
      )) || entireDatabasePath;
  } else {
    path =
      (await askQuestion(
        `Enter path to database backup (default: ${schemaOnlyDatabasePath}): `
      )) || schemaOnlyDatabasePath;
  }

  // Close the input stream
  rl.close();

  // Format the database restore command
  const command: string = `pg_restore -U ${user} -c -C -d ${database} -v ${path}`;

  // Start the database restore process
  exec(command, (error, stdout, stderr) => {
    if (error) {
      Logger.error(`The database restore process failed: ${error}`);
      return;
    }

    if (stderr) {
      Logger.error(
        `The database backup process generated an error stream: ${stderr}`
      );
      return;
    }

    Logger.info(
      `The database backup process terminated with an output stream: ${stdout}`
    );
  });
}

main();
