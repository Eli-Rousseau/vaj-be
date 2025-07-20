import { fileExistsSync } from "tsconfig-paths/lib/filesystem";

import Logger from "../src/utils/logger";
import { askQuestion, rl } from "../src/utils/prompt";
import { loadStage } from "../src/utils/stage";
import { runSqlScript } from "../src/utils/sql";

async function main() {
  // Loading the stage variable
  await loadStage();

  // Import environmental variables
  const databasePort: string = process.env.DATABASE_PORT || "";
  const databaseHost: string = process.env.DATABASE_HOST || "";

  const databaseVAJ: string = process.env.DATABASE_VAJ || "";
  const databaseAdminUserName: string =
    process.env.DATABASE_ADMINISTRATOR_USER_NAME || "";
  const databaseAdminUserPassword: string =
    process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD || "";

  const databaseDefault: string = process.env.DATABASE_DEFAULT || "";
  const databaseDefaultUserName: string =
    process.env.DATABASE_DEFAULT_USER_NAME || "";
  const databaseDefaultUserPassword: string =
    process.env.DATABASE_DEFAULT_USER_PASSWORD || "";

  const stage: string = process.env.STAGE!;

  // Path to database backups
  const fullDbBackup: string = `${process.cwd()}/src/database/backups/full/database_backup_${
    stage === "dev" ? "dev" : "prod"
  }.tar`;
  const schemaOnlyDbBackup: string = `${process.cwd()}/src/database/backups/schema-only/database_backup_${
    stage === "dev" ? "dev" : "prod"
  }.tar`;

  // Determine whether to restore the entire or schema database
  let schemaOnly: boolean;
  if (fileExistsSync(fullDbBackup) && fileExistsSync(schemaOnlyDbBackup)) {
    schemaOnly =
      /y/i.test(await askQuestion("Schema-only backup [yes/no]", "no")) ||
      false;
  } else if (
    !fileExistsSync(fullDbBackup) &&
    fileExistsSync(schemaOnlyDbBackup)
  ) {
    schemaOnly = true;
    Logger.debug(
      "No full database backup file could be retrieved. Defaulting to the schema only database backup."
    );
  } else if (
    fileExistsSync(fullDbBackup) &&
    !fileExistsSync(schemaOnlyDbBackup)
  ) {
    schemaOnly = false;
    Logger.debug(
      "No schema-only database backup file could be retrieved. Defaulting to the full database backup."
    );
  } else {
    Logger.error(
      "No database backup file could be retrieved. Please, run the following command first:\nnpm run database-backup dev"
    );
    process.exit(1);
  }

  // Close the input stream
  rl.close();

  // Format the database restore command
  const restoreCommand: string = `export PGPASSWORD='${databaseDefaultUserPassword}'; pg_restore -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -C -c --if-exists -d ${databaseDefault} ${
    schemaOnly ? schemaOnlyDbBackup : fullDbBackup
  }; unset PGPASSWORD`;

  // Start the database restore process
  await runSqlScript(restoreCommand, "Database restore");
}

main();
