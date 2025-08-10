import { copyFile } from "fs";
import { readFile } from "fs/promises";

import { loadStage } from "../src/utils/stage";
import Logger from "../src/utils/logger";
import { rl, askQuestion } from "../src/utils/prompt";
import { runSqlScript } from "../src/utils/sql";
import { File, uploadFile } from "../src/utils/storage";

async function main() {
  // Loading the stage variable
  await loadStage();

  // Import the environment variables
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

  // Readin user input
  const schemaOnly: boolean =
    /y/i.test(await askQuestion("Schema-only backup [yes/no]", "no")) || false;
  const makeStorageCopy: boolean =
    /y/i.test(
      await askQuestion("Needs a copy to be saved on the cloud [yes/no]", "no")
    ) || false;

  // Close the input stream
  rl.close();

  // Define the output file
  const timestamp: Date = new Date();
  const output: string = `./src/database/backups/${
    schemaOnly ? "schema-only" : "full"
  }/database_backup_${stage === "dev" ? "dev" : "prod"}.tar`;

  // Format the backup command string
  const backupCommand: string = `export PGPASSWORD='${databaseDefaultUserPassword}'; pg_dump -d ${databaseVAJ} -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -F tar -f ${output} ${
    schemaOnly ? "-s" : ""
  }; unset PGPASSWORD`;

  // Start the backup process
  await runSqlScript(backupCommand, "Database backup");

  // Copy the output file to the history directory
  const copy: string = `./src/database/backups/${
    schemaOnly ? "schema-only" : "full"
  }/history/${stage === "dev" ? "dev" : "prod"}/${timestamp.toISOString()}.tar`;
  copyFile(output, copy, (error) => {
    if (error) {
      Logger.error(`The database backup file could not be copied: ${error}`);
      process.exit(1);
    }

    Logger.info(`The backup file was copied to the history directory.`);
  });

  // Make copy of the backup to the cloud storage
  if (makeStorageCopy) {
    try {
      const name: string = `database/backups/${
        schemaOnly ? "schema-only" : "full"
      }/${stage}/${timestamp.toISOString()}`;
      const content: Buffer = await readFile(copy);
      const file: File = {
        name: name,
        bucket: "VintageArchiveJunglePrivate",
        content: content,
        contentType: "application/x-tar",
      };
      await uploadFile(file);

      if (!file.id) {
        Logger.error(`The database backup file storage failed.`);
        process.exit(1);
      }

      Logger.info("The database backup file storage succeeded.");
    } catch (error) {
      Logger.error(`An error occurred during the file storage: ${error}`);
    }
  }
}

main();
